import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { calculateSettlementSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { SettlementStatus, WeddingStatus, UserRole } from '@grand-bandhan/shared';

export async function getSettlement(req: AuthenticatedRequest, res: Response): Promise<void> {
  const weddingId = String(req.params.weddingId);
  try {
    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        settlement: true,
        weddingVendors: { include: { vendor: true } },
        payments: true,
      },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const totalVendorAgreed = wedding.weddingVendors.reduce((sum, v) => sum + (v.agreedAmount || 0), 0);
    const clientPaid = wedding.payments
      .filter((p) => p.type === 'CLIENT_MILESTONE')
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const vendorPaid = wedding.payments
      .filter((p) => p.type === 'VENDOR_PAYMENT')
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

    res.json({
      success: true,
      data: {
        settlement: wedding.settlement,
        wedding,
        totalVendorAgreed,
        clientPaid,
        vendorPaid,
        clientContractTotal: wedding.budgetMin,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function saveSettlement(req: AuthenticatedRequest, res: Response): Promise<void> {
  const weddingId = String(req.params.weddingId);
  try {
    const parsed = calculateSettlementSchema.parse(req.body);

    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      include: { weddingVendors: true },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const totalVendorAgreed = wedding.weddingVendors.reduce((sum, v) => sum + (v.agreedAmount || 0), 0);
    const extraPlateCharges = (parsed.extraPlatesCount || parsed.extraGuestCount) * parsed.extraPlateRate;
    const extraVendorCharges = parsed.extraVendorHours * parsed.extraVendorHourRate;
    const unexpectedExpenses = parsed.unexpectedExpenses || 0;

    const clientAdditionalCharges = extraPlateCharges + extraVendorCharges + unexpectedExpenses;
    const totalFinalClientBill = wedding.budgetMin + clientAdditionalCharges;
    const totalFinalVendorCost = totalVendorAgreed + extraVendorCharges + unexpectedExpenses * 0.5;
    const finalAgencyProfit = totalFinalClientBill - totalFinalVendorCost;

    const settlement = await prisma.$transaction(async (tx) => {
      const s = await tx.settlement.upsert({
        where: { weddingId },
        update: {
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
          settledAt: new Date(),
          notes: parsed.notes || 'Post-wedding financial settlement verified and reconciled.',
        },
        create: {
          weddingId,
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
          settledAt: new Date(),
          notes: parsed.notes || 'Post-wedding financial settlement verified and reconciled.',
        },
      });

      await tx.wedding.update({
        where: { id: weddingId },
        data: { status: WeddingStatus.SETTLED },
      });

      await tx.auditLog.create({
        data: {
          agencyId: wedding.agencyId,
          userId: req.user?.userId || null,
          action: 'POST_WEDDING_SETTLEMENT_RECORDED',
          entity: 'Settlement',
          entityId: s.id,
          details: {
            weddingId,
            finalClientBill: totalFinalClientBill,
            totalVendorCost: totalFinalVendorCost,
            netAgencyProfit: finalAgencyProfit,
          },
        },
      });

      return s;
    });

    res.json({
      success: true,
      data: settlement,
      message: `Post-wedding settlement reconciled! Final Agency Profit: INR ${finalAgencyProfit.toLocaleString()}.`,
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}
