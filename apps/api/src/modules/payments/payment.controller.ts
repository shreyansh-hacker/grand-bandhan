import { Response } from 'express';
import { DataStore } from '../store';
import { createPaymentMilestoneSchema, recordPaymentTransactionSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { PaymentStatus, SOCKET_EVENTS } from '@grand-bandhan/shared';
import { broadcastWeddingUpdate } from '../../socket';

export function listPayments(req: AuthenticatedRequest, res: Response): void {
  const weddingId = req.query.weddingId as string;
  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId is required' });
    return;
  }

  const payments = DataStore.payments.listByWedding(weddingId);
  const enriched = payments.map((p) => {
    const vendor = p.vendorId ? DataStore.vendors.findById(p.vendorId) : null;
    return { ...p, vendor };
  });

  res.json({ success: true, data: enriched });
}

export function createPaymentMilestone(req: AuthenticatedRequest, res: Response): void {
  const parsed = createPaymentMilestoneSchema.parse(req.body);

  const payment = DataStore.payments.create({
    weddingId: parsed.weddingId,
    milestoneName: parsed.milestoneName,
    amount: parsed.amount,
    dueDate: new Date(parsed.dueDate).toISOString(),
    status: PaymentStatus.PENDING,
    notes: parsed.notes || null,
  });

  res.status(201).json({ success: true, data: payment });
}

export function recordPaymentTransaction(req: AuthenticatedRequest, res: Response): void {
  const id = String(req.params.id);
  const parsed = recordPaymentTransactionSchema.parse(req.body);

  const payment = DataStore.payments.findById(id);
  if (!payment) {
    res.status(404).json({ success: false, message: 'Payment record not found' });
    return;
  }

  const newPaidAmount = (payment.paidAmount || 0) + parsed.paidAmount;
  let newStatus: PaymentStatus = PaymentStatus.PARTIALLY_PAID;
  if (newPaidAmount >= payment.amount) {
    newStatus = PaymentStatus.PAID;
  }

  const updated = DataStore.payments.update(id, {
    paidAmount: newPaidAmount,
    status: newStatus,
    paidDate: new Date().toISOString(),
    paymentMethod: parsed.paymentMethod,
    transactionRef: parsed.transactionRef,
    notes: parsed.notes || payment.notes,
  });

  broadcastWeddingUpdate(payment.weddingId, SOCKET_EVENTS.PAYMENT_RECORDED, { payment: updated });

  res.json({
    success: true,
    data: updated,
    message: `Payment of INR ${parsed.paidAmount.toLocaleString()} recorded successfully with reference ${parsed.transactionRef}.`,
  });
}
