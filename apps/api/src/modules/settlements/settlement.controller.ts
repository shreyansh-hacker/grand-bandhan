import { Response } from 'express';
import { DataStore } from '../store';
import { calculateSettlementSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { SettlementStatus, WeddingStatus } from '@grand-bandhan/shared';

export function getSettlement(req: AuthenticatedRequest, res: Response): void {
  const weddingId = String(req.params.weddingId);
  const settlement = DataStore.settlements.findByWeddingId(weddingId);
  const wedding = DataStore.weddings.findById(weddingId);

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  // Calculate default values if not yet initialized
  const awardedVendors = DataStore.weddingVendors.listByWedding(weddingId);
  const totalVendorAgreed = awardedVendors.reduce((sum, v) => sum + (v.agreedAmount || 0), 0);
  const payments = DataStore.payments.listByWedding(weddingId);
  const clientPaid = payments
    .filter((p) => p.type === 'CLIENT_MILESTONE')
    .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const vendorPaid = payments
    .filter((p) => p.type === 'VENDOR_PAYMENT')
    .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  res.json({
    success: true,
    data: {
      settlement,
      wedding,
      totalVendorAgreed,
      clientPaid,
      vendorPaid,
      clientContractTotal: wedding.budgetMin,
    },
  });
}

export function saveSettlement(req: AuthenticatedRequest, res: Response): void {
  const weddingId = String(req.params.weddingId);
  const parsed = calculateSettlementSchema.parse(req.body);
  const wedding = DataStore.weddings.findById(weddingId);

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  const awardedVendors = DataStore.weddingVendors.listByWedding(weddingId);
  const totalVendorAgreed = awardedVendors.reduce((sum, v) => sum + (v.agreedAmount || 0), 0);

  const extraPlateCharges = (parsed.extraPlatesCount || parsed.extraGuestCount) * parsed.extraPlateRate;
  const extraVendorCharges = parsed.extraVendorHours * parsed.extraVendorHourRate;
  const unexpectedExpenses = parsed.unexpectedExpenses || 0;

  const clientAdditionalCharges = extraPlateCharges + extraVendorCharges + unexpectedExpenses;
  const totalFinalClientBill = wedding.budgetMin + clientAdditionalCharges;
  const totalFinalVendorCost = totalVendorAgreed + extraVendorCharges + (unexpectedExpenses * 0.5);
  const finalAgencyProfit = totalFinalClientBill - totalFinalVendorCost;

  const settlement = DataStore.settlements.upsert(weddingId, {
    agreedTotal: wedding.budgetMin,
    extraGuestCount: parsed.extraGuestCount,
    extraPlatesCount: parsed.extraPlatesCount,
    extraPlateCharges,
    extraVendorHours: parsed.extraVendorHours,
    extraVendorCharges,
    unexpectedExpenses,
    clientAdditionalCharges,
    vendorRemainingDue: Math.max(0, totalFinalVendorCost - totalVendorAgreed),
    finalAgencyProfit,
    status: SettlementStatus.SETTLED,
    settledAt: new Date().toISOString(),
    notes: parsed.notes || 'Post-wedding financial settlement verified and reconciled.',
  });

  // Mark wedding as settled
  DataStore.weddings.update(weddingId, { status: WeddingStatus.SETTLED });

  DataStore.auditLogs.create({
    agencyId: wedding.agencyId,
    action: 'POST_WEDDING_SETTLEMENT_RECORDED',
    entity: 'Settlement',
    entityId: settlement.id,
    details: {
      weddingId,
      finalClientBill: totalFinalClientBill,
      totalVendorCost: totalFinalVendorCost,
      netAgencyProfit: finalAgencyProfit,
    },
  });

  res.json({
    success: true,
    data: settlement,
    message: `Post-wedding settlement reconciled! Final Agency Profit: INR ${finalAgencyProfit.toLocaleString()}.`,
  });
}
