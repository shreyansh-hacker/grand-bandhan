import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { publicEnquirySchema, createEnquirySchema, updateEnquiryStatusSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { EnquiryStatus, PlanningForSide, UserRole, AccountStatus } from '@grand-bandhan/shared';
import { hashPassword } from '../../utils/hash';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

/**
 * Public "Plan Your Wedding" Enquiry Submission
 */
export async function createPublicEnquiry(req: Request, res: Response): Promise<void> {
  try {
    const parsed = publicEnquirySchema.parse(req.body);

    // Target agency discovery (via slug or default primary approved agency)
    const slug = (req.query.agencySlug as string) || (req.headers['x-agency-slug'] as string);
    let agency = slug
      ? await prisma.agency.findUnique({ where: { slug } })
      : await prisma.agency.findFirst({ where: { status: 'APPROVED' } });

    if (!agency) {
      agency = await prisma.agency.findFirst();
    }

    if (!agency) {
      res.status(500).json({ success: false, message: 'No registered agency available to route enquiry.' });
      return;
    }

    // Generate unique reference number: GB-ENQ-YYYY-XXXX
    let referenceNumber = `GB-ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    while (await prisma.customerEnquiry.findUnique({ where: { referenceNumber } })) {
      referenceNumber = `GB-ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const enquiry = await prisma.customerEnquiry.create({
      data: {
        agencyId: agency.id,
        referenceNumber,
        customerName: parsed.customerName.trim(),
        partnerName: parsed.partnerName?.trim() || null,
        email: parsed.email.toLowerCase().trim(),
        phone: parsed.phone.trim(),
        preferredContactMethod: parsed.preferredContactMethod || 'EMAIL',
        weddingDate: parsed.weddingDate ? new Date(parsed.weddingDate) : null,
        isDateFlexible: Boolean(parsed.isDateFlexible),
        location: parsed.location.trim(),
        guestCount: parsed.guestCount,
        minBudget: parsed.minBudget,
        maxBudget: parsed.maxBudget,
        packageType: parsed.packageType || null,
        eventsRequired: parsed.eventsRequired || [],
        servicesRequired: parsed.servicesRequired || [],
        source: parsed.source,
        planningFor: parsed.planningFor,
        status: EnquiryStatus.NEW,
        notes: parsed.notes || null,
      },
    });

    // 1. Emit Customer Confirmation
    await NotificationService.emit(NotificationEvent.NEW_ENQUIRY_RECEIVED, {
      agencyId: agency.id,
      recipientEmail: enquiry.email,
      recipientName: enquiry.customerName,
      data: {
        customerName: enquiry.customerName,
        referenceNumber: enquiry.referenceNumber,
        weddingDate: enquiry.weddingDate,
        location: enquiry.location,
        guestCount: enquiry.guestCount,
        planningFor: enquiry.planningFor,
        notes: enquiry.notes,
        phone: enquiry.phone,
      },
    }).catch((err) => console.warn('[Enquiry] Customer email notification error:', err?.message));

    // 2. Emit Internal Agency Alert
    const isUrgent = enquiry.notes?.includes('🚨') || enquiry.notes?.includes('EMERGENCY') || enquiry.notes?.includes('DISPATCH');
    const subjectPrefix = isUrgent ? '🚨 URGENT Dispatch Desk' : '👑 New Imperial Wedding Enquiry';
    await NotificationService.emit(NotificationEvent.NEW_ENQUIRY_RECEIVED, {
      agencyId: agency.id,
      recipientEmail: agency.contactEmail,
      recipientName: `${agency.name} Concierge Desk`,
      recipientRole: 'AGENCY_ADMIN',
      subject: `${subjectPrefix}: ${enquiry.referenceNumber} (${enquiry.customerName})`,
      data: {
        customerName: enquiry.customerName,
        referenceNumber: enquiry.referenceNumber,
        weddingDate: enquiry.weddingDate,
        location: enquiry.location,
        guestCount: enquiry.guestCount,
        planningFor: enquiry.planningFor,
        notes: enquiry.notes,
        phone: enquiry.phone,
        subject: `${subjectPrefix}: ${enquiry.referenceNumber} (${enquiry.customerName})`,
      },
    }).catch((err) => console.warn('[Enquiry] Agency email notification error:', err?.message));

    res.status(201).json({
      success: true,
      data: enquiry,
      referenceNumber: enquiry.referenceNumber,
      message: 'Royal wedding enquiry received and confirmed.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('Error creating public enquiry:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to submit enquiry.' });
  }
}

/**
 * Authenticated Enquiry Creation (Planner / Admin desk entry)
 */
export async function createEnquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createEnquirySchema.parse(req.body);
    const agencyId = req.user?.agencyId;

    if (!agencyId) {
      res.status(400).json({ success: false, message: 'Agency context missing' });
      return;
    }

    let referenceNumber = `GB-ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const enquiry = await prisma.customerEnquiry.create({
      data: {
        agencyId,
        referenceNumber,
        customerName: parsed.customerName.trim(),
        email: parsed.email.toLowerCase().trim(),
        phone: parsed.phone.trim(),
        weddingDate: parsed.weddingDate ? new Date(parsed.weddingDate) : null,
        location: parsed.location.trim(),
        guestCount: parsed.guestCount,
        theme: parsed.theme || null,
        minBudget: parsed.minBudget,
        maxBudget: parsed.maxBudget,
        source: parsed.source,
        planningFor: parsed.planningFor,
        status: EnquiryStatus.NEW,
        notes: parsed.notes || null,
      },
    });

    // 1. Emit Customer Confirmation Email
    await NotificationService.emit(NotificationEvent.NEW_ENQUIRY_RECEIVED, {
      agencyId,
      recipientEmail: enquiry.email,
      recipientName: enquiry.customerName,
      data: {
        customerName: enquiry.customerName,
        referenceNumber: enquiry.referenceNumber,
        weddingDate: enquiry.weddingDate,
        location: enquiry.location,
        guestCount: enquiry.guestCount,
        planningFor: enquiry.planningFor,
        notes: enquiry.notes,
        phone: enquiry.phone,
      },
    }).catch((err) => console.warn('[Enquiry] Customer email notification error:', err?.message));

    // 2. Emit Internal Agency / Admin Alert
    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (agency) {
      const isUrgent = enquiry.notes?.includes('🚨') || enquiry.notes?.includes('EMERGENCY') || enquiry.notes?.includes('DISPATCH');
      const subjectPrefix = isUrgent ? '🚨 URGENT Dispatch Desk' : '👑 New Imperial Wedding Enquiry';
      await NotificationService.emit(NotificationEvent.NEW_ENQUIRY_RECEIVED, {
        agencyId: agency.id,
        recipientEmail: agency.contactEmail,
        recipientName: `${agency.name} Concierge Desk`,
        recipientRole: 'AGENCY_ADMIN',
        subject: `${subjectPrefix}: ${enquiry.referenceNumber} (${enquiry.customerName})`,
        data: {
          customerName: enquiry.customerName,
          referenceNumber: enquiry.referenceNumber,
          weddingDate: enquiry.weddingDate,
          location: enquiry.location,
          guestCount: enquiry.guestCount,
          planningFor: enquiry.planningFor,
          notes: enquiry.notes,
          phone: enquiry.phone,
          subject: `${subjectPrefix}: ${enquiry.referenceNumber} (${enquiry.customerName})`,
        },
      }).catch((err) => console.warn('[Enquiry] Agency email notification error:', err?.message));
    }

    res.status(201).json({
      success: true,
      data: enquiry,
      message: 'Enquiry created successfully.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * List Enquiries (Tenant-Scoped)
 */
export async function listEnquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;

    const where: any = {};
    if (!isSuperAdmin) {
      if (!agencyId) {
        res.status(403).json({ success: false, message: 'Agency context missing' });
        return;
      }
      where.agencyId = agencyId;
    }

    const { status, planningFor } = req.query;
    if (status && status !== 'ALL') where.status = status;
    if (planningFor && planningFor !== 'ALL') where.planningFor = planningFor;

    const enquiries = await prisma.customerEnquiry.findMany({
      where,
      include: {
        assignedPlanner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        proposals: {
          select: { id: true, proposalNumber: true, status: true, estimatedBudget: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: enquiries,
      total: enquiries.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get Enquiry by ID (Tenant-Scoped)
 */
export async function getEnquiryById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const enquiry = await prisma.customerEnquiry.findUnique({
      where: { id },
      include: {
        assignedPlanner: { select: { id: true, name: true, email: true, phone: true } },
        proposals: true,
      },
    });

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && enquiry.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied to this enquiry' });
      return;
    }

    res.json({ success: true, data: enquiry });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Public Lookup by Reference Number
 */
export async function getEnquiryByReference(req: Request, res: Response): Promise<void> {
  const referenceNumber = req.params.referenceNumber as string;
  try {
    const enquiry = await prisma.customerEnquiry.findUnique({
      where: { referenceNumber },
      select: {
        referenceNumber: true,
        customerName: true,
        weddingDate: true,
        location: true,
        guestCount: true,
        status: true,
        planningFor: true,
        packageType: true,
        createdAt: true,
        agency: { select: { name: true, contactEmail: true, contactPhone: true } },
      },
    });

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry reference not found' });
      return;
    }

    res.json({ success: true, data: enquiry });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Assign Planner to Enquiry
 */
export async function assignPlanner(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { plannerId } = req.body;
  try {
    const enquiry = await prisma.customerEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    const planner = await prisma.user.findUnique({
      where: { id: plannerId },
      include: { agency: true },
    });

    if (!planner || (planner.agencyId !== enquiry.agencyId && req.user?.role !== UserRole.SUPER_ADMIN)) {
      res.status(400).json({ success: false, message: 'Invalid planner selection' });
      return;
    }

    const updated = await prisma.customerEnquiry.update({
      where: { id },
      data: {
        assignedPlannerId: plannerId,
        status: enquiry.status === 'NEW' ? 'CONTACTED' : enquiry.status,
      },
    });

    // Notify assigned planner
    await NotificationService.emit(NotificationEvent.ENQUIRY_ASSIGNED, {
      agencyId: enquiry.agencyId,
      recipientEmail: planner.email,
      recipientName: planner.name,
      recipientRole: 'WEDDING_PLANNER',
      data: {
        plannerName: planner.name,
        referenceNumber: enquiry.referenceNumber || enquiry.id.slice(0, 8),
        customerName: enquiry.customerName,
        customerEmail: enquiry.email,
        customerPhone: enquiry.phone,
        location: enquiry.location,
        minBudget: enquiry.minBudget,
        maxBudget: enquiry.maxBudget,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: `Enquiry assigned to planner ${planner.name}.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update Enquiry Status
 */
export async function updateEnquiryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const parsed = updateEnquiryStatusSchema.parse(req.body);

    const enquiry = await prisma.customerEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && enquiry.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const updated = await prisma.customerEnquiry.update({
      where: { id },
      data: {
        status: parsed.status,
        followUpDate: parsed.followUpDate ? new Date(parsed.followUpDate) : enquiry.followUpDate,
        notes: parsed.notes ? `${enquiry.notes || ''}\n${parsed.notes}` : enquiry.notes,
      },
    });

    // Auto-provision Client User if status transitioned to APPROVED
    const defaultTempPassword = 'RoyalClient@2026';
    let isNewUser = false;
    let provisionedUser: any = null;

    if (parsed.status === EnquiryStatus.APPROVED || parsed.status === ('APPROVED' as any)) {
      const normalizedEmail = enquiry.email.toLowerCase().trim();
      let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        const passwordHash = await hashPassword(defaultTempPassword);
        user = await prisma.user.create({
          data: {
            agencyId: enquiry.agencyId,
            email: normalizedEmail,
            passwordHash,
            role: UserRole.CLIENT,
            name: enquiry.customerName,
            phone: enquiry.phone,
            accountStatus: AccountStatus.ACTIVE,
            isActive: true,
            emailVerified: true,
          },
        });
        isNewUser = true;
      }
      provisionedUser = user;
    }

    const appUrl = process.env.APP_URL || 'https://grandbandhan.com';

    // Emit Enquiry Status Changed Event
    await NotificationService.emit(NotificationEvent.ENQUIRY_STATUS_CHANGED, {
      agencyId: enquiry.agencyId,
      recipientEmail: enquiry.email,
      recipientName: enquiry.customerName,
      recipientRole: 'CLIENT',
      data: {
        referenceNumber: enquiry.referenceNumber || enquiry.id.slice(0, 8),
        customerName: enquiry.customerName,
        oldStatus: enquiry.status,
        newStatus: parsed.status,
        notes: parsed.notes,
        loginEmail: enquiry.email,
        temporaryPassword: isNewUser ? defaultTempPassword : (provisionedUser ? 'Use your existing password' : null),
        loginUrl: `${appUrl}/login`,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Enquiry status updated successfully.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Schedule Wedding Consultation
 */
export async function scheduleConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const { consultationDate, consultationType, notes } = req.body;
    if (!consultationDate) {
      res.status(400).json({ success: false, message: 'consultationDate is required' });
      return;
    }

    const enquiry = await prisma.customerEnquiry.findUnique({
      where: { id },
      include: { assignedPlanner: { select: { id: true, name: true, email: true } } },
    });

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && enquiry.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const scheduledDate = new Date(consultationDate);
    const updated = await prisma.customerEnquiry.update({
      where: { id },
      data: {
        status: EnquiryStatus.CONSULTATION_SCHEDULED,
        followUpDate: scheduledDate,
        notes: notes ? `${enquiry.notes || ''}\nConsultation scheduled: ${notes}` : enquiry.notes,
      },
    });

    // 1. Notify Client
    await NotificationService.emit(NotificationEvent.CONSULTATION_SCHEDULED, {
      agencyId: enquiry.agencyId,
      recipientEmail: enquiry.email,
      recipientName: enquiry.customerName,
      recipientRole: 'CLIENT',
      data: {
        customerName: enquiry.customerName,
        consultationDate: scheduledDate.toISOString(),
        consultationType: consultationType || 'Video Design Consultation',
        plannerName: enquiry.assignedPlanner?.name || 'Lead Wedding Planner',
        notes,
      },
    });

    // 2. Notify Assigned Planner if assigned
    if (enquiry.assignedPlanner?.email) {
      await NotificationService.emit(NotificationEvent.CONSULTATION_SCHEDULED, {
        agencyId: enquiry.agencyId,
        recipientEmail: enquiry.assignedPlanner.email,
        recipientName: enquiry.assignedPlanner.name,
        recipientRole: 'WEDDING_PLANNER',
        data: {
          customerName: enquiry.customerName,
          consultationDate: scheduledDate.toISOString(),
          consultationType: consultationType || 'Video Design Consultation',
          plannerName: enquiry.assignedPlanner.name,
          notes,
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Consultation successfully scheduled and notifications dispatched.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
