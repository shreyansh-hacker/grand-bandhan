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
            clientEmail: true,
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

export async function sendAgreement(req: Request, res: Response): Promise<void> {
  const weddingId = String(req.params.weddingId);
  try {
    const agreement = await prisma.digitalAgreement.findUnique({
      where: { weddingId },
      include: {
        wedding: {
          select: {
            id: true,
            agencyId: true,
            weddingCode: true,
            brideName: true,
            groomName: true,
            clientEmail: true,
            agency: { select: { name: true, contactEmail: true } },
            planner: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Agreement not found' });
      return;
    }

    // Update status to SENT if draft
    const updated = await prisma.digitalAgreement.update({
      where: { weddingId },
      data: {
        status: agreement.status === AgreementStatus.SIGNED ? AgreementStatus.SIGNED : AgreementStatus.SENT,
      },
    });

    // Dispatch AGREEMENT_SENT to client
    if (agreement.wedding.clientEmail) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SENT, {
        agencyId: agreement.wedding.agencyId,
        recipientEmail: agreement.wedding.clientEmail,
        recipientName: `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`,
        recipientRole: 'CLIENT',
        data: {
          weddingCode: agreement.wedding.weddingCode,
          coupleNames: `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`,
          agreementTitle: agreement.agreementNumber || 'Wedding Services Agreement',
          agencyName: agreement.wedding.agency?.name,
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Agreement dispatched to client for digital signature.',
    });
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
      include: {
        wedding: {
          select: {
            agencyId: true,
            weddingCode: true,
            brideName: true,
            groomName: true,
            clientEmail: true,
            status: true,
            agency: { select: { name: true, contactEmail: true } },
            planner: { select: { name: true, email: true } },
          },
        },
      },
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

    const coupleNames = `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`;

    // 1. Notify Agency Admin (from real database relationship, not hardcoded concierge)
    if (agreement.wedding.agency?.contactEmail) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SIGNED, {
        agencyId: agreement.wedding.agencyId,
        recipientEmail: agreement.wedding.agency.contactEmail,
        recipientName: `${agreement.wedding.agency.name || 'Agency'} Admin Desk`,
        recipientRole: 'AGENCY_ADMIN',
        data: {
          weddingCode: agreement.wedding.weddingCode,
          signedByName: parsed.signedByName,
          couple: coupleNames,
        },
      });
    }

    // 2. Notify Assigned Planner if assigned
    if (agreement.wedding.planner?.email) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SIGNED, {
        agencyId: agreement.wedding.agencyId,
        recipientEmail: agreement.wedding.planner.email,
        recipientName: agreement.wedding.planner.name || 'Lead Planner',
        recipientRole: 'WEDDING_PLANNER',
        data: {
          weddingCode: agreement.wedding.weddingCode,
          signedByName: parsed.signedByName,
          couple: coupleNames,
        },
      });
    }

    // 3. Send Signed Execution Receipt to the Couple / Client
    if (agreement.wedding.clientEmail) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SIGNED, {
        agencyId: agreement.wedding.agencyId,
        recipientEmail: agreement.wedding.clientEmail,
        recipientName: coupleNames,
        recipientRole: 'CLIENT',
        data: {
          weddingCode: agreement.wedding.weddingCode,
          signedByName: parsed.signedByName,
          couple: coupleNames,
        },
      });
    }

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
