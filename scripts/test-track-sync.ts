import { prisma } from '@grand-bandhan/database';

function getStepState(
  stepNumber: number,
  enquiry: any
): 'completed' | 'current' | 'pending' | 'upcoming' | 'rejected' {
  if (!enquiry) return 'upcoming';

  const latestConsultation = enquiry.consultations?.[0];
  const latestProposal = enquiry.proposals?.[0];
  const latestAgreement = enquiry.agreements?.[0] || enquiry.convertedWedding?.agreement;
  const isConverted = enquiry.status === 'CONVERTED' || !!enquiry.convertedWeddingId;

  switch (stepNumber) {
    case 1:
      return 'completed';

    case 2:
      if (enquiry.assignedPlanner) {
        const hasPastStage =
          latestConsultation?.status === 'COMPLETED' ||
          enquiry.status === 'CONSULTATION_COMPLETED' ||
          latestProposal ||
          latestAgreement ||
          isConverted;
        return hasPastStage ? 'completed' : 'current';
      }
      return 'current';

    case 3:
      if (
        latestConsultation?.status === 'COMPLETED' ||
        enquiry.status === 'CONSULTATION_COMPLETED' ||
        latestProposal ||
        latestAgreement ||
        isConverted
      ) {
        return 'completed';
      }
      if (
        latestConsultation?.status === 'SCHEDULED' ||
        latestConsultation?.status === 'RESCHEDULED' ||
        enquiry.status === 'CONSULTATION_SCHEDULED'
      ) {
        return 'current';
      }
      return enquiry.assignedPlanner ? 'pending' : 'upcoming';

    case 4:
      if (
        latestProposal?.status === 'ACCEPTED' ||
        isConverted ||
        enquiry.status === 'BOOKING_PENDING'
      ) {
        return 'completed';
      }
      if (latestProposal?.status === 'SENT' || enquiry.status === 'PROPOSAL_SENT') {
        return 'current';
      }
      return latestConsultation?.status === 'COMPLETED' || enquiry.status === 'CONSULTATION_COMPLETED'
        ? 'pending'
        : 'upcoming';

    case 5:
      if (
        latestAgreement?.verificationStatus === 'VERIFIED' ||
        latestAgreement?.status === 'VERIFIED' ||
        isConverted
      ) {
        return 'completed';
      }
      if (latestAgreement?.verificationStatus === 'REJECTED') {
        return 'rejected';
      }
      if (
        latestAgreement?.status === 'SIGNED' ||
        latestAgreement?.status === 'PENDING_VERIFICATION' ||
        latestAgreement?.verificationStatus === 'PENDING'
      ) {
        return 'current';
      }
      if (latestAgreement?.status === 'SENT' || latestAgreement?.status === 'DRAFT') {
        return 'current';
      }
      return latestProposal?.status === 'ACCEPTED' ? 'pending' : 'upcoming';

    case 6:
      if (isConverted || enquiry.status === 'CONVERTED') {
        return 'completed';
      }
      return latestAgreement?.verificationStatus === 'VERIFIED' || latestAgreement?.status === 'VERIFIED'
        ? 'current'
        : 'upcoming';

    default:
      return 'upcoming';
  }
}

async function main() {
  const enquiry = await prisma.customerEnquiry.findUnique({
    where: { referenceNumber: 'GB-ENQ-2026-1097' },
    include: {
      agency: { select: { name: true, contactEmail: true, contactPhone: true } },
      assignedPlanner: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      consultations: {
        select: {
          id: true,
          scheduledAt: true,
          meetingType: true,
          meetingLink: true,
          meetingLocation: true,
          status: true,
          meetingNotes: true,
          coupleVision: true,
          themePreferences: true,
          guestCountConfirmed: true,
          budgetDiscussed: true,
          completedAt: true,
        },
        orderBy: { scheduledAt: 'desc' },
      },
      proposals: {
        select: {
          id: true,
          proposalNumber: true,
          packageType: true,
          estimatedBudget: true,
          status: true,
          validUntil: true,
          acceptedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      agreements: {
        select: {
          id: true,
          agreementNumber: true,
          status: true,
          verificationStatus: true,
          signedByName: true,
          signedAt: true,
          verifiedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!enquiry) {
    console.error('Enquiry not found!');
    return;
  }

  console.log('Testing Step States for GB-ENQ-2026-1097:');
  for (let step = 1; step <= 6; step++) {
    const state = getStepState(step, enquiry);
    console.log(`Step ${step}: ${state.toUpperCase()}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
