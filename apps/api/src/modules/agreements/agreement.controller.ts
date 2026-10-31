import { Request, Response } from 'express';
import { DataStore } from '../store';
import { signAgreementSchema } from '@grand-bandhan/validation';
import { AgreementStatus, WeddingStatus } from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';

export function getAgreement(req: Request, res: Response): void {
  const weddingId = String(req.params.weddingId);
  const agreement = DataStore.agreements.findByWeddingId(weddingId);
  if (!agreement) {
    res.status(404).json({ success: false, message: 'Agreement not found for this wedding' });
    return;
  }
  const wedding = DataStore.weddings.findById(weddingId);
  res.json({ success: true, data: { ...agreement, wedding } });
}

export function signAgreement(req: Request, res: Response): void {
  const weddingId = String(req.params.weddingId);
  const parsed = signAgreementSchema.parse(req.body);

  const agreement = DataStore.agreements.findByWeddingId(weddingId);
  if (!agreement) {
    res.status(404).json({ success: false, message: 'Agreement not found' });
    return;
  }

  if (agreement.status === AgreementStatus.SIGNED) {
    res.status(400).json({ success: false, message: 'This agreement has already been legally signed' });
    return;
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Client';

  const updated = DataStore.agreements.update(weddingId, {
    signedByName: parsed.signedByName,
    signatureDataUrl: parsed.signatureDataUrl,
    clientIp: String(clientIp),
    userAgent,
    signedAt: new Date().toISOString(),
    status: AgreementStatus.SIGNED,
  });

  // Advance wedding status if in proposal state
  const wedding = DataStore.weddings.findById(weddingId);
  if (wedding && (wedding.status === WeddingStatus.PROPOSAL || wedding.status === WeddingStatus.ENQUIRY)) {
    DataStore.weddings.update(weddingId, { status: WeddingStatus.CONFIRMED });
  }

  DataStore.auditLogs.create({
    agencyId: wedding?.agencyId || 'default-agency',
    action: 'AGREEMENT_DIGITALLY_SIGNED',
    entity: 'DigitalAgreement',
    entityId: agreement.id,
    details: { signedByName: parsed.signedByName, clientIp, userAgent, signedAt: new Date().toISOString() },
  });

  res.json({
    success: true,
    data: updated,
    message: 'Agreement digitally signed and executed successfully.',
  });
}
