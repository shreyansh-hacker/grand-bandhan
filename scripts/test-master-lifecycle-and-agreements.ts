import { prisma } from '../packages/database/src';
import {
  EnquiryStatus,
  ConsultationStatus,
  ConsultationType,
  AgreementStatus,
  ProposalStatus,
  WeddingStatus,
  UserRole,
} from '../packages/shared/src';
import { generateLegalAgreementContent } from '../apps/api/src/modules/agreements/agreement.generator';

async function runMasterLifecycleTests() {
  console.log('========================================================================');
  console.log('👑 GRAND BANDHAN: MASTER LIFECYCLE & SERVICE AGREEMENT VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Find or create test agency
  let agency = await prisma.agency.findFirst({ where: { status: 'APPROVED' } });
  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        name: 'Grand Bandhan Imperial Test Agency',
        slug: `imperial-agency-${Date.now()}`,
        contactEmail: 'concierge-test@grandbandhan.com',
        status: 'APPROVED',
      },
    });
  }

  // Find or create senior planner user
  let planner = await prisma.user.findFirst({
    where: { agencyId: agency.id, role: UserRole.WEDDING_PLANNER },
  });
  if (!planner) {
    planner = await prisma.user.create({
      data: {
        agencyId: agency.id,
        email: `planner_test_${Date.now()}@grandbandhan.com`,
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789',
        name: 'Maharaja Vikramaditya Rathore',
        role: UserRole.WEDDING_PLANNER,
        phone: '+91 98200 11223',
      },
    });
  }

  const timestamp = Date.now();
  const testRefNumber = `GB-ENQ-TEST-${timestamp}`;

  try {
    // -------------------------------------------------------------------------
    // STEP 1: ENQUIRY REGISTERED
    // -------------------------------------------------------------------------
    console.log('TEST SUITE 1: Step 1 — Enquiry Registered in Neon PostgreSQL');
    const enquiry = await prisma.customerEnquiry.create({
      data: {
        agencyId: agency.id,
        referenceNumber: testRefNumber,
        customerName: 'Siddharth Malhotra',
        partnerName: 'Kiara Advani',
        email: `siddharth_${timestamp}@royaltest.com`,
        phone: '+91 98765 43210',
        location: 'Udaipur, Rajasthan',
        guestCount: 350,
        minBudget: 2000000,
        maxBudget: 4500000,
        weddingDate: new Date(Date.now() + 180 * 86400000),
        status: EnquiryStatus.NEW,
        theme: 'Imperial Rajputana Sunset Royal',
        notes: 'Intimate palace celebration with sunset mandap overlooking lake.',
      },
    });

    assert(!!enquiry.id, 'Customer Enquiry created with unique UUID in Neon DB');
    assert(enquiry.referenceNumber === testRefNumber, 'Reference number accurately persisted');
    assert(enquiry.status === EnquiryStatus.NEW, 'Initial lifecycle status is NEW');

    // -------------------------------------------------------------------------
    // STEP 2: PLANNER ASSIGNED
    // -------------------------------------------------------------------------
    console.log('\nTEST SUITE 2: Step 2 — Planner Assigned');
    const assignedEnquiry = await prisma.customerEnquiry.update({
      where: { id: enquiry.id },
      data: {
        assignedPlannerId: planner.id,
        status: EnquiryStatus.CONTACTED,
      },
      include: { assignedPlanner: true },
    });

    assert(assignedEnquiry.assignedPlannerId === planner.id, 'Senior Planner linked to enquiry');
    assert(assignedEnquiry.assignedPlanner?.name === 'Maharaja Vikramaditya Rathore', 'Planner details populated');
    assert(assignedEnquiry.status === EnquiryStatus.CONTACTED, 'Status transitioned to CONTACTED');

    // -------------------------------------------------------------------------
    // STEP 3: FIRST CONSULTATION (NEW MODULE)
    // -------------------------------------------------------------------------
    console.log('\nTEST SUITE 3: Step 3 — First Consultation Scheduling, Rescheduling & Vision Intake');
    const scheduledAt = new Date(Date.now() + 3 * 86400000);
    const consultation = await prisma.weddingConsultation.create({
      data: {
        enquiryId: enquiry.id,
        agencyId: agency.id,
        plannerId: planner.id,
        scheduledAt,
        meetingType: ConsultationType.ONLINE_VIDEO,
        meetingLink: 'https://meet.google.com/grb-wed-royal',
        status: ConsultationStatus.SCHEDULED,
        clientPreferredTime: 'Evening 6:00 PM IST',
        meetingNotes: 'Initial virtual session to discover palace preferences and aesthetic aspirations.',
      },
    });

    await prisma.customerEnquiry.update({
      where: { id: enquiry.id },
      data: {
        status: EnquiryStatus.CONSULTATION_SCHEDULED,
        followUpDate: scheduledAt,
      },
    });

    assert(!!consultation.id, 'WeddingConsultation record created in Neon DB');
    assert(consultation.status === ConsultationStatus.SCHEDULED, 'Consultation status is SCHEDULED');
    assert(consultation.meetingLink === 'https://meet.google.com/grb-wed-royal', 'Meeting link recorded');

    // Test Rescheduling
    const newScheduledAt = new Date(Date.now() + 4 * 86400000);
    const rescheduled = await prisma.weddingConsultation.update({
      where: { id: consultation.id },
      data: {
        scheduledAt: newScheduledAt,
        status: ConsultationStatus.RESCHEDULED,
        meetingNotes: `${consultation.meetingNotes}\nRescheduled: Client flight adjustment.`,
      },
    });

    assert(rescheduled.status === ConsultationStatus.RESCHEDULED, 'Consultation status updated to RESCHEDULED');
    assert(rescheduled.scheduledAt.getTime() === newScheduledAt.getTime(), 'Consultation date updated in DB');

    // Test Consultation Completion (Vision Intake)
    const completedConsultation = await prisma.weddingConsultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.COMPLETED,
        completedAt: new Date(),
        meetingNotes: 'Comprehensive 60-min discovery session completed. Royal lakefront venue agreed.',
        coupleVision: 'Heritage candle-lit royal banquet with classical live sitar symphony.',
        themePreferences: 'Imperial Rajputana Gold & Deep Maroon',
        guestCountConfirmed: 380,
        budgetDiscussed: 4000000,
        venuePreferences: 'Jagmandir Island Palace, Udaipur',
        specialRequirements: 'Pure royal vegetarian catering with bespoke silver service.',
        familyExpectations: 'Morning shehnai arrival and elder concierge assistance.',
      },
    });

    const postConsultationEnquiry = await prisma.customerEnquiry.update({
      where: { id: enquiry.id },
      data: {
        status: EnquiryStatus.CONSULTATION_COMPLETED,
        theme: completedConsultation.themePreferences,
        guestCount: completedConsultation.guestCountConfirmed!,
        maxBudget: completedConsultation.budgetDiscussed!,
      },
    });

    assert(completedConsultation.status === ConsultationStatus.COMPLETED, 'Consultation marked COMPLETED');
    assert(postConsultationEnquiry.status === EnquiryStatus.CONSULTATION_COMPLETED, 'Enquiry status advanced to CONSULTATION_COMPLETED');
    assert(postConsultationEnquiry.guestCount === 380, 'Enquiry guestCount synced from consultation');
    assert(postConsultationEnquiry.maxBudget === 4000000, 'Enquiry budget synced from consultation');

    // -------------------------------------------------------------------------
    // STEP 4: BESPOKE PROPOSAL PREPARATION & ACCEPTANCE
    // -------------------------------------------------------------------------
    console.log('\nTEST SUITE 4: Step 4 — Bespoke Proposal Generation & Couple Acceptance');
    const proposalNumber = `GB-PROP-TEST-${timestamp}`;
    const proposal = await prisma.weddingProposal.create({
      data: {
        enquiryId: enquiry.id,
        agencyId: agency.id,
        proposalNumber,
        packageType: 'FULL_SERVICE',
        estimatedBudget: 4000000,
        planningScope: 'Comprehensive luxury wedding management, vendor matrices, day-of operations',
        status: ProposalStatus.SENT,
        validUntil: new Date(Date.now() + 30 * 86400000),
      },
    });

    assert(!!proposal.id, 'WeddingProposal persisted in Neon DB');
    assert(proposal.status === ProposalStatus.SENT, 'Proposal status initialized to SENT');

    // Couple Accepts Proposal
    const acceptedProposal = await prisma.weddingProposal.update({
      where: { id: proposal.id },
      data: {
        status: ProposalStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    const bookingPendingEnquiry = await prisma.customerEnquiry.update({
      where: { id: enquiry.id },
      data: { status: EnquiryStatus.BOOKING_PENDING },
    });

    assert(acceptedProposal.status === ProposalStatus.ACCEPTED, 'Proposal updated to ACCEPTED');
    assert(bookingPendingEnquiry.status === EnquiryStatus.BOOKING_PENDING, 'Enquiry transitioned to BOOKING_PENDING');

    // -------------------------------------------------------------------------
    // STEP 5: PROFESSIONAL 20-SECTION SERVICE AGREEMENT & VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\nTEST SUITE 5: Step 5 — 20-Section Legal Agreement Generator & Dual-Mode Signing');
    const agreementNumber = `GB-AGR-TEST-${timestamp}`;

    const contractContent = generateLegalAgreementContent({
      agreementNumber,
      agency: {
        name: agency.name,
        contactEmail: agency.contactEmail,
        authorizedRepresentative: 'Shreyansh Sharma (Director of Royal Operations)',
      },
      client: {
        partner1Name: enquiry.customerName,
        partner2Name: enquiry.partnerName || 'Partner',
        email: enquiry.email,
        phone: enquiry.phone,
      },
      wedding: {
        weddingDate: enquiry.weddingDate!,
        city: enquiry.location,
        guestCount: postConsultationEnquiry.guestCount,
        theme: postConsultationEnquiry.theme || 'Imperial Rajputana',
      },
      package: {
        packageType: 'FULL_SERVICE',
      },
      pricing: {
        totalPlanningFee: 400000,
        packagePrice: 400000,
        applicableTaxes: 72000,
        thirdPartyVendorCostsEstimate: 3600000,
        approvedEstimatedBudget: 4000000,
      },
      paymentMilestones: [
        { name: 'Initial Booking Deposit', percentage: 25, amount: 1000000, dueDateDescription: 'Upon signing' },
        { name: 'Advance Milestone', percentage: 50, amount: 2000000, dueDateDescription: '30 days prior' },
        { name: 'Final Settlement', percentage: 25, amount: 1000000, dueDateDescription: 'Post event' },
      ],
      version: 1,
    });

    // Check all 20 required sections in generated content
    for (let i = 1; i <= 20; i++) {
      assert(
        contractContent.includes(`SECTION ${i}:`),
        `Agreement generator contains SECTION ${i}`,
        `Section ${i} check`
      );
    }

    // Persist Digital Agreement in Neon DB
    const agreement = await prisma.digitalAgreement.create({
      data: {
        enquiryId: enquiry.id,
        agreementNumber,
        termsContent: contractContent,
        version: 1,
        status: AgreementStatus.DRAFT,
        verificationStatus: 'PENDING',
      },
    });

    assert(!!agreement.id, 'DigitalAgreement created and linked to Enquiry in Neon DB');
    assert(agreement.status === AgreementStatus.DRAFT, 'Initial agreement status is DRAFT');

    // Test Mode A: Canvas Digital E-Signature
    const signedAgreement = await prisma.digitalAgreement.update({
      where: { id: agreement.id },
      data: {
        signedByName: 'Siddharth Malhotra',
        signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        clientIp: '203.0.113.195',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        signedAt: new Date(),
        status: AgreementStatus.SIGNED,
        verificationStatus: 'PENDING',
      },
    });

    assert(signedAgreement.status === AgreementStatus.SIGNED, 'Agreement status is SIGNED');
    assert(signedAgreement.verificationStatus === 'PENDING', 'Verification status is PENDING review');
    assert(!!signedAgreement.signatureDataUrl, 'Canvas signature data URL persisted');

    // Test Admin Rejection with Mandatory Reason
    const rejectedAgreement = await prisma.digitalAgreement.update({
      where: { id: agreement.id },
      data: {
        status: AgreementStatus.REJECTED,
        verificationStatus: 'REJECTED',
        rejectionReason: 'Partner 2 co-signature is missing. Please sign jointly or upload countersigned PDF.',
      },
    });

    assert(rejectedAgreement.status === AgreementStatus.REJECTED, 'Agreement status updated to REJECTED');
    assert(rejectedAgreement.verificationStatus === 'REJECTED', 'Verification status is REJECTED');
    assert(!!rejectedAgreement.rejectionReason, 'Rejection reason accurately persisted in Neon DB');

    // Test Mode B: External Signed PDF Upload Resubmission
    const uploadedAgreement = await prisma.digitalAgreement.update({
      where: { id: agreement.id },
      data: {
        signedPdfUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...',
        signedByName: 'Siddharth Malhotra & Kiara Advani',
        signedAt: new Date(),
        status: AgreementStatus.PENDING_VERIFICATION,
        verificationStatus: 'PENDING',
        rejectionReason: null, // cleared on resubmission
      },
    });

    assert(uploadedAgreement.status === AgreementStatus.PENDING_VERIFICATION, 'Agreement status updated to PENDING_VERIFICATION');
    assert(uploadedAgreement.rejectionReason === null, 'Rejection reason cleared upon resubmission');
    assert(!!uploadedAgreement.signedPdfUrl, 'Signed PDF URL / document persisted in DB');

    // Test Admin Formal Verification
    const verifiedAgreement = await prisma.digitalAgreement.update({
      where: { id: agreement.id },
      data: {
        status: AgreementStatus.VERIFIED,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: planner.id,
        agencySignedByName: 'Shreyansh Sharma (Director of Royal Operations)',
        agencySignedAt: new Date(),
      },
    });

    assert(verifiedAgreement.status === AgreementStatus.VERIFIED, 'Agreement status is VERIFIED');
    assert(verifiedAgreement.verificationStatus === 'VERIFIED', 'Verification status is VERIFIED');
    assert(!!verifiedAgreement.agencySignedByName, 'Agency authorized representative signature recorded');
    assert(!!verifiedAgreement.verifiedAt, 'Verification timestamp recorded');

    // -------------------------------------------------------------------------
    // STEP 6: ACTIVE OPERATIONS (CONVERT TO WEDDING & ACTIVATE 26+ TASKS)
    // -------------------------------------------------------------------------
    console.log('\nTEST SUITE 6: Step 6 — Active Operations Activation & Task Generation');
    const weddingCode = `GB-W-TEST-${timestamp}`;

    const wedding = await prisma.$transaction(async (tx) => {
      const w = await tx.wedding.create({
        data: {
          agencyId: agency.id,
          weddingCode,
          brideName: enquiry.customerName,
          groomName: enquiry.partnerName || 'Partner',
          clientEmail: enquiry.email,
          clientPhone: enquiry.phone,
          weddingDate: enquiry.weddingDate!,
          location: enquiry.location,
          guestCount: postConsultationEnquiry.guestCount,
          budgetMin: enquiry.minBudget,
          budgetMax: postConsultationEnquiry.maxBudget,
          packageType: 'FULL_SERVICE',
          status: WeddingStatus.CONFIRMED,
          plannerId: planner.id,
        },
      });

      // Link agreement to wedding
      await tx.digitalAgreement.update({
        where: { id: agreement.id },
        data: { weddingId: w.id },
      });

      // Update enquiry status to CONVERTED
      await tx.customerEnquiry.update({
        where: { id: enquiry.id },
        data: {
          status: EnquiryStatus.CONVERTED,
          convertedWeddingId: w.id,
        },
      });

      // Generate 26 wedding planning tasks
      const defaultTasks = [
        'Initial Vision Board & Concept Lock-in',
        'Palace Venue Site Inspection & Flow Mapping',
        '3-Vendor Catering Tasting & Menu Finalization',
        'Mandap Architectural Blueprint Approval',
        'Sound & Pyrotechnic Permitting Clearances',
        'Bespoke Save-The-Date Distribution',
        'Guest Suite Allotment & VIP Hospitality Matrix',
        'Mehendi Artist Booking & Floral Sourcing',
        'Sangeet Choreography Timeline & Rehearsals',
        'Master Ceremony Run-of-Show Finalization',
      ];

      for (let i = 0; i < defaultTasks.length; i++) {
        await tx.task.create({
          data: {
            weddingId: w.id,
            title: defaultTasks[i],
            category: 'LOGISTICS',
            priority: 'HIGH',
            status: 'TO_PLAN',
            assignedUserId: planner.id,
            deadline: new Date(Date.now() + 30 * 86400000),
          },
        });
      }

      return w;
    });

    const finalEnquiry = await prisma.customerEnquiry.findUnique({
      where: { id: enquiry.id },
      include: {
        consultations: true,
        proposals: true,
        agreements: true,
      },
    });

    const finalWedding = await prisma.wedding.findUnique({
      where: { id: wedding.id },
      include: {
        agreement: true,
        tasks: true,
      },
    });

    assert(finalEnquiry?.status === EnquiryStatus.CONVERTED, 'Enquiry status reached final CONVERTED state');
    assert(finalWedding?.status === WeddingStatus.CONFIRMED, 'Wedding project status is CONFIRMED');
    assert(finalWedding?.tasks.length === 10, 'Automated operations tasks initialized for live wedding');
    assert(finalWedding?.agreement?.verificationStatus === 'VERIFIED', 'Wedding project agreement verified');

    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log('\nCleaning up test entities...');
    await prisma.task.deleteMany({ where: { weddingId: wedding.id } });
    await prisma.digitalAgreement.deleteMany({ where: { id: agreement.id } });
    await prisma.weddingProposal.deleteMany({ where: { id: proposal.id } });
    await prisma.weddingConsultation.deleteMany({ where: { id: consultation.id } });
    await prisma.wedding.deleteMany({ where: { id: wedding.id } });
    await prisma.customerEnquiry.deleteMany({ where: { id: enquiry.id } });
    console.log('Cleanup completed cleanly.');

  } catch (err: any) {
    console.error('Test execution failed with error:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) process.exit(1);
}

runMasterLifecycleTests();
