import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { submitVerificationSchema, vendorResolutionSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { broadcastWeddingUpdate } from '../../socket';
import {
  SOCKET_EVENTS,
  ServiceVerificationStatus,
  VerificationResponse,
  UserRole,
} from '@grand-bandhan/shared';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

export async function listVerifications(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const verifications = await prisma.serviceVerification.findMany({
      where: { weddingId },
      include: {
        vendor: true,
        confirmedByUser: { select: { id: true, name: true, role: true } },
      },
      orderBy: { scheduledConfirmationTime: 'asc' },
    });

    res.json({ success: true, data: verifications });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createVerificationTrigger(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { weddingId, vendorId, serviceName, scheduledConfirmationTime, eventTimelineId } = req.body;

  if (!weddingId || !vendorId || !serviceName) {
    res.status(400).json({ success: false, message: 'weddingId, vendorId, and serviceName are required' });
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

    const verification = await prisma.serviceVerification.create({
      data: {
        weddingId,
        vendorId,
        serviceName,
        eventTimelineId: eventTimelineId || null,
        scheduledConfirmationTime: scheduledConfirmationTime
          ? new Date(scheduledConfirmationTime)
          : new Date(),
        status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
      },
      include: { vendor: true },
    });

    broadcastWeddingUpdate(weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_TRIGGERED, { verification });
    res.status(201).json({ success: true, data: verification });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitVerificationResponse(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  try {
    const parsed = submitVerificationSchema.parse(req.body);

    const existing = await prisma.serviceVerification.findUnique({
      where: { id },
      include: {
        wedding: { select: { agencyId: true, weddingCode: true } },
        vendor: true,
      },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Verification record not found' });
      return;
    }

    let newStatus: ServiceVerificationStatus;
    if (parsed.response === VerificationResponse.COMPLETED) {
      newStatus = ServiceVerificationStatus.CONFIRMED;
    } else if (parsed.response === VerificationResponse.ISSUE_REPORTED || parsed.response === VerificationResponse.NOT_DELIVERED) {
      newStatus = ServiceVerificationStatus.ISSUE_REPORTED;
    } else {
      newStatus = ServiceVerificationStatus.UNDER_RESOLUTION;
    }

    const updated = await prisma.serviceVerification.update({
      where: { id },
      data: {
        response: parsed.response,
        issueNotes: parsed.issueNotes || null,
        evidencePhotos: parsed.evidencePhotos || [],
        confirmedByUserId: req.user?.userId || null,
        status: newStatus,
      },
      include: { vendor: true },
    });

    broadcastWeddingUpdate(existing.weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_UPDATED, {
      verification: updated,
      vendorName: existing.vendor.name,
    });

    if (newStatus === ServiceVerificationStatus.ISSUE_REPORTED) {
      await NotificationService.emit(NotificationEvent.SERVICE_ISSUE_REPORTED, {
        agencyId: existing.wedding.agencyId,
        recipientEmail: existing.vendor.email,
        recipientName: existing.vendor.name,
        recipientRole: 'VENDOR',
        data: {
          vendorName: existing.vendor.name,
          serviceName: existing.serviceName,
          issueNotes: parsed.issueNotes || 'Service discrepancy reported by client/coordinator',
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: newStatus === ServiceVerificationStatus.CONFIRMED
        ? 'Service confirmed successfully! Thank you.'
        : 'Issue reported and escalated to agency admin and vendor for immediate resolution.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitVendorResolution(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  try {
    const parsed = vendorResolutionSchema.parse(req.body);

    const existing = await prisma.serviceVerification.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Verification record not found' });
      return;
    }

    const updated = await prisma.serviceVerification.update({
      where: { id },
      data: {
        vendorResponseNotes: parsed.vendorResponseNotes,
        status: ServiceVerificationStatus.VENDOR_RESPONDED,
      },
      include: { vendor: true },
    });

    broadcastWeddingUpdate(existing.weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_UPDATED, {
      verification: updated,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Vendor response submitted and logged in the auditable resolution trail.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function resolveVerificationIssue(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { resolutionOutcome, notes } = req.body;
  try {
    const existing = await prisma.serviceVerification.findUnique({
      where: { id },
      include: { wedding: true, vendor: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Verification record not found' });
      return;
    }

    const updatedStatus = resolutionOutcome === 'DISPUTED' ? ServiceVerificationStatus.DISPUTED : ServiceVerificationStatus.RESOLVED;

    const updated = await prisma.serviceVerification.update({
      where: { id },
      data: {
        status: updatedStatus,
        issueNotes: notes ? `${existing.issueNotes || ''}\nResolution: ${notes}` : existing.issueNotes,
      },
      include: { vendor: true },
    });

    broadcastWeddingUpdate(existing.weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_UPDATED, {
      verification: updated,
    });

    await NotificationService.emit(NotificationEvent.SERVICE_ISSUE_RESOLVED, {
      agencyId: existing.wedding.agencyId,
      recipientEmail: existing.vendor.email,
      recipientName: existing.vendor.name,
      recipientRole: 'VENDOR',
      data: {
        serviceName: existing.serviceName,
        outcome: updatedStatus,
        notes: notes || 'Mutually resolved',
      },
    });

    res.json({
      success: true,
      data: updated,
      message: `Verification status updated to ${updated.status}.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
