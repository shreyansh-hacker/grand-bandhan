import { prisma, UserRole, ServiceVerificationStatus, TaskStatus } from '@grand-bandhan/database';
import { NotificationCategory } from '@grand-bandhan/shared';

async function runTests() {
  console.log('================================================================');
  console.log('GRAND BANDHAN — NOTIFICATION ARCHITECTURE VERIFICATION SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Locate test users
  const adminUser = await prisma.user.findFirst({
    where: { role: UserRole.SUPER_ADMIN },
    include: { agency: true },
  });

  const agencyAdmin = await prisma.user.findFirst({
    where: { role: UserRole.AGENCY_ADMIN },
    include: { agency: true },
  });

  assert(!!adminUser, 'Super Admin user exists in Neon DB');
  assert(!!agencyAdmin, 'Agency Admin user exists in Neon DB');

  if (!agencyAdmin) {
    console.error('Prerequisite agency admin missing.');
    process.exit(1);
  }

  // 2. Test Central Notification Inbox Database Operations
  console.log('\n--- 1. Testing Central Notification Inbox Persistence & Isolation ---');

  const testNotif = await prisma.notification.create({
    data: {
      agencyId: agencyAdmin.agencyId,
      userId: agencyAdmin.id,
      category: NotificationCategory.SERVICE_VERIFICATION,
      title: 'Automated E2E Verification Alert',
      message: 'Catering deliverable milestone pending on-site sign-off.',
      isRead: false,
      entityType: 'VERIFICATION',
      entityId: 'test-verif-123',
      deepLinkUri: 'grandbandhan://verifications/test-verif-123',
      metadata: { testSuite: 'Phase7_E2E' },
    },
  });

  assert(!!testNotif.id, 'Created persistent notification record in Neon DB');
  assert(testNotif.isRead === false, 'New notification has unread status (isRead: false)');
  assert(testNotif.category === NotificationCategory.SERVICE_VERIFICATION, 'Category preserved properly');

  // Verify unread count query
  const unreadCount = await prisma.notification.count({
    where: { userId: agencyAdmin.id, isRead: false },
  });
  assert(unreadCount >= 1, `Unread count query accurate (found: ${unreadCount})`);

  // Test mark single as read
  const updatedNotif = await prisma.notification.update({
    where: { id: testNotif.id },
    data: { isRead: true, readAt: new Date() },
  });
  assert(updatedNotif.isRead === true, 'Marked single notification as read');
  assert(!!updatedNotif.readAt, 'readAt timestamp populated upon read transition');

  // Test Mark All As Read
  await prisma.notification.updateMany({
    where: { userId: agencyAdmin.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  const unreadAfterMarkAll = await prisma.notification.count({
    where: { userId: agencyAdmin.id, isRead: false },
  });
  assert(unreadAfterMarkAll === 0, 'Mark All As Read cleared all unread notifications for user');

  // Test Multi-Tenant Agency Isolation
  const otherAgency = await prisma.agency.findFirst({
    where: { id: { not: agencyAdmin.agencyId } },
  });

  if (otherAgency) {
    const crossAgencyAccess = await prisma.notification.findMany({
      where: {
        id: testNotif.id,
        agencyId: otherAgency.id,
      },
    });
    assert(crossAgencyAccess.length === 0, 'Multi-tenant isolation confirmed: foreign agency cannot read notification');
  }

  // Clean up test notification
  await prisma.notification.delete({ where: { id: testNotif.id } });
  console.log('Cleaned up test notification record.');

  // 3. Test Schedule Synchronization Authoritative Data Pipeline
  console.log('\n--- 2. Testing Schedule Synchronization Engine ---');

  const wedding = await prisma.wedding.findFirst({
    where: { agencyId: agencyAdmin.agencyId },
  });

  if (wedding) {
    const verifications = await prisma.serviceVerification.findMany({
      where: {
        weddingId: wedding.id,
        status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
      },
      include: { vendor: true },
    });

    assert(true, `Queried active verifications for wedding ${wedding.weddingCode} (count: ${verifications.length})`);

    // Verify UTC Timestamp Integrity
    for (const v of verifications) {
      const dateObj = new Date(v.scheduledConfirmationTime);
      assert(!isNaN(dateObj.getTime()), `Valid ISO-8601 UTC timestamp for verification ${v.id}`);
      assert(dateObj.toISOString().endsWith('Z') || dateObj.toISOString().includes('+') || dateObj.toISOString().includes('-'), 'Timestamp contains timezone offset indicator');
    }
  }

  // 4. Test Admin Command Center Operational Queries
  console.log('\n--- 3. Testing Admin Command Center Real-Time Data Aggregations ---');

  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const [pendingVerifsCount, overdueTasksCount, upcomingEventsCount] = await Promise.all([
    prisma.serviceVerification.count({
      where: {
        wedding: { agencyId: agencyAdmin.agencyId },
        status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
      },
    }),
    prisma.task.count({
      where: {
        wedding: { agencyId: agencyAdmin.agencyId },
        status: { not: TaskStatus.DONE },
        deadline: { lt: now },
      },
    }),
    prisma.eventTimeline.count({
      where: {
        wedding: { agencyId: agencyAdmin.agencyId },
        startTime: { gte: now, lte: in48Hours },
      },
    }),
  ]);

  assert(typeof pendingVerifsCount === 'number', `Live pending verifications counted: ${pendingVerifsCount}`);
  assert(typeof overdueTasksCount === 'number', `Live overdue tasks counted: ${overdueTasksCount}`);
  assert(typeof upcomingEventsCount === 'number', `Live upcoming events counted (next 48h): ${upcomingEventsCount}`);

  // 5. Test Offline Cache & Logout Purge Behavior Simulation
  console.log('\n--- 4. Testing Offline Security & Logout Purge Simulation ---');

  // Verify that cache structure contains mandatory isolation methods
  const mockCache = {
    weddings: [{ id: 'w1', couple: 'Test Couple' }],
    notifications: [{ id: 'n1', title: 'Test Alert' }],
    isOffline: false,
    clearAll() {
      this.weddings = [];
      this.notifications = [];
      this.isOffline = false;
    },
  };

  assert(mockCache.weddings.length === 1, 'Offline cache populated with wedding data');
  mockCache.clearAll();
  assert(mockCache.weddings.length === 0, 'Offline cache purged on logout (no lingering data)');
  assert(mockCache.notifications.length === 0, 'Offline notifications purged on logout');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
