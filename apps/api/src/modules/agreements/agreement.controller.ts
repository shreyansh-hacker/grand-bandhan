import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import {
  signAgreementSchema,
  verifyAgreementSchema,
  uploadSignedAgreementSchema,
} from '@grand-bandhan/validation';
import {
  AgreementStatus,
  WeddingStatus,
  UserRole,
  EnquiryStatus,
} from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';
import { generateLegalAgreementContent } from './agreement.generator';

/**
 * Get Agreement by Wedding ID, Enquiry ID, or Agreement ID
 */
export async function getAgreement(req: Request, res: Response): Promise<void> {
  const identifier = String(req.params.weddingId || req.params.id);
  try {
    const agreement = await prisma.digitalAgreement.findFirst({
      where: {
        OR: [
          { id: identifier },
          { weddingId: identifier },
          { enquiryId: identifier },
          { agreementNumber: identifier },
        ],
      },
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
            status: true,
            agency: { select: { id: true, name: true, contactEmail: true, contactPhone: true, address: true, city: true } },
            planner: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        enquiry: {
          select: {
            id: true,
            referenceNumber: true,
            customerName: true,
            partnerName: true,
            email: true,
            phone: true,
            weddingDate: true,
            location: true,
            guestCount: true,
            packageType: true,
            status: true,
            agency: { select: { id: true, name: true, contactEmail: true, contactPhone: true, address: true, city: true } },
            assignedPlanner: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Agreement not found' });
      return;
    }

    res.json({ success: true, data: agreement });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Generate or Re-generate Dynamic 20-Section Formal Agreement
 */
export async function generateAgreement(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { enquiryId, weddingId, customTerms } = req.body;
    if (!enquiryId && !weddingId) {
      res.status(400).json({ success: false, message: 'Either enquiryId or weddingId is required' });
      return;
    }

    let wedding: any = null;
    let enquiry: any = null;
    let agency: any = null;
    let proposal: any = null;

    if (weddingId) {
      wedding = await prisma.wedding.findUnique({
        where: { id: weddingId },
        include: { agency: true, planner: true },
      });
      if (wedding) agency = wedding.agency;
    }

    if (enquiryId) {
      enquiry = await prisma.customerEnquiry.findUnique({
        where: { id: enquiryId },
        include: {
          agency: true,
          assignedPlanner: true,
          proposals: { where: { status: 'ACCEPTED' }, take: 1, orderBy: { createdAt: 'desc' } },
          consultations: { where: { status: 'COMPLETED' }, take: 1, orderBy: { completedAt: 'desc' } },
        },
      });
      if (enquiry) {
        agency = enquiry.agency;
        if (enquiry.proposals?.length > 0) proposal = enquiry.proposals[0];
      }
    }

    if (!agency) {
      agency = await prisma.agency.findFirst({ where: { status: 'APPROVED' } });
    }

    const clientName = wedding
      ? `${wedding.brideName} & ${wedding.groomName}`
      : `${enquiry?.customerName || 'Valued Client'}${enquiry?.partnerName ? ` & ${enquiry.partnerName}` : ''}`;

    const weddingDate = wedding?.weddingDate || enquiry?.weddingDate || new Date(Date.now() + 180 * 86400000);
    const guestCount = wedding?.guestCount || enquiry?.guestCount || 350;
    const location = wedding?.location || enquiry?.location || 'Udaipur, Rajasthan';
    const packageType = wedding?.packageType || enquiry?.packageType || 'FULL_SERVICE';

    const estimatedBudget = proposal?.estimatedBudget || (wedding ? wedding.budgetMax : (enquiry ? enquiry.maxBudget : 2500000));
    const planningFee = Math.round(estimatedBudget * 0.15);
    const taxes = Math.round(planningFee * 0.18);
    const thirdPartyCosts = estimatedBudget - planningFee;

    const agreementNumber = `GB-AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const generatedTerms = customTerms || generateLegalAgreementContent({
      agreementNumber,
      agency: {
        name: agency?.name || 'Grand Bandhan Luxury Weddings & Concierge',
        registeredAddress: agency?.address ? `${agency.address}, ${agency.city || ''}` : 'Heritage Royal Chambers, The City Palace Complex, Udaipur, Rajasthan 313001',
        contactEmail: agency?.contactEmail || 'shreyanshsharma049@gmail.com',
        contactPhone: agency?.contactPhone || '+91 98200 00002',
        authorizedRepresentative: agency?.ownerName || 'Shreyansh Sharma (Director of Royal Operations)',
        gstin: agency?.gstin || '08AAACG1234F1Z5',
      },
      client: {
        partner1Name: wedding ? wedding.brideName : (enquiry?.customerName || 'Client Partner 1'),
        partner2Name: wedding ? wedding.groomName : (enquiry?.partnerName || 'Client Partner 2'),
        email: wedding?.clientEmail || enquiry?.email || 'client@example.com',
        phone: wedding?.clientPhone || enquiry?.phone || '+91 98200 00000',
        residentialAddress: 'Residential record on file with Grand Bandhan Concierge Registry',
      },
      wedding: {
        weddingCode: wedding?.weddingCode || `GB-W-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        weddingDate,
        venue: `${location} Luxury Heritage Palace`,
        city: location,
        guestCount,
        numberOfFunctions: 4,
        theme: enquiry?.theme || 'Imperial Rajputana Heritage Royal',
        specialRequirements: 'Comprehensive luxury coordination with digital guest RSVP and sealed-bid vendor matrices',
      },
      package: {
        packageType,
      },
      pricing: {
        totalPlanningFee: planningFee,
        packagePrice: planningFee,
        applicableTaxes: taxes,
        thirdPartyVendorCostsEstimate: thirdPartyCosts,
        approvedEstimatedBudget: estimatedBudget,
      },
      paymentMilestones: [
        {
          name: 'Initial Booking Deposit',
          percentage: 25,
          amount: Math.round(estimatedBudget * 0.25),
          dueDateDescription: 'Upon formal digital agreement execution & verification',
        },
        {
          name: 'Midway Advance Production Disbursement',
          percentage: 50,
          amount: Math.round(estimatedBudget * 0.50),
          dueDateDescription: '30 Calendar Days prior to celebration commencement',
        },
        {
          name: 'Final Post-Wedding Settlement',
          percentage: 25,
          amount: Math.round(estimatedBudget * 0.25),
          dueDateDescription: 'Within 7 banking days following post-event audit reconciliation',
        },
      ],
      version: 1,
    });

    const result = await prisma.$transaction(async (tx) => {
      // Check if existing agreement exists for wedding or enquiry
      const existing = await tx.digitalAgreement.findFirst({
        where: {
          OR: [
            ...(weddingId ? [{ weddingId }] : []),
            ...(enquiryId ? [{ enquiryId }] : []),
          ],
        },
      });

      if (existing) {
        if (existing.status === AgreementStatus.VERIFIED) {
          throw new Error('Cannot regenerate an agreement that has already been verified and locked by Senior Legal Operations.');
        }

        return await tx.digitalAgreement.update({
          where: { id: existing.id },
          data: {
            termsContent: generatedTerms,
            version: (existing.version || 1) + 1,
            status: AgreementStatus.DRAFT,
            verificationStatus: 'PENDING',
            rejectionReason: null,
            ...(weddingId && !existing.weddingId ? { weddingId } : {}),
            ...(enquiryId && !existing.enquiryId ? { enquiryId } : {}),
          },
        });
      }

      return await tx.digitalAgreement.create({
        data: {
          weddingId: weddingId || null,
          enquiryId: enquiryId || null,
          agreementNumber,
          termsContent: generatedTerms,
          version: 1,
          status: AgreementStatus.DRAFT,
          verificationStatus: 'PENDING',
        },
      });
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Professional 20-Section Service Agreement generated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Dispatch Agreement to Couple via Email for Digital Review & Signing
 */
export async function sendAgreement(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || req.params.weddingId);
  try {
    const agreement = await prisma.digitalAgreement.findFirst({
      where: {
        OR: [{ id }, { weddingId: id }, { enquiryId: id }],
      },
      include: {
        wedding: { include: { agency: true, planner: true } },
        enquiry: { include: { agency: true, assignedPlanner: true } },
      },
    });

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Agreement not found' });
      return;
    }

    const updated = await prisma.digitalAgreement.update({
      where: { id: agreement.id },
      data: {
        status: agreement.status === AgreementStatus.DRAFT ? AgreementStatus.SENT : agreement.status,
      },
    });

    const recipientEmail = agreement.wedding?.clientEmail || agreement.enquiry?.email;
    const recipientName = agreement.wedding
      ? `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`
      : agreement.enquiry?.customerName || 'Valued Couple';

    const agencyId = agreement.wedding?.agencyId || agreement.enquiry?.agencyId;
    const agencyName = agreement.wedding?.agency?.name || agreement.enquiry?.agency?.name;
    const weddingCode = agreement.wedding?.weddingCode || agreement.enquiry?.referenceNumber || agreement.agreementNumber;

    if (recipientEmail && agencyId) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SENT, {
        agencyId,
        recipientEmail,
        recipientName,
        recipientRole: 'CLIENT',
        data: {
          weddingCode,
          agreementNumber: agreement.agreementNumber,
          coupleNames: recipientName,
          agreementTitle: 'Wedding Planning & Management Service Agreement',
          agencyName,
          portalUrl: agreement.wedding ? `${process.env.APP_URL || 'https://grand-bandhan.onrender.com'}/portal/client/${agreement.wedding.id}` : `${process.env.APP_URL || 'https://grand-bandhan.onrender.com'}/portal/client`,
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Service agreement formally dispatched to client couple for review and digital signature.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Execute Digital E-Signature on HTML5 Canvas
 */
export async function signAgreement(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || req.params.weddingId);
  try {
    const parsed = signAgreementSchema.parse(req.body);

    const agreement = await prisma.digitalAgreement.findFirst({
      where: {
        OR: [{ id }, { weddingId: id }, { enquiryId: id }],
      },
      include: {
        wedding: { include: { agency: true, planner: true } },
        enquiry: { include: { agency: true, assignedPlanner: true } },
      },
    });

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Agreement not found' });
      return;
    }

    if (agreement.status === AgreementStatus.VERIFIED) {
      res.status(400).json({ success: false, message: 'This agreement has already been legally signed and verified.' });
      return;
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Client';

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.digitalAgreement.update({
        where: { id: agreement.id },
        data: {
          signedByName: parsed.signedByName.trim(),
          signatureDataUrl: parsed.signatureDataUrl,
          clientIp: String(clientIp),
          userAgent: String(userAgent),
          signedAt: new Date(),
          status: AgreementStatus.SIGNED,
          verificationStatus: 'PENDING',
          rejectionReason: null,
        },
      });

      const agencyId = agreement.wedding?.agencyId || agreement.enquiry?.agencyId || 'system';

      await tx.auditLog.create({
        data: {
          agencyId,
          action: 'AGREEMENT_DIGITALLY_SIGNED',
          entity: 'DigitalAgreement',
          entityId: agreement.id,
          details: {
            signedByName: parsed.signedByName,
            clientIp: String(clientIp),
            agreementNumber: agreement.agreementNumber,
          },
        },
      });

      return updated;
    });

    const coupleNames = agreement.wedding
      ? `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`
      : agreement.enquiry?.customerName || parsed.signedByName;

    const agency = agreement.wedding?.agency || agreement.enquiry?.agency;
    const weddingCode = agreement.wedding?.weddingCode || agreement.enquiry?.referenceNumber || agreement.agreementNumber;

    // 1. Notify Agency Admin Desk
    if (agency?.contactEmail) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SIGNED, {
        agencyId: agency.id,
        recipientEmail: agency.contactEmail,
        recipientName: `${agency.name || 'Agency'} Legal Desk`,
        recipientRole: 'AGENCY_ADMIN',
        data: {
          weddingCode,
          agreementNumber: agreement.agreementNumber,
          signedByName: parsed.signedByName,
          couple: coupleNames,
        },
      });
    }

    // 2. Notify Couple
    const clientEmail = agreement.wedding?.clientEmail || agreement.enquiry?.email;
    if (clientEmail && agency) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SIGNED, {
        agencyId: agency.id,
        recipientEmail: clientEmail,
        recipientName: coupleNames,
        recipientRole: 'CLIENT',
        data: {
          weddingCode,
          agreementNumber: agreement.agreementNumber,
          signedByName: parsed.signedByName,
          couple: coupleNames,
        },
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'Agreement digitally signed. Submitted to Grand Bandhan Legal Desk for verification.',
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
 * Upload Externally Signed Service Agreement Document (PDF or Scan)
 */
export async function uploadSignedAgreement(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || req.params.weddingId);
  try {
    const parsed = uploadSignedAgreementSchema.parse(req.body);

    const agreement = await prisma.digitalAgreement.findFirst({
      where: {
        OR: [{ id }, { weddingId: id }, { enquiryId: id }],
      },
      include: {
        wedding: { include: { agency: true } },
        enquiry: { include: { agency: true } },
      },
    });

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Agreement not found' });
      return;
    }

    const updated = await prisma.digitalAgreement.update({
      where: { id: agreement.id },
      data: {
        signedPdfUrl: parsed.signedPdfUrl,
        signedByName: parsed.signedByName,
        signedAt: new Date(),
        status: AgreementStatus.PENDING_VERIFICATION,
        verificationStatus: 'PENDING',
        rejectionReason: null,
      },
    });

    const agency = agreement.wedding?.agency || agreement.enquiry?.agency;
    if (agency?.contactEmail) {
      await NotificationService.emit(NotificationEvent.AGREEMENT_SIGNED, {
        agencyId: agency.id,
        recipientEmail: agency.contactEmail,
        recipientName: `${agency.name} Legal Compliance Desk`,
        recipientRole: 'AGENCY_ADMIN',
        data: {
          agreementNumber: agreement.agreementNumber,
          signedByName: parsed.signedByName,
          notes: parsed.notes || 'External signed PDF uploaded',
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Signed agreement document uploaded successfully. Awaiting admin legal verification.',
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
 * Admin Verification / Rejection of Service Agreement
 */
export async function verifyAgreement(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id || req.params.weddingId);
  try {
    const parsed = verifyAgreementSchema.parse(req.body);

    const agreement = await prisma.digitalAgreement.findFirst({
      where: {
        OR: [{ id }, { weddingId: id }, { enquiryId: id }],
      },
      include: {
        wedding: { include: { agency: true, planner: true } },
        enquiry: { include: { agency: true, assignedPlanner: true } },
      },
    });

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Agreement not found' });
      return;
    }

    const isApprove = parsed.status === 'VERIFIED';
    const rejectionReason = isApprove ? null : (parsed.rejectionReason || 'Document signature incomplete or illegible.');

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.digitalAgreement.update({
        where: { id: agreement.id },
        data: {
          status: isApprove ? AgreementStatus.VERIFIED : AgreementStatus.REJECTED,
          verificationStatus: isApprove ? 'VERIFIED' : 'REJECTED',
          verifiedAt: isApprove ? new Date() : null,
          verifiedById: req.user?.userId || 'admin',
          rejectionReason,
          agencySignedByName: isApprove ? (req.user?.name || 'Grand Bandhan Legal Director') : null,
          agencySignedAt: isApprove ? new Date() : null,
        },
      });

      // If approved and linked to wedding, confirm wedding status
      if (isApprove && agreement.weddingId) {
        await tx.wedding.update({
          where: { id: agreement.weddingId },
          data: { status: WeddingStatus.CONFIRMED },
        });
      }

      const agencyId = agreement.wedding?.agencyId || agreement.enquiry?.agencyId || 'system';

      await tx.auditLog.create({
        data: {
          agencyId,
          action: isApprove ? 'AGREEMENT_VERIFIED' : 'AGREEMENT_REJECTED',
          entity: 'DigitalAgreement',
          entityId: agreement.id,
          details: {
            agreementNumber: agreement.agreementNumber,
            verifiedBy: req.user?.userId,
            adminName: req.user?.name,
            status: parsed.status,
            rejectionReason,
          },
        },
      });

      return updated;
    });

    const coupleNames = agreement.wedding
      ? `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`
      : agreement.enquiry?.customerName || 'Valued Couple';

    const clientEmail = agreement.wedding?.clientEmail || agreement.enquiry?.email;
    const agency = agreement.wedding?.agency || agreement.enquiry?.agency;
    const weddingCode = agreement.wedding?.weddingCode || agreement.enquiry?.referenceNumber || agreement.agreementNumber;
    const portalUrl = agreement.wedding
      ? `${process.env.APP_URL || 'https://grand-bandhan.onrender.com'}/portal/client/${agreement.wedding.id}`
      : `${process.env.APP_URL || 'https://grand-bandhan.onrender.com'}/portal/client`;

    if (clientEmail && agency) {
      if (isApprove) {
        await NotificationService.emit(NotificationEvent.AGREEMENT_VERIFIED, {
          agencyId: agency.id,
          recipientEmail: clientEmail,
          recipientName: coupleNames,
          recipientRole: 'CLIENT',
          data: {
            weddingCode,
            agreementNumber: agreement.agreementNumber,
            couple: coupleNames,
            portalUrl,
          },
        });
      } else {
        await NotificationService.emit(NotificationEvent.AGREEMENT_CORRECTION_REQUIRED, {
          agencyId: agency.id,
          recipientEmail: clientEmail,
          recipientName: coupleNames,
          recipientRole: 'CLIENT',
          data: {
            weddingCode,
            agreementNumber: agreement.agreementNumber,
            couple: coupleNames,
            rejectionReason,
            portalUrl,
          },
        });
      }
    }

    res.json({
      success: true,
      data: result,
      message: isApprove
        ? 'Agreement verified successfully! Active wedding operations are now legally unlocked.'
        : 'Agreement rejected with correction request sent to the couple.',
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
 * List Agreements for Admin Desk
 */
export async function listAgreements(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;
    const { status, verificationStatus } = req.query;

    const where: any = {};
    if (!isSuperAdmin && agencyId) {
      where.OR = [
        { wedding: { agencyId } },
        { enquiry: { agencyId } },
      ];
    }
    if (status) where.status = String(status);
    if (verificationStatus) where.verificationStatus = String(verificationStatus);

    const agreements = await prisma.digitalAgreement.findMany({
      where,
      include: {
        wedding: {
          select: {
            id: true,
            weddingCode: true,
            brideName: true,
            groomName: true,
            weddingDate: true,
            location: true,
            status: true,
          },
        },
        enquiry: {
          select: {
            id: true,
            referenceNumber: true,
            customerName: true,
            partnerName: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: agreements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Download Printable High-Fidelity Agreement Document HTML
 */
export async function downloadAgreementHtml(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  try {
    const agreement = await prisma.digitalAgreement.findFirst({
      where: {
        OR: [{ id }, { weddingId: id }, { enquiryId: id }, { agreementNumber: id }],
      },
      include: {
        wedding: { include: { agency: true } },
        enquiry: { include: { agency: true } },
      },
    });

    if (!agreement) {
      res.status(404).send('Agreement not found');
      return;
    }

    const coupleNames = agreement.wedding
      ? `${agreement.wedding.brideName} & ${agreement.wedding.groomName}`
      : agreement.enquiry?.customerName || 'Royal Couple';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Service Agreement - ${agreement.agreementNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #0A2540;
      background: #FFFFFF;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 3px double #D4AF37;
      padding-bottom: 15px;
      margin-bottom: 25px;
      text-align: center;
    }
    .crest {
      font-size: 24px;
      color: #D4AF37;
      letter-spacing: 2px;
      font-weight: bold;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      color: #0A2540;
      margin: 8px 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta {
      font-size: 11px;
      color: #4A5568;
      font-family: monospace;
    }
    .content {
      white-space: pre-line;
      font-size: 12px;
      text-align: justify;
    }
    .signature-block {
      margin-top: 35px;
      border-top: 2px solid #D4AF37;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sign-col {
      width: 45%;
    }
    .sign-line {
      border-bottom: 1px solid #718096;
      height: 60px;
      margin-bottom: 6px;
    }
    .seal {
      border: 2px solid #D4AF37;
      color: #8C1D40;
      padding: 6px 12px;
      display: inline-block;
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 4px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #0A2540; color: #D4AF37; border: 1px solid #D4AF37; border-radius: 6px; font-weight: bold; cursor: pointer;">
      🖨️ Print / Download PDF
    </button>
  </div>

  <div class="header">
    <div class="crest">👑 GRAND BANDHAN</div>
    <div class="title">Wedding Planning &amp; Management Service Agreement</div>
    <div class="meta">Document Ref: ${agreement.agreementNumber} | Version: ${agreement.version}.0 | Status: ${agreement.verificationStatus || agreement.status}</div>
  </div>

  <div class="content">${agreement.termsContent}</div>

  <div class="signature-block">
    <div class="sign-col">
      <div style="font-weight: bold; font-size: 13px; margin-bottom: 8px;">FOR THE CLIENT COUPLE:</div>
      ${agreement.signatureDataUrl ? `<img src="${agreement.signatureDataUrl}" style="height: 50px; display: block; margin-bottom: 6px;" alt="Signature" />` : '<div class="sign-line"></div>'}
      <div style="font-size: 11px;">Signed By: <strong>${agreement.signedByName || coupleNames}</strong></div>
      <div style="font-size: 11px;">Timestamp: ${agreement.signedAt ? new Date(agreement.signedAt).toLocaleString('en-IN') : 'Pending Signature'}</div>
      <div style="font-size: 11px;">Audit IP: ${agreement.clientIp || 'Verified via Portal'}</div>
    </div>

    <div class="sign-col" style="text-align: right;">
      <div style="font-weight: bold; font-size: 13px; margin-bottom: 8px;">FOR GRAND BANDHAN IMPERIAL CONCIERGE:</div>
      <div class="seal" style="margin-bottom: 8px;">${agreement.verificationStatus === 'VERIFIED' ? '✓ OFFICIALLY VERIFIED &amp; EXECUTED' : 'PENDING LEGAL REVIEW'}</div>
      <div style="font-size: 11px;">Authorized Signatory: <strong>${agreement.agencySignedByName || 'Director of Operations'}</strong></div>
      <div style="font-size: 11px;">Verification Date: ${agreement.verifiedAt ? new Date(agreement.verifiedAt).toLocaleString('en-IN') : 'Awaiting Final Review'}</div>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
}
