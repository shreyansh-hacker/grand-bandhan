import { Request, Response } from 'express';
import { DataStore } from '../store';
import { createEnquirySchema, updateEnquiryStatusSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { EnquiryStatus, WeddingStatus, WeddingPackageType } from '@grand-bandhan/shared';

// Public submission or planner entry
export async function createEnquiry(req: Request, res: Response): Promise<void> {
  const parsed = createEnquirySchema.parse(req.body);
  const agency = DataStore.agencies.findFirst(() => true);
  const agencyId = agency ? agency.id : 'default-agency';

  const enquiry = DataStore.enquiries.create({
    agencyId,
    customerName: parsed.customerName,
    email: parsed.email,
    phone: parsed.phone,
    weddingDate: parsed.weddingDate ? new Date(parsed.weddingDate).toISOString() : null,
    location: parsed.location,
    guestCount: parsed.guestCount,
    theme: parsed.theme || null,
    minBudget: parsed.minBudget,
    maxBudget: parsed.maxBudget,
    source: parsed.source,
    planningFor: parsed.planningFor,
    status: EnquiryStatus.NEW,
    followUpDate: null,
    notes: parsed.notes || null,
  });

  DataStore.auditLogs.create({
    agencyId,
    action: 'ENQUIRY_CREATED',
    entity: 'CustomerEnquiry',
    entityId: enquiry.id,
    details: { customerName: enquiry.customerName, source: enquiry.source, planningFor: enquiry.planningFor },
  });

  res.status(201).json({
    success: true,
    data: enquiry,
    message: 'Your wedding enquiry has been submitted. Our concierge team will reach out promptly.',
  });
}

export function listEnquiries(req: AuthenticatedRequest, res: Response): void {
  const agencyId = req.user?.agencyId;
  const list = DataStore.enquiries.list(agencyId);
  res.json({ success: true, data: list });
}

export function getEnquiryById(req: AuthenticatedRequest, res: Response): void {
  const enquiry = DataStore.enquiries.findById(String(req.params.id));
  if (!enquiry) {
    res.status(404).json({ success: false, message: 'Enquiry not found' });
    return;
  }
  res.json({ success: true, data: enquiry });
}

export function updateEnquiryStatus(req: AuthenticatedRequest, res: Response): void {
  const parsed = updateEnquiryStatusSchema.parse(req.body);
  const enquiry = DataStore.enquiries.update(String(req.params.id), {
    status: parsed.status,
    followUpDate: parsed.followUpDate ? new Date(parsed.followUpDate).toISOString() : null,
    ...(parsed.notes ? { notes: parsed.notes } : {}),
  });

  if (!enquiry) {
    res.status(404).json({ success: false, message: 'Enquiry not found' });
    return;
  }

  res.json({ success: true, data: enquiry });
}

// Convert Enquiry to Confirmed Wedding Project
export function convertEnquiryToWedding(req: AuthenticatedRequest, res: Response): void {
  const enquiry = DataStore.enquiries.findById(String(req.params.id));
  if (!enquiry) {
    res.status(404).json({ success: false, message: 'Enquiry not found' });
    return;
  }

  const { packageType, brideName, groomName } = req.body;

  const wedding = DataStore.weddings.create({
    agencyId: enquiry.agencyId,
    brideName: brideName || (enquiry.planningFor === 'BRIDE_SIDE' ? enquiry.customerName : 'Bride'),
    groomName: groomName || (enquiry.planningFor === 'GROOM_SIDE' ? enquiry.customerName : 'Groom'),
    clientEmail: enquiry.email,
    clientPhone: enquiry.phone,
    weddingDate: enquiry.weddingDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    location: enquiry.location,
    guestCount: enquiry.guestCount,
    budgetMin: enquiry.minBudget,
    budgetMax: enquiry.maxBudget,
    packageType: packageType || WeddingPackageType.FULL_SERVICE,
    status: WeddingStatus.CONFIRMED,
    plannerId: req.user?.userId || null,
    notes: enquiry.notes,
  });

  // Update enquiry status
  DataStore.enquiries.update(enquiry.id, {
    status: EnquiryStatus.CONVERTED,
    convertedWeddingId: wedding.id,
  });

  // Create initial digital agreement draft
  DataStore.agreements.create({
    weddingId: wedding.id,
    termsContent: `SERVICE AGREEMENT FOR WEDDING PLANNING & MANAGEMENT SERVICES\n\nClient: ${wedding.brideName} & ${wedding.groomName}\nPackage: ${wedding.packageType}\nGuest Count: ${wedding.guestCount}\nLocation: ${wedding.location}\n\nTerms & Conditions:\n1. Scope of work encompasses comprehensive wedding planning and day-of execution as agreed.\n2. Payment milestones: 25% booking deposit, 50% advance 30 days prior, 25% post-wedding settlement.\n3. Cancellation policies and vendor terms apply as per signed contracts.`,
  });

  res.json({
    success: true,
    data: { wedding, enquiry },
    message: 'Enquiry successfully converted to Wedding project with digital agreement generated.',
  });
}
