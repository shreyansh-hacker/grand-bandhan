import { Request, Response } from 'express';
import { DataStore } from '../store';
import {
  createQuotationRequestSchema,
  submitVendorQuotationSchema,
  selectQuotationSchema,
} from '@grand-bandhan/validation';
import { QuotationRequestStatus, QuotationStatus } from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';

export function listQuotationRequests(req: AuthenticatedRequest, res: Response): void {
  const weddingId = req.query.weddingId as string;
  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId query parameter is required' });
    return;
  }

  const requests = DataStore.quotationRequests.listByWedding(weddingId);
  const enriched = requests.map((req) => {
    const quotes = DataStore.quotations.listByRequest(req.id).map((q) => {
      const vendor = DataStore.vendors.findById(q.vendorId);
      return { ...q, vendor };
    });
    return { ...req, quotations: quotes };
  });

  res.json({ success: true, data: enriched });
}

export function getQuotationRequestComparison(req: Request, res: Response): void {
  const id = String(req.params.id);
  const quotationRequest = DataStore.quotationRequests.findById(id);

  if (!quotationRequest) {
    res.status(404).json({ success: false, message: 'Quotation request not found' });
    return;
  }

  const wedding = DataStore.weddings.findById(quotationRequest.weddingId);
  const quotations = DataStore.quotations.listByRequest(id).map((q) => {
    const vendor = DataStore.vendors.findById(q.vendorId);
    const guestCount = quotationRequest.guestCount || wedding?.guestCount || 400;
    const plateCalculated = q.pricePerPlate ? q.pricePerPlate * guestCount : 0;
    const computedTotal = q.baseAmount + plateCalculated + (q.additionalCosts || 0);

    return {
      ...q,
      vendor,
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
}

export function createQuotationRequest(req: AuthenticatedRequest, res: Response): void {
  const parsed = createQuotationRequestSchema.parse(req.body);
  const wedding = DataStore.weddings.findById(parsed.weddingId);

  if (!wedding) {
    res.status(404).json({ success: false, message: 'Wedding not found' });
    return;
  }

  const qRequest = DataStore.quotationRequests.create({
    weddingId: parsed.weddingId,
    category: parsed.category,
    title: parsed.title,
    guestCount: parsed.guestCount || wedding.guestCount,
    targetBudget: parsed.targetBudget || null,
    specifications: parsed.specifications,
    status: QuotationRequestStatus.INVITED,
  });

  DataStore.auditLogs.create({
    agencyId: wedding.agencyId,
    action: 'QUOTATION_REQUEST_CREATED',
    entity: 'QuotationRequest',
    entityId: qRequest.id,
    details: { title: qRequest.title, category: qRequest.category, invitedCount: parsed.invitedVendorIds.length },
  });

  res.status(201).json({ success: true, data: qRequest });
}

export function submitVendorQuotation(req: Request, res: Response): void {
  const requestId = String(req.params.requestId);
  const parsed = submitVendorQuotationSchema.parse(req.body);

  const qRequest = DataStore.quotationRequests.findById(requestId);
  if (!qRequest) {
    res.status(404).json({ success: false, message: 'Quotation request not found' });
    return;
  }

  const quotation = DataStore.quotations.create({
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
  });

  // Advance request to comparing if multiple quotes arrive
  const allQuotes = DataStore.quotations.listByRequest(requestId);
  if (allQuotes.length >= 2) {
    DataStore.quotationRequests.update(requestId, { status: QuotationRequestStatus.COMPARING });
  }

  res.status(201).json({ success: true, data: quotation });
}

export function selectFinalQuotation(req: AuthenticatedRequest, res: Response): void {
  const requestId = String(req.params.requestId);
  const parsed = selectQuotationSchema.parse(req.body);

  const qRequest = DataStore.quotationRequests.findById(requestId);
  if (!qRequest) {
    res.status(404).json({ success: false, message: 'Quotation request not found' });
    return;
  }

  const selectedQuote = DataStore.quotations.findById(parsed.selectedQuotationId);
  if (!selectedQuote || selectedQuote.quotationRequestId !== requestId) {
    res.status(404).json({ success: false, message: 'Selected quotation does not belong to this request' });
    return;
  }

  const wedding = DataStore.weddings.findById(qRequest.weddingId);
  const vendor = DataStore.vendors.findById(selectedQuote.vendorId);

  // 1. Mark selected quotation
  DataStore.quotations.update(selectedQuote.id, {
    status: QuotationStatus.SELECTED,
    selectedAt: new Date().toISOString(),
  });

  // 2. Automatically close and preserve other competing quotes
  const allQuotes = DataStore.quotations.listByRequest(requestId);
  for (const quote of allQuotes) {
    if (quote.id !== selectedQuote.id) {
      DataStore.quotations.update(quote.id, { status: QuotationStatus.CLOSED });
    }
  }

  // 3. Mark request as awarded
  DataStore.quotationRequests.update(requestId, { status: QuotationRequestStatus.AWARDED });

  // 4. Calculate total agreed amount
  const guestCount = qRequest.guestCount || wedding?.guestCount || 400;
  const plateTotal = selectedQuote.pricePerPlate ? selectedQuote.pricePerPlate * guestCount : 0;
  const totalAgreed = selectedQuote.baseAmount + plateTotal + (selectedQuote.additionalCosts || 0);

  // 5. Link vendor directly to wedding
  const weddingVendor = DataStore.weddingVendors.create({
    weddingId: qRequest.weddingId,
    vendorId: selectedQuote.vendorId,
    quotationId: selectedQuote.id,
    agreedAmount: totalAgreed,
    contractStatus: 'CONFIRMED',
    notes: parsed.selectionNotes || `Selected via Three Vendors One Decision workflow for ${qRequest.title}`,
  });

  // 6. Record payment milestone in ledger for this vendor
  DataStore.payments.create({
    weddingId: qRequest.weddingId,
    type: 'VENDOR_PAYMENT',
    milestoneName: 'VENDOR_DISBURSEMENT',
    amount: totalAgreed,
    vendorId: selectedQuote.vendorId,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    notes: `Vendor contract awarded: ${vendor?.name || 'Vendor'} (${qRequest.category})`,
  });

  DataStore.auditLogs.create({
    agencyId: wedding?.agencyId || 'default-agency',
    action: 'QUOTATION_AWARDED',
    entity: 'VendorQuotation',
    entityId: selectedQuote.id,
    details: {
      weddingId: qRequest.weddingId,
      vendorName: vendor?.name,
      agreedAmount: totalAgreed,
      competingQuotesClosed: allQuotes.length - 1,
    },
  });

  res.json({
    success: true,
    data: {
      awardedQuotation: selectedQuote,
      weddingVendor,
      totalAgreedAmount: totalAgreed,
    },
    message: `Quotation accepted! ${vendor?.name} has been directly linked to the wedding, and other pending requests have been automatically closed.`,
  });
}
