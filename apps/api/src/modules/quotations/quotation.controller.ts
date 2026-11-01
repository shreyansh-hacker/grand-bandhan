import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import {
  createQuotationRequestSchema,
  submitVendorQuotationSchema,
  selectQuotationSchema,
} from '@grand-bandhan/validation';
import { QuotationRequestStatus, QuotationStatus, UserRole, PaymentType, PaymentMilestone, PaymentStatus } from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function listQuotationRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
  const weddingId = req.query.weddingId as string;
  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId query parameter is required' });
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

    const requests = await prisma.quotationRequest.findMany({
      where: { weddingId },
      include: {
        quotations: {
          include: { vendor: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getQuotationRequestComparison(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  try {
    const quotationRequest = await prisma.quotationRequest.findUnique({
      where: { id },
      include: {
        wedding: true,
        quotations: {
          include: { vendor: true },
        },
      },
    });

    if (!quotationRequest) {
      res.status(404).json({ success: false, message: 'Quotation request not found' });
      return;
    }

    const wedding = quotationRequest.wedding;
    const quotations = quotationRequest.quotations.map((q) => {
      const guestCount = quotationRequest.guestCount || wedding?.guestCount || 400;
      const plateCalculated = q.pricePerPlate ? q.pricePerPlate * guestCount : 0;
      const computedTotal = q.baseAmount + plateCalculated + (q.additionalCosts || 0);

      return {
        ...q,
        computedTotal,
        guestCountUsed: guestCount,
      };
    });

    res.json({
      success: true,
      data: {
        request: quotationRequest,
        wedding,
        quotations,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createQuotationRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createQuotationRequestSchema.parse(req.body);

    const wedding = await prisma.wedding.findUnique({
      where: { id: parsed.weddingId },
      select: { id: true, agencyId: true, guestCount: true },
    });

    if (!wedding) {
      res.status(404).json({ success: false, message: 'Wedding not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && wedding.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const qRequest = await prisma.quotationRequest.create({
      data: {
        weddingId: parsed.weddingId,
        category: parsed.category,
        title: parsed.title,
        guestCount: parsed.guestCount || wedding.guestCount,
        targetBudget: parsed.targetBudget || null,
        specifications: parsed.specifications,
        status: QuotationRequestStatus.INVITED,
      },
    });

    await prisma.auditLog.create({
      data: {
        agencyId: wedding.agencyId,
        userId: req.user?.userId || null,
        action: 'QUOTATION_REQUEST_CREATED',
        entity: 'QuotationRequest',
        entityId: qRequest.id,
        details: { title: qRequest.title, category: qRequest.category },
      },
    });

    res.status(201).json({ success: true, data: qRequest });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitVendorQuotation(req: Request, res: Response): Promise<void> {
  const requestId = String(req.params.requestId);
  try {
    const parsed = submitVendorQuotationSchema.parse(req.body);

    const qRequest = await prisma.quotationRequest.findUnique({
      where: { id: requestId },
      include: { quotations: true },
    });

    if (!qRequest) {
      res.status(404).json({ success: false, message: 'Quotation request not found' });
      return;
    }

    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.vendorQuotation.create({
        data: {
          quotationRequestId: requestId,
          vendorId: parsed.vendorId,
          baseAmount: parsed.baseAmount,
          pricePerPlate: parsed.pricePerPlate || null,
          extraHourRate: parsed.extraHourRate || null,
          additionalCosts: parsed.additionalCosts || 0,
          menuDetails: parsed.menuDetails || null,
          includedItems: parsed.includedItems || [],
          notes: parsed.notes || null,
          isAgencyRecommended: parsed.isAgencyRecommended || false,
          status: QuotationStatus.SUBMITTED,
        },
      });

      // If 2 or more quotes arrive, update status to COMPARING
      if (qRequest.quotations.length + 1 >= 2) {
        await tx.quotationRequest.update({
          where: { id: requestId },
          data: { status: QuotationRequestStatus.COMPARING },
        });
      }

      return q;
    });

    res.status(201).json({ success: true, data: quotation });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function selectFinalQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const requestId = String(req.params.requestId);
  try {
    const parsed = selectQuotationSchema.parse(req.body);

    const qRequest = await prisma.quotationRequest.findUnique({
      where: { id: requestId },
      include: {
        wedding: true,
        quotations: { include: { vendor: true } },
      },
    });

    if (!qRequest) {
      res.status(404).json({ success: false, message: 'Quotation request not found' });
      return;
    }

    const selectedQuote = qRequest.quotations.find((q) => q.id === parsed.selectedQuotationId);
    if (!selectedQuote) {
      res.status(404).json({ success: false, message: 'Selected quotation does not belong to this request' });
      return;
    }

    const wedding = qRequest.wedding;
    const vendor = selectedQuote.vendor;

    const guestCount = qRequest.guestCount || wedding?.guestCount || 400;
    const plateTotal = selectedQuote.pricePerPlate ? selectedQuote.pricePerPlate * guestCount : 0;
    const totalAgreed = selectedQuote.baseAmount + plateTotal + (selectedQuote.additionalCosts || 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark selected quotation
      const updatedSelected = await tx.vendorQuotation.update({
        where: { id: selectedQuote.id },
        data: {
          status: QuotationStatus.SELECTED,
          selectedAt: new Date(),
        },
      });

      // 2. Automatically close competing quotes
      await tx.vendorQuotation.updateMany({
        where: {
          quotationRequestId: requestId,
          id: { not: selectedQuote.id },
        },
        data: { status: QuotationStatus.CLOSED },
      });

      // 3. Mark request as awarded
      await tx.quotationRequest.update({
        where: { id: requestId },
        data: { status: QuotationRequestStatus.AWARDED },
      });

      // 4. Link vendor directly to wedding
      const weddingVendor = await tx.weddingVendor.upsert({
        where: {
          weddingId_vendorId: {
            weddingId: qRequest.weddingId,
            vendorId: selectedQuote.vendorId,
          },
        },
        update: {
          quotationId: selectedQuote.id,
          agreedAmount: totalAgreed,
          contractStatus: 'CONFIRMED',
          notes: parsed.selectionNotes || `Selected via Three Vendors One Decision workflow for ${qRequest.title}`,
        },
        create: {
          weddingId: qRequest.weddingId,
          vendorId: selectedQuote.vendorId,
          quotationId: selectedQuote.id,
          agreedAmount: totalAgreed,
          contractStatus: 'CONFIRMED',
          notes: parsed.selectionNotes || `Selected via Three Vendors One Decision workflow for ${qRequest.title}`,
        },
      });

      // 5. Record payment milestone in ledger
      await tx.payment.create({
        data: {
          weddingId: qRequest.weddingId,
          type: PaymentType.VENDOR_PAYMENT,
          milestoneName: PaymentMilestone.VENDOR_DISBURSEMENT,
          amount: totalAgreed,
          vendorId: selectedQuote.vendorId,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PENDING,
          notes: `Vendor contract awarded: ${vendor.name} (${qRequest.category})`,
        },
      });

      await tx.auditLog.create({
        data: {
          agencyId: wedding.agencyId,
          userId: req.user?.userId || null,
          action: 'QUOTATION_AWARDED',
          entity: 'VendorQuotation',
          entityId: selectedQuote.id,
          details: {
            weddingId: qRequest.weddingId,
            vendorName: vendor.name,
            agreedAmount: totalAgreed,
          },
        },
      });

      return { updatedSelected, weddingVendor, totalAgreed };
    });

    res.json({
      success: true,
      data: {
        awardedQuotation: result.updatedSelected,
        weddingVendor: result.weddingVendor,
        totalAgreedAmount: result.totalAgreed,
      },
      message: `Quotation accepted! ${vendor.name} has been directly linked to the wedding, and other pending requests have been automatically closed.`,
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}


export async function getVendorRfps(req: Request, res: Response): Promise<void> {
  const vendorId = (req.params.vendorId || req.query.vendorId) as string;
  try {
    let vendor = null;
    if (vendorId && vendorId !== 'all') {
      vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { quotations: true },
      });
    }

    const where: any = {};
    if (vendor) {
      where.category = vendor.category;
    }

    const rfps = await prisma.quotationRequest.findMany({
      where,
      include: {
        wedding: {
          select: {
            id: true,
            weddingCode: true,
            brideName: true,
            groomName: true,
            location: true,
            weddingDate: true,
            guestCount: true,
          },
        },
        quotations: {
          where: vendor ? { vendorId: vendor.id } : undefined,
          include: { vendor: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: {
        vendor,
        rfps,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
