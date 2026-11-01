import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import {
  scheduleConsultationSchema,
  rescheduleConsultationSchema,
  completeConsultationSchema,
} from '@grand-bandhan/validation';
import {
  ConsultationStatus,
  ConsultationType,
  EnquiryStatus,
  UserRole,
} from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

/**
 * Schedule First Wedding Consultation (Online Video or In-Person)
 */
export async function scheduleConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = scheduleConsultationSchema.parse(req.body);
    const agencyId = req.user?.agencyId;

    const enquiry = await prisma.customerEnquiry.findUnique({
      where: { id: parsed.enquiryId },
      include: {
        agency: true,
        assignedPlanner: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Customer enquiry not found' });
      return;
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && enquiry.agencyId !== agencyId) {
      res.status(403).json({ success: false, message: 'Access denied to this enquiry' });
      return;
    }

    const scheduledDate = new Date(parsed.scheduledAt);
    const plannerId = parsed.plannerId || enquiry.assignedPlannerId;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Consultation record
      const consultation = await tx.weddingConsultation.create({
        data: {
          enquiryId: parsed.enquiryId,
          agencyId: enquiry.agencyId,
          plannerId: plannerId || null,
          scheduledAt: scheduledDate,
          meetingType: parsed.meetingType || ConsultationType.ONLINE_VIDEO,
          meetingLink: parsed.meetingLink || (parsed.meetingType === ConsultationType.ONLINE_VIDEO ? 'https://meet.google.com/grb-wed-royal' : null),
          meetingLocation: parsed.meetingLocation || (parsed.meetingType === ConsultationType.IN_PERSON ? `${enquiry.location || 'Udaipur'} Palace Planning Lounge` : null),
          clientPreferredTime: parsed.clientPreferredTime || null,
          meetingNotes: parsed.notes ? `Initial Scheduling Note: ${parsed.notes}` : null,
          status: ConsultationStatus.SCHEDULED,
        },
        include: {
          planner: { select: { id: true, name: true, email: true, phone: true } },
        },
      });

      // 2. Advance enquiry status and follow-up date
      await tx.customerEnquiry.update({
        where: { id: parsed.enquiryId },
        data: {
          status: EnquiryStatus.CONSULTATION_SCHEDULED,
          followUpDate: scheduledDate,
          ...(plannerId && !enquiry.assignedPlannerId ? { assignedPlannerId: plannerId } : {}),
          notes: parsed.notes ? `${enquiry.notes || ''}\nConsultation scheduled: ${parsed.notes}`.trim() : enquiry.notes,
        },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          agencyId: enquiry.agencyId,
          action: 'CONSULTATION_SCHEDULED',
          entity: 'WeddingConsultation',
          entityId: consultation.id,
          details: {
            enquiryId: parsed.enquiryId,
            referenceNumber: enquiry.referenceNumber,
            scheduledAt: scheduledDate.toISOString(),
            meetingType: parsed.meetingType,
            plannerId,
          },
        },
      });

      return consultation;
    });

    const activePlanner = result.planner || enquiry.assignedPlanner;

    // Dispatch Notification to Couple
    await NotificationService.emit(NotificationEvent.CONSULTATION_SCHEDULED, {
      agencyId: enquiry.agencyId,
      recipientEmail: enquiry.email,
      recipientName: enquiry.customerName,
      recipientRole: 'CLIENT',
      data: {
        customerName: enquiry.customerName,
        referenceNumber: enquiry.referenceNumber,
        consultationDate: scheduledDate.toISOString(),
        consultationType: parsed.meetingType === ConsultationType.IN_PERSON ? 'In-Person Palace Consultation' : 'Virtual Video Design Consultation',
        meetingLink: result.meetingLink,
        meetingLocation: result.meetingLocation,
        plannerName: activePlanner?.name || 'Lead Wedding Specialist',
        notes: parsed.notes,
      },
    });

    // Dispatch Notification to Assigned Planner
    if (activePlanner?.email) {
      await NotificationService.emit(NotificationEvent.CONSULTATION_SCHEDULED, {
        agencyId: enquiry.agencyId,
        recipientEmail: activePlanner.email,
        recipientName: activePlanner.name,
        recipientRole: 'WEDDING_PLANNER',
        data: {
          customerName: enquiry.customerName,
          referenceNumber: enquiry.referenceNumber,
          consultationDate: scheduledDate.toISOString(),
          consultationType: parsed.meetingType === ConsultationType.IN_PERSON ? 'In-Person Palace Consultation' : 'Virtual Video Design Consultation',
          meetingLink: result.meetingLink,
          meetingLocation: result.meetingLocation,
          plannerName: activePlanner.name,
          notes: parsed.notes,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: result,
      message: 'First wedding consultation successfully scheduled and notifications dispatched.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Reschedule Wedding Consultation
 */
export async function rescheduleConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const parsed = rescheduleConsultationSchema.parse(req.body);

    const existing = await prisma.weddingConsultation.findUnique({
      where: { id },
      include: {
        enquiry: true,
        planner: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Consultation record not found' });
      return;
    }

    const scheduledDate = new Date(parsed.scheduledAt);

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.weddingConsultation.update({
        where: { id },
        data: {
          scheduledAt: scheduledDate,
          ...(parsed.meetingType ? { meetingType: parsed.meetingType } : {}),
          ...(parsed.meetingLink !== undefined ? { meetingLink: parsed.meetingLink } : {}),
          ...(parsed.meetingLocation !== undefined ? { meetingLocation: parsed.meetingLocation } : {}),
          status: ConsultationStatus.RESCHEDULED,
          meetingNotes: parsed.rescheduleReason
            ? `${existing.meetingNotes || ''}\nRescheduled: ${parsed.rescheduleReason}`.trim()
            : existing.meetingNotes,
        },
        include: {
          planner: { select: { id: true, name: true, email: true, phone: true } },
        },
      });

      await tx.customerEnquiry.update({
        where: { id: existing.enquiryId },
        data: {
          followUpDate: scheduledDate,
          status: EnquiryStatus.CONSULTATION_SCHEDULED,
        },
      });

      return c;
    });

    // Notify Couple
    await NotificationService.emit(NotificationEvent.CONSULTATION_RESCHEDULED, {
      agencyId: existing.agencyId,
      recipientEmail: existing.enquiry.email,
      recipientName: existing.enquiry.customerName,
      recipientRole: 'CLIENT',
      data: {
        customerName: existing.enquiry.customerName,
        referenceNumber: existing.enquiry.referenceNumber,
        consultationDate: scheduledDate.toISOString(),
        consultationType: updated.meetingType,
        meetingLink: updated.meetingLink,
        meetingLocation: updated.meetingLocation,
        plannerName: updated.planner?.name || 'Lead Wedding Specialist',
        rescheduleReason: parsed.rescheduleReason,
      },
    });

    // Notify Planner
    if (updated.planner?.email) {
      await NotificationService.emit(NotificationEvent.CONSULTATION_RESCHEDULED, {
        agencyId: existing.agencyId,
        recipientEmail: updated.planner.email,
        recipientName: updated.planner.name,
        recipientRole: 'WEDDING_PLANNER',
        data: {
          customerName: existing.enquiry.customerName,
          referenceNumber: existing.enquiry.referenceNumber,
          consultationDate: scheduledDate.toISOString(),
          consultationType: updated.meetingType,
          meetingLink: updated.meetingLink,
          meetingLocation: updated.meetingLocation,
          plannerName: updated.planner.name,
          rescheduleReason: parsed.rescheduleReason,
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Consultation successfully rescheduled and updated notifications dispatched.',
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
 * Complete First Wedding Consultation (Record notes, vision, budget, themes)
 */
export async function completeConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const parsed = completeConsultationSchema.parse(req.body);

    const existing = await prisma.weddingConsultation.findUnique({
      where: { id },
      include: {
        enquiry: true,
        planner: true,
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Consultation not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Mark consultation COMPLETED and persist full vision intake
      const c = await tx.weddingConsultation.update({
        where: { id },
        data: {
          status: ConsultationStatus.COMPLETED,
          completedAt: new Date(),
          meetingNotes: parsed.meetingNotes,
          coupleVision: parsed.coupleVision || null,
          themePreferences: parsed.themePreferences || null,
          guestCountConfirmed: parsed.guestCountConfirmed || null,
          budgetDiscussed: parsed.budgetDiscussed || null,
          venuePreferences: parsed.venuePreferences || null,
          specialRequirements: parsed.specialRequirements || null,
          familyExpectations: parsed.familyExpectations || null,
        },
      });

      // 2. Advance enquiry status to CONSULTATION_COMPLETED and sync parameters
      await tx.customerEnquiry.update({
        where: { id: existing.enquiryId },
        data: {
          status: EnquiryStatus.CONSULTATION_COMPLETED,
          ...(parsed.themePreferences ? { theme: parsed.themePreferences } : {}),
          ...(parsed.guestCountConfirmed ? { guestCount: parsed.guestCountConfirmed } : {}),
          ...(parsed.budgetDiscussed ? { maxBudget: parsed.budgetDiscussed } : {}),
          notes: `${existing.enquiry.notes || ''}\nConsultation Summary: ${parsed.meetingNotes}`.trim(),
        },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          agencyId: existing.agencyId,
          action: 'CONSULTATION_COMPLETED',
          entity: 'WeddingConsultation',
          entityId: c.id,
          details: {
            enquiryId: existing.enquiryId,
            referenceNumber: existing.enquiry.referenceNumber,
            completedBy: req.user?.userId,
            budgetDiscussed: parsed.budgetDiscussed,
            themePreferences: parsed.themePreferences,
          },
        },
      });

      return c;
    });

    res.json({
      success: true,
      data: updated,
      message: 'Consultation marked completed. Wedding vision and requirements logged for bespoke proposal.',
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
 * Cancel Consultation
 */
export async function cancelConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const { reason } = req.body;

    const existing = await prisma.weddingConsultation.findUnique({
      where: { id },
      include: { enquiry: true, planner: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Consultation not found' });
      return;
    }

    const updated = await prisma.weddingConsultation.update({
      where: { id },
      data: {
        status: ConsultationStatus.CANCELLED,
        meetingNotes: reason ? `${existing.meetingNotes || ''}\nCancelled: ${reason}`.trim() : existing.meetingNotes,
      },
    });

    // Notify Couple
    await NotificationService.emit(NotificationEvent.CONSULTATION_CANCELLED, {
      agencyId: existing.agencyId,
      recipientEmail: existing.enquiry.email,
      recipientName: existing.enquiry.customerName,
      recipientRole: 'CLIENT',
      data: {
        customerName: existing.enquiry.customerName,
        referenceNumber: existing.enquiry.referenceNumber,
        notes: reason || 'Cancelled by administration',
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Consultation cancelled and notification dispatched.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * List Consultations
 */
export async function listConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;
    const { enquiryId, weddingId, status, plannerId } = req.query;

    const where: any = {};
    if (!isSuperAdmin && agencyId) {
      where.agencyId = agencyId;
    }
    if (enquiryId) where.enquiryId = String(enquiryId);
    if (weddingId) where.weddingId = String(weddingId);
    if (status) where.status = String(status);
    if (plannerId) where.plannerId = String(plannerId);

    const consultations = await prisma.weddingConsultation.findMany({
      where,
      include: {
        enquiry: {
          select: {
            id: true,
            referenceNumber: true,
            customerName: true,
            partnerName: true,
            email: true,
            phone: true,
            location: true,
            weddingDate: true,
            guestCount: true,
            status: true,
          },
        },
        planner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    res.json({ success: true, data: consultations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get Consultation by ID
 */
export async function getConsultationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const consultation = await prisma.weddingConsultation.findUnique({
      where: { id },
      include: {
        enquiry: true,
        wedding: true,
        planner: { select: { id: true, name: true, email: true, phone: true } },
        agency: { select: { id: true, name: true, contactEmail: true, contactPhone: true } },
      },
    });

    if (!consultation) {
      res.status(404).json({ success: false, message: 'Consultation not found' });
      return;
    }

    res.json({ success: true, data: consultation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
