import { prisma, ServiceVerificationStatus } from '@grand-bandhan/database';
import { runVerificationCheck } from '../apps/api/src/modules/verifications/verification.scheduler';

async function testScheduler() {
  console.log('====================================================');
  console.log('TESTING VERIFICATION SCHEDULER (Phase 3 Acceptance)');
  console.log('====================================================');

  // 1. Find an existing wedding and vendor
  const wedding = await prisma.wedding.findFirst({
    include: { agency: true },
  });
  const vendor = await prisma.vendor.findFirst();

  if (!wedding || !vendor) {
    console.error('❌ Missing prerequisite wedding or vendor in database.');
    process.exit(1);
  }

  console.log(`Using Wedding: ${wedding.weddingCode} (${wedding.brideName} & ${wedding.groomName})`);
  console.log(`Using Vendor: ${vendor.name} (${vendor.category})`);

  // 2. Create test verification overdue by 35 minutes
  const overdueTime = new Date(Date.now() - 35 * 60 * 1000);
  const testRecord = await prisma.serviceVerification.create({
    data: {
      weddingId: wedding.id,
      vendorId: vendor.id,
      serviceName: 'Automated Scheduler Test Service Verification',
      scheduledConfirmationTime: overdueTime,
      status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
      auditHistory: [],
    },
  });

  console.log(`\nCreated test ServiceVerification: ${testRecord.id}`);
  console.log(`Scheduled Confirmation Time: ${overdueTime.toISOString()} (35m in the past)`);

  try {
    // 3. Execute first pass of runVerificationCheck()
    console.log('\n--- Pass 1: Initial Trigger & Escalation Execution ---');
    const pass1 = await runVerificationCheck();
    console.log('Pass 1 Results:', pass1);

    if (pass1.broadcastCount < 1) {
      throw new Error(`Expected at least 1 broadcast in Pass 1, got ${pass1.broadcastCount}`);
    }
    if (pass1.escalatedCount < 1) {
      throw new Error(`Expected at least 1 escalation in Pass 1, got ${pass1.escalatedCount}`);
    }

    // Inspect updated record from DB
    const updatedRecord = await prisma.serviceVerification.findUnique({
      where: { id: testRecord.id },
    });
    const history1 = (updatedRecord?.auditHistory as any[]) || [];
    console.log('Recorded Audit History after Pass 1:');
    history1.forEach((h, i) => console.log(`  [${i + 1}] ${h.action} @ ${h.timestamp}`));

    const hasBroadcast = history1.some((h) => h.action === 'SCHEDULED_TRIGGER_BROADCAST');
    const hasEscalation = history1.some((h) => h.action === 'UNANSWERED_ESCALATION');

    if (!hasBroadcast || !hasEscalation) {
      throw new Error('Audit history missing SCHEDULED_TRIGGER_BROADCAST or UNANSWERED_ESCALATION');
    }
    console.log('✅ Pass 1 Verified: Overdue record claimed, broadcast fired, escalation triggered.');

    // 4. Execute Pass 2 immediately (Idempotency & Duplicate Prevention test)
    console.log('\n--- Pass 2: Immediate Re-check (15-Minute Throttle Test) ---');
    const pass2 = await runVerificationCheck();
    console.log('Pass 2 Results:', pass2);

    // Verify test record was not re-broadcast or re-escalated
    const updatedRecord2 = await prisma.serviceVerification.findUnique({
      where: { id: testRecord.id },
    });
    const history2 = (updatedRecord2?.auditHistory as any[]) || [];

    const broadcastCountForTestRecord = history2.filter((h) => h.action === 'SCHEDULED_TRIGGER_BROADCAST').length;
    const escalationCountForTestRecord = history2.filter((h) => h.action === 'UNANSWERED_ESCALATION').length;

    if (broadcastCountForTestRecord !== 1 || escalationCountForTestRecord !== 1) {
      throw new Error(`Throttle failed! Broadcasts: ${broadcastCountForTestRecord}, Escalations: ${escalationCountForTestRecord}`);
    }
    console.log('✅ Pass 2 Verified: 15-minute throttle prevented duplicate broadcast and duplicate escalation.');

    console.log('\n====================================================');
    console.log('✅ ALL VERIFICATION SCHEDULER ACCEPTANCE CHECKS PASSED');
    console.log('====================================================');
  } finally {
    // 5. Cleanup test record
    await prisma.serviceVerification.delete({
      where: { id: testRecord.id },
    });
    console.log(`Cleaned up test ServiceVerification ${testRecord.id}`);
  }
}

testScheduler()
  .catch((err) => {
    console.error('❌ Scheduler Acceptance Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
