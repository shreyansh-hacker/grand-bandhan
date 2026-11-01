import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { createPaymentMilestoneSchema, recordPaymentTransactionSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { PaymentStatus, SOCKET_EVENTS, UserRole } from '@grand-bandhan/shared';
import { broadcastWeddingUpdate } from '../../socket';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

export async function listPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
  const weddingId = req.query.weddingId as string;
  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId is required' });
    return;
  }

  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      select: { agencyId: true },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const payments = await prisma.payment.findMany({
      where: { weddingId },
      include: { vendor: true },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createPaymentMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createPaymentMilestoneSchema.parse(req.body);

    const wedding = await prisma.wedding.findUnique({
      where: { id: parsed.weddingId },
      select: { agencyId: true },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        weddingId: parsed.weddingId,
        milestoneName: parsed.milestoneName,
        amount: parsed.amount,
        dueDate: new Date(parsed.dueDate),
        status: PaymentStatus.PENDING,
        notes: parsed.notes || null,
      },
    });

    res.status(201).json({ success: true, data: payment });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function recordPaymentTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  try {
    const parsed = recordPaymentTransactionSchema.parse(req.body);
    const cleanRef = parsed.transactionRef.trim();

    // Execute atomic payment recording inside database transaction with row locking
    const result = await prisma.$transaction(async (tx) => {
      // 0. Acquire global PostgreSQL transaction-level advisory lock on the transactionRef
      // Serializes concurrent requests presenting the same transaction reference across ALL payment milestones,
      // weddings, and agencies before any read or write, guaranteeing strict serializability.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'payment_txn:' + cleanRef}))`;

      // 1. Acquire pessimistic row lock on the Payment record to prevent race conditions on paidAmount
      const rows = await tx.$queryRaw<Array<any>>`
        SELECT p.*, w."agencyId", w."weddingCode", w."clientEmail", w."brideName", w."groomName"
        FROM "Payment" p
        JOIN "Wedding" w ON p."weddingId" = w."id"
        WHERE p."id" = ${id}
        FOR UPDATE OF p
      `;

      if (!rows || rows.length === 0) {
        const error: any = new Error('Payment record not found');
        error.statusCode = 404;
        throw error;
      }

      const payment = rows[0];

      // 2. Strict Agency Isolation & RBAC
      if (req.user && req.user.role !== UserRole.SUPER_ADMIN && payment.agencyId !== req.user.agencyId) {
        const error: any = new Error('Access denied: Payment milestone belongs to another agency');
        error.statusCode = 403;
        throw error;
      }

      // 3. Duplicate Transaction Reference Prevention across different payments
      const existingOnOtherPayment = await tx.payment.findFirst({
        where: {
          id: { not: id },
          OR: [
            { transactionRef: cleanRef },
            { notes: { contains: `[TXN: ${cleanRef}]` } },
          ],
        },
        select: { id: true, milestoneName: true },
      });

      if (existingOnOtherPayment) {
        const error: any = new Error(
          `Duplicate transaction reference: "${cleanRef}" has already been processed on another milestone (${existingOnOtherPayment.milestoneName}).`
        );
        error.statusCode = 409;
        throw error;
      }

      // 4. Idempotent Replay Check on this specific milestone
      const alreadyHasThisRef =
        payment.transactionRef === cleanRef ||
        (payment.notes && payment.notes.includes(`[TXN: ${cleanRef}]`));

      if (alreadyHasThisRef) {
        // Find existing transaction audit log to verify amount match
        const existingTxnLog = await tx.auditLog.findFirst({
          where: {
            action: 'PAYMENT_TRANSACTION',
            entity: 'Payment',
            entityId: id,
            details: {
              path: ['transactionRef'],
              equals: cleanRef,
            },
          },
        });

        // If exact transaction was already recorded with same amount, return idempotent replay
        if (existingTxnLog) {
          const details = existingTxnLog.details as any;
          if (details && Math.abs(details.paidAmount - parsed.paidAmount) < 0.01) {
            return {
              payment,
              isIdempotentReplay: true,
              message: `Payment transaction ${cleanRef} was previously processed successfully (idempotent replay).`,
            };
          }
        }

        // If ref matches but amount differs, reject conflict
        const error: any = new Error(
          `Duplicate transaction reference: "${cleanRef}" was already recorded with different parameters.`
        );
        error.statusCode = 409;
        throw error;
      }

      // 5. Already Settled Milestone Guard
      const currentPaid = Number(payment.paidAmount) || 0;
      const milestoneAmount = Number(payment.amount);

      if (payment.status === PaymentStatus.PAID || currentPaid >= milestoneAmount) {
        const error: any = new Error(
          `Payment milestone "${payment.milestoneName}" is already fully settled (Paid: INR ${currentPaid.toLocaleString()} of ${milestoneAmount.toLocaleString()}). No additional payments accepted.`
        );
        error.statusCode = 400;
        throw error;
      }

      // 6. Calculate cumulative paid amount and determine status & surplus
      const newPaidAmount = currentPaid + parsed.paidAmount;
      let newStatus: PaymentStatus = PaymentStatus.PARTIALLY_PAID;
      let surplusAmount = 0;

      if (newPaidAmount >= milestoneAmount) {
        newStatus = PaymentStatus.PAID;
        if (newPaidAmount > milestoneAmount) {
          surplusAmount = newPaidAmount - milestoneAmount;
        }
      }

      // 7. Structure audit note & append to transaction history
      const surplusNote =
        surplusAmount > 0
          ? ` [OVERPAYMENT SURPLUS: INR ${surplusAmount.toLocaleString()} credited to wedding account]`
          : '';
      const txnEntry = `[TXN: ${cleanRef}] Paid INR ${parsed.paidAmount.toLocaleString()} via ${parsed.paymentMethod} on ${new Date().toISOString()}${surplusNote}`;

      const updatedNotes = payment.notes
        ? `${payment.notes}\n${txnEntry}${parsed.notes ? ` (Note: ${parsed.notes})` : ''}`
        : `${txnEntry}${parsed.notes ? ` (Note: ${parsed.notes})` : ''}`;

      const updatedRefs = payment.transactionRef
        ? `${payment.transactionRef}, ${cleanRef}`
        : cleanRef;

      // 8. Atomically update Payment record
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
          paidDate: new Date(),
          paymentMethod: parsed.paymentMethod,
          transactionRef: updatedRefs,
          notes: updatedNotes,
        },
      });

      // 9. Record atomic AuditLog entry with structured details for auditing & idempotency
      let auditUserId: string | null = null;
      if (req.user?.userId) {
        const u = await tx.user.findUnique({
          where: { id: req.user.userId },
          select: { id: true },
        });
        if (u) auditUserId = u.id;
      }

      await tx.auditLog.create({
        data: {
          agencyId: payment.agencyId,
          userId: auditUserId,
          action: 'PAYMENT_TRANSACTION',
          entity: 'Payment',
          entityId: id,
          details: {
            transactionRef: cleanRef,
            paidAmount: parsed.paidAmount,
            previousPaidAmount: currentPaid,
            newPaidAmount,
            milestoneAmount,
            surplusAmount,
            status: newStatus,
            paymentMethod: parsed.paymentMethod,
            weddingId: payment.weddingId,
          },
        },
      });

      return {
        payment: updatedPayment,
        isIdempotentReplay: false,
        wedding: {
          agencyId: payment.agencyId,
          weddingCode: payment.weddingCode,
          clientEmail: payment.clientEmail,
          brideName: payment.brideName,
          groomName: payment.groomName,
        },
        surplusAmount,
        message:
          surplusAmount > 0
            ? `Payment of INR ${parsed.paidAmount.toLocaleString()} recorded successfully with reference ${cleanRef}. Milestone settled with INR ${surplusAmount.toLocaleString()} surplus.`
            : `Payment of INR ${parsed.paidAmount.toLocaleString()} recorded successfully with reference ${cleanRef}.`,
      };
    });

    // If this was an idempotent replay, return immediately without re-emitting socket/notifications
    if (result.isIdempotentReplay) {
      res.json({
        success: true,
        data: result.payment,
        message: result.message,
        isIdempotentReplay: true,
      });
      return;
    }

    // 10. Broadcast real-time update and emit notification outside transaction
    broadcastWeddingUpdate(result.payment.weddingId, SOCKET_EVENTS.PAYMENT_RECORDED, {
      payment: result.payment,
    });

    if (result.wedding?.clientEmail) {
      await NotificationService.emit(NotificationEvent.PAYMENT_RECEIVED, {
        agencyId: result.wedding.agencyId,
        recipientEmail: result.wedding.clientEmail,
        recipientName: `${result.wedding.brideName} & ${result.wedding.groomName}`,
        data: {
          weddingCode: result.wedding.weddingCode,
          clientName: `${result.wedding.brideName} & ${result.wedding.groomName}`,
          amount: parsed.paidAmount,
          milestoneName: result.payment.milestoneName,
          transactionRef: cleanRef,
        },
      }).catch((notifErr: any) =>
        console.warn('[Payment] Notification dispatch error:', notifErr.message)
      );
    }

    res.json({
      success: true,
      data: result.payment,
      message: result.message,
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    const status = err.statusCode || 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

export async function recordPaymentFailure(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const { reason, amount } = req.body;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        wedding: { select: { agencyId: true, weddingCode: true, clientEmail: true, brideName: true, groomName: true } },
      },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && payment.wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        notes: reason ? `${payment.notes || ''}\nPayment attempt failed: ${reason}` : payment.notes,
      },
    });

    // Emit Payment Failed Notification
    if (payment.wedding.clientEmail) {
      await NotificationService.emit(NotificationEvent.PAYMENT_FAILED, {
        agencyId: payment.wedding.agencyId,
        recipientEmail: payment.wedding.clientEmail,
        recipientName: `${payment.wedding.brideName} & ${payment.wedding.groomName}`,
        recipientRole: 'CLIENT',
        data: {
          weddingCode: payment.wedding.weddingCode,
          clientName: `${payment.wedding.brideName} & ${payment.wedding.groomName}`,
          amount: amount || payment.amount,
          milestoneName: payment.milestoneName,
          reason: reason || 'Gateway transaction declined',
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Payment failure recorded and client notified.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function sendPaymentReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        wedding: { select: { agencyId: true, weddingCode: true, clientEmail: true, brideName: true, groomName: true } },
      },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && payment.wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    if (payment.wedding.clientEmail) {
      await NotificationService.emit(NotificationEvent.PAYMENT_DUE, {
        agencyId: payment.wedding.agencyId,
        recipientEmail: payment.wedding.clientEmail,
        recipientName: `${payment.wedding.brideName} & ${payment.wedding.groomName}`,
        recipientRole: 'CLIENT',
        data: {
          weddingCode: payment.wedding.weddingCode,
          clientName: `${payment.wedding.brideName} & ${payment.wedding.groomName}`,
          amount: payment.amount - (payment.paidAmount || 0),
          milestoneName: payment.milestoneName,
          dueDate: payment.dueDate ? payment.dueDate.toISOString() : undefined,
        },
      });
    }

    res.json({
      success: true,
      message: 'Payment reminder dispatched to client.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
