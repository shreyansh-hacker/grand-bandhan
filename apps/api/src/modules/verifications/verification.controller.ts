import { Request, Response } from 'express';
import { DataStore } from '../store';
import { submitVerificationSchema, vendorResolutionSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { broadcastWeddingUpdate } from '../../socket';
import {
  SOCKET_EVENTS,
  ServiceVerificationStatus,
  VerificationResponse,
} from '@grand-bandhan/shared';

export function listVerifications(req: AuthenticatedRequest, res: Response): void {
  const weddingId = req.query.weddingId as string;
  if (!weddingId) {
    res.status(400).json({ success: false, message: 'weddingId is required' });
    return;
  }

  const verifications = DataStore.verifications.listByWedding(weddingId);
  const enriched = verifications.map((v) => {
    const vendor = DataStore.vendors.findById(v.vendorId);
    return { ...v, vendor };
  });

  res.json({ success: true, data: enriched });
}

export function createVerificationTrigger(req: AuthenticatedRequest, res: Response): void {
  const { weddingId, vendorId, serviceName, scheduledConfirmationTime, eventTimelineId } = req.body;

  if (!weddingId || !vendorId || !serviceName) {
    res.status(400).json({ success: false, message: 'weddingId, vendorId, and serviceName are required' });
    return;
  }

  const verification = DataStore.verifications.create({
    weddingId,
    vendorId,
    serviceName,
    eventTimelineId: eventTimelineId || null,
    scheduledConfirmationTime: scheduledConfirmationTime
      ? new Date(scheduledConfirmationTime).toISOString()
      : new Date().toISOString(),
    status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
  });

  broadcastWeddingUpdate(weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_TRIGGERED, { verification });
  res.status(201).json({ success: true, data: verification });
}

// Client or Staff confirms or reports issue
export function submitVerificationResponse(req: AuthenticatedRequest, res: Response): void {
  const id = String(req.params.id);
  const parsed = submitVerificationSchema.parse(req.body);

  const existing = DataStore.verifications.findById(id);
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

  const updated = DataStore.verifications.update(id, {
    response: parsed.response,
    issueNotes: parsed.issueNotes || null,
    evidencePhotos: parsed.evidencePhotos || [],
    confirmedByUserId: req.user?.userId || 'client-verified',
    status: newStatus,
  });

  const vendor = DataStore.vendors.findById(existing.vendorId);

  broadcastWeddingUpdate(existing.weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_UPDATED, {
    verification: updated,
    vendorName: vendor?.name,
  });

  res.json({
    success: true,
    data: updated,
    message: newStatus === ServiceVerificationStatus.CONFIRMED
      ? 'Service confirmed successfully! Thank you.'
      : 'Issue reported and escalated to agency admin and vendor for immediate resolution.',
  });
}

// Vendor responds to reported issue
export function submitVendorResolution(req: Request, res: Response): void {
  const id = String(req.params.id);
  const parsed = vendorResolutionSchema.parse(req.body);

  const existing = DataStore.verifications.findById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Verification record not found' });
    return;
  }

  const updated = DataStore.verifications.update(id, {
    vendorResponseNotes: parsed.vendorResponseNotes,
    status: ServiceVerificationStatus.VENDOR_RESPONDED,
  });

  broadcastWeddingUpdate(existing.weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_UPDATED, {
    verification: updated,
  });

  res.json({
    success: true,
    data: updated,
    message: 'Vendor response submitted and logged in the auditable resolution trail.',
  });
}

// Final Resolution Confirm by Client or Agency Admin
export function resolveVerificationIssue(req: AuthenticatedRequest, res: Response): void {
  const id = String(req.params.id);
  const { resolutionOutcome, notes } = req.body;

  const existing = DataStore.verifications.findById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Verification record not found' });
    return;
  }

  const updated = DataStore.verifications.update(id, {
    status: resolutionOutcome === 'DISPUTED' ? ServiceVerificationStatus.DISPUTED : ServiceVerificationStatus.RESOLVED,
    resolutionNotes: notes || 'Resolved by mutual agreement',
  });

  broadcastWeddingUpdate(existing.weddingId, SOCKET_EVENTS.SERVICE_VERIFICATION_UPDATED, {
    verification: updated,
  });

  res.json({
    success: true,
    data: updated,
    message: `Verification status updated to ${updated.status}.`,
  });
}
