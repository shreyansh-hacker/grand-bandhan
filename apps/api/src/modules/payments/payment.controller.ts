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

    const newPaidAmount = (payment.paidAmount || 0) + parsed.paidAmount;
    let newStatus: PaymentStatus = PaymentStatus.PARTIALLY_PAID;
    if (newPaidAmount >= payment.amount) {
      newStatus = PaymentStatus.PAID;
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        paidDate: new Date(),
        paymentMethod: parsed.paymentMethod,
        transactionRef: parsed.transactionRef,
        notes: parsed.notes ? `${payment.notes || ''}\n${parsed.notes}` : payment.notes,
      },
    });

    broadcastWeddingUpdate(payment.weddingId, SOCKET_EVENTS.PAYMENT_RECORDED, { payment: updated });

    // Emit Payment Receipt Event
    await NotificationService.emit(NotificationEvent.PAYMENT_RECEIVED, {
      agencyId: payment.wedding.agencyId,
      recipientEmail: payment.wedding.clientEmail,
      recipientName: `${payment.wedding.brideName} & ${payment.wedding.groomName}`,
      data: {
        weddingCode: payment.wedding.weddingCode,
        clientName: `${payment.wedding.brideName} & ${payment.wedding.groomName}`,
        amount: parsed.paidAmount,
        milestoneName: payment.milestoneName,
        transactionRef: parsed.transactionRef,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: `Payment of INR ${parsed.paidAmount.toLocaleString()} recorded successfully with reference ${parsed.transactionRef}.`,
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}
