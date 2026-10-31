import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { createProposalSchema, respondProposalSchema } from '@grand-bandhan/validation';
import { AuthenticatedRequest } from '../../middleware/auth';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';
import { ProposalStatus, EnquiryStatus } from '@grand-bandhan/shared';

export async function createProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = createProposalSchema.parse(req.body);
    const agencyId = req.user?.agencyId;

    const enquiry = await prisma.customerEnquiry.findUnique({
      where: { id: parsed.enquiryId },
      include: { agency: true },
    });

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found' });
      return;
    }

    if (req.user?.role !== 'SUPER_ADMIN' && enquiry.agencyId !== agencyId) {
      res.status(403).json({ success: false, message: 'Access denied to this enquiry' });
      return;
    }

    const proposalNumber = `GB-PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const proposal = await prisma.$transaction(async (tx) => {
      const p = await tx.weddingProposal.create({
        data: {
          enquiryId: parsed.enquiryId,
          agencyId: enquiry.agencyId,
          proposalNumber,
          packageType: parsed.packageType,
          proposedServices: parsed.proposedServices || null,
          estimatedBudget: parsed.estimatedBudget,
          planningScope: parsed.planningScope || null,
          termsContent: parsed.termsContent || null,
          paymentMilestones: parsed.paymentMilestones || null,
          validUntil: new Date(parsed.validUntil),
          status: ProposalStatus.SENT,
        },
      });

      await tx.customerEnquiry.update({
        where: { id: parsed.enquiryId },
        data: { status: EnquiryStatus.PROPOSAL_SENT },
      });

      return p;
    });

    // Emit event to customer
    await NotificationService.emit(NotificationEvent.PROPOSAL_SENT, {
      agencyId: enquiry.agencyId,
      recipientEmail: enquiry.email,
      recipientName: enquiry.customerName,
      data: {
        customerName: enquiry.customerName,
        proposalNumber,
        proposalId: proposal.id,
        location: enquiry.location,
        packageType: proposal.packageType,
        estimatedBudget: proposal.estimatedBudget,
        validUntil: proposal.validUntil,
      },
    });

    res.status(201).json({
      success: true,
      data: proposal,
      message: 'Proposal created and dispatched to customer.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProposalById(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const proposal = await prisma.weddingProposal.findUnique({
      where: { id },
      include: {
        enquiry: true,
        agency: {
          select: { id: true, name: true, logoUrl: true, contactEmail: true, contactPhone: true },
        },
      },
    });

    if (!proposal) {
      res.status(404).json({ success: false, message: 'Proposal not found' });
      return;
    }

    res.json({ success: true, data: proposal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function respondToProposal(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const parsed = respondProposalSchema.parse(req.body);

    const proposal: any = await prisma.weddingProposal.findUnique({
      where: { id },
      include: { enquiry: true, agency: true },
    });

    if (!proposal) {
      res.status(404).json({ success: false, message: 'Proposal not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.weddingProposal.update({
        where: { id },
        data: {
          status: parsed.status as ProposalStatus,
          customerNotes: parsed.customerNotes || null,
          ...(parsed.status === 'ACCEPTED' ? { acceptedAt: new Date() } : {}),
          ...(parsed.status === 'REJECTED' ? { rejectedAt: new Date() } : {}),
        },
      });

      if (parsed.status === 'ACCEPTED') {
        await tx.customerEnquiry.update({
          where: { id: proposal.enquiryId },
          data: { status: EnquiryStatus.BOOKING_PENDING },
        });
      }

      return p;
    });

    // Notify agency admin with specific event
    let eventToEmit: NotificationEvent = NotificationEvent.PROPOSAL_REJECTED;
    if (parsed.status === 'ACCEPTED') {
      eventToEmit = NotificationEvent.PROPOSAL_ACCEPTED;
    } else if (parsed.status === 'REVISION_REQUESTED') {
      eventToEmit = NotificationEvent.PROPOSAL_REVISION_REQUESTED;
    }

    if (proposal.agency?.contactEmail) {
      await NotificationService.emit(eventToEmit, {
        agencyId: proposal.agencyId,
        recipientEmail: proposal.agency.contactEmail,
        recipientName: proposal.agency.name,
        recipientRole: 'AGENCY_ADMIN',
        data: {
          customerName: proposal.enquiry?.customerName,
          proposalNumber: proposal.proposalNumber,
          decision: parsed.status,
          notes: parsed.customerNotes || 'No notes provided',
        },
      });
    }

    res.json({
      success: true,
      data: updated,
      message: `Proposal response '${parsed.status}' recorded successfully.`,
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
 * List proposals for agency or filtered by enquiryId
 */
export async function listProposals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const agencyId = req.user?.agencyId;
    const enquiryId = req.query.enquiryId as string;

    const where: any = {};
    if (!isSuperAdmin) {
      if (!agencyId) {
        res.status(403).json({ success: false, message: 'Agency context missing' });
        return;
      }
      where.agencyId = agencyId;
    }
    if (enquiryId) {
      where.enquiryId = enquiryId;
    }

    const proposals = await prisma.weddingProposal.findMany({
      where,
      include: {
        enquiry: {
          select: {
            id: true,
            customerName: true,
            email: true,
            phone: true,
            weddingDate: true,
            location: true,
            guestCount: true,
            referenceNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: proposals });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update proposal terms or budget
 */
export async function updateProposal(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const agencyId = req.user?.agencyId;

    const existing = await prisma.weddingProposal.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Proposal not found' });
      return;
    }

    if (!isSuperAdmin && existing.agencyId !== agencyId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const {
      packageType,
      estimatedBudget,
      proposedServices,
      planningScope,
      termsContent,
      paymentMilestones,
      validUntil,
      status,
    } = req.body;

    const updated = await prisma.weddingProposal.update({
      where: { id },
      data: {
        ...(packageType && { packageType }),
        ...(estimatedBudget !== undefined && { estimatedBudget: Number(estimatedBudget) }),
        ...(proposedServices !== undefined && { proposedServices }),
        ...(planningScope !== undefined && { planningScope }),
        ...(termsContent !== undefined && { termsContent }),
        ...(paymentMilestones !== undefined && { paymentMilestones }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
        ...(status && { status }),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Proposal successfully updated.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
