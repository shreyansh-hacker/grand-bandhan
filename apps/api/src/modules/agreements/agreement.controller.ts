import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { signAgreementSchema } from '@grand-bandhan/validation';
import { AgreementStatus, WeddingStatus } from '@grand-bandhan/shared';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

export async function getAgreement(req: Request, res: Response): Promise<void> {
  const weddingId = String(req.params.weddingId);
  try {
    const agreement = await prisma.digitalAgreement.findUnique({
      where: { weddingId },
      include: {
        wedding: {
          select: {
            id: true,
            weddingCode: true,
            brideName: true,
            groomName: true,
            weddingDate: true,
            location: true,
            guestCount: true,
            budgetMin: true,
            budgetMax: true,
            packageType: true,
            agency: { select: { name: true, contactEmail: true, contactPhone: true } },
          },
        },
      },
    });

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Agreement not found for this wedding' });
      return;
    }

    res.json({ success: true, data: agreement });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function signAgreement(req: Request, res: Response): Promise<void> {
  const weddingId = String(req.params.weddingId);
  try {
    const parsed = signAgreementSchema.parse(req.body);

    const agreement = await prisma.digitalAgreement.findUnique({
      where: { weddingId },
      include: { wedding: { select: { agencyId: true, weddingCode: true, brideName: true, groomName: true, status: true } } },
    });

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

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.digitalAgreement.update({
        where: { weddingId },
        data: {
          signedByName: parsed.signedByName.trim(),
          signatureDataUrl: parsed.signatureDataUrl,
          clientIp: String(clientIp),
          userAgent: String(userAgent),
          signedAt: new Date(),
          status: AgreementStatus.SIGNED,
        },
      });

      if (agreement.wedding.status === WeddingStatus.PROPOSAL || agreement.wedding.status === WeddingStatus.ENQUIRY) {
        await tx.wedding.update({
          where: { id: weddingId },
          data: { status: WeddingStatus.CONFIRMED },
        });
      }

      await tx.auditLog.create({
        data: {
          agencyId: agreement.wedding.agencyId,
          action: 'AGREEMENT_DIGITALLY_SIGNED',
          entity: 'DigitalAgreement',
          entityId: agreement.id,
          details: {
            signedByName: parsed.signedByName,
            clientIp: String(clientIp),
            weddingCode: agreement.wedding.weddingCode,
          },
        },
      });

      return updated;
    });

    await NotificationService.emit(NotificationEvent.AGREEMENT_SIGNED, {
      agencyId: agreement.wedding.agencyId,
      recipientEmail: 'concierge@grandbandhan.com',
      recipientName: 'Agency Concierge Desk',
      data: {
        weddingCode: agreement.wedding.weddingCode,
        signedByName: parsed.signedByName,
        couple: `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`,
      },
    });

    res.json({
      success: true,
      data: result,
      message: 'Agreement digitally signed and executed successfully.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}
