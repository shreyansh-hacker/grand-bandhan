/**
 * PHASE 1 VERIFICATION TEST SUITE
 * Tests:
 * 1. Canonical EmailLog lifecycle (logId update, zero duplicate rows)
 * 2. Atomic retry concurrency (race-condition protection across workers)
 * 3. Orphaned PROCESSING recovery (stale worker crash recovery)
 * 4. Scheduler duplicate detection (zero P2002 error spam)
 */

import { prisma } from '@grand-bandhan/database';
import { EmailDeliveryStatus, UserRole, AgencyStatus } from '@grand-bandhan/shared';
import { NotificationService } from '../apps/api/src/modules/notifications/notification.service';
import { NotificationEvent } from '../apps/api/src/modules/notifications/notification.types';
import { ProductionSchedulerService } from '../apps/api/src/modules/scheduler/scheduler.service';
import { GmailService } from '../apps/api/src/modules/email/gmail.service';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${msg}`);
    failed++;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('⚡ PHASE 1 EMAIL BLOCKER RESOLUTION TESTS ⚡');
  console.log('======================================================\n');

  const ts = Date.now();

  // Test 1: Canonical EmailLog Lifecycle
  console.log('--- TEST 1: CANONICAL EMAILLOG LIFECYCLE ---');
  const initialLog = await prisma.emailLog.create({
    data: {
      recipientEmail: `test-canonical-${ts}@example.com`,
      eventType: 'PROPOSAL_SENT',
      subject: 'Imperial Proposal Notification',
      templateName: 'PROPOSAL_SENT',
      status: EmailDeliveryStatus.PROCESSING,
      payload: { test: true },
    },
  });

  // Mock GmailService.httpPostJson temporarily so we don't call real Google API
  const originalHttpPostJson = (GmailService as any).httpPostJson;
  const originalGetValidAccessToken = (GmailService as any).getValidAccessToken;

  (GmailService as any).getValidAccessToken = async () => 'mock_access_token';
  (GmailService as any).httpPostJson = async () => ({ id: `gmail_mock_${ts}`, threadId: 'thread_mock_123' });

  try {
    const sendRes = await GmailService.sendEmail({
      to: `test-canonical-${ts}@example.com`,
      subject: 'Imperial Proposal Notification',
      html: '<p>Test Proposal</p>',
      logId: initialLog.id,
    });

    assert(!!sendRes.messageId, 'GmailService.sendEmail completed with messageId');

    // Verify canonical EmailLog updated
    const updatedLog = await prisma.emailLog.findUnique({ where: { id: initialLog.id } });
    assert(updatedLog?.status === EmailDeliveryStatus.SENT, 'Canonical EmailLog status transitioned to SENT');
    assert(updatedLog?.providerMessageId === sendRes.messageId, 'Canonical EmailLog stores providerMessageId');
    assert(!!updatedLog?.sentAt, 'Canonical EmailLog sentAt timestamp populated');
    assert(updatedLog?.errorMessage === null, 'Canonical EmailLog errorMessage cleared');

    // Verify zero duplicate rows created
    const countRows = await prisma.emailLog.count({
      where: { recipientEmail: `test-canonical-${ts}@example.com` },
    });
    assert(countRows === 1, `Zero duplicate rows: exactly 1 EmailLog exists for recipient (count: ${countRows})`);

    // Test 2: Atomic Retry Concurrency (Race Condition Simulation)
    console.log('\n--- TEST 2: ATOMIC RETRY CONCURRENCY ---');
    const failedLog = await prisma.emailLog.create({
      data: {
        recipientEmail: `test-failed-${ts}@example.com`,
        eventType: 'PAYMENT_FAILED',
        subject: 'Payment Failed Alert',
        templateName: 'PAYMENT_FAILED',
        status: EmailDeliveryStatus.FAILED,
        retryCount: 0,
        maxRetries: 3,
        payload: { weddingCode: 'WED-TEST', clientName: 'Test Couple', amount: 50000, milestoneName: 'Deposit' },
      },
    });

    // Simulate two concurrent API instances attempting to claim the exact same failed log
    const [result1, result2] = await Promise.all([
      NotificationService.dispatchSingleLog(failedLog.id),
      NotificationService.dispatchSingleLog(failedLog.id),
    ]);

    const oneDispatched = (result1.success && !result1.alreadyClaimed) || (result2.success && !result2.alreadyClaimed);
    const oneClaimBlocked = result1.alreadyClaimed || result2.alreadyClaimed;

    assert(oneDispatched, 'One worker successfully claims and dispatches the failed notification');
    assert(oneClaimBlocked, 'Second concurrent worker is atomically blocked via database update claim');

    const retriedLog = await prisma.emailLog.findUnique({ where: { id: failedLog.id } });
    assert(retriedLog?.status === EmailDeliveryStatus.SENT, 'Failed log successfully transitioned to SENT');
    assert(retriedLog?.retryCount === 1, 'Retry count incremented exactly once (retryCount: 1)');

    // Test 3: Stale PROCESSING Recovery
    console.log('\n--- TEST 3: ORPHANED PROCESSING AUTO-RECOVERY ---');
    const staleLog = await prisma.emailLog.create({
      data: {
        recipientEmail: `test-stale-${ts}@example.com`,
        eventType: 'TASK_ASSIGNED',
        subject: 'Task Assignment',
        templateName: 'TASK_ASSIGNED',
        status: EmailDeliveryStatus.PROCESSING,
        retryCount: 0,
        maxRetries: 3,
        updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        payload: { taskTitle: 'Decor Check' },
      },
    });

    // Trigger processPendingRetries
    await NotificationService.processPendingRetries(5);
    const recoveredLog = await prisma.emailLog.findUnique({ where: { id: staleLog.id } });
    assert(
      recoveredLog?.status === EmailDeliveryStatus.SENT || recoveredLog?.status === EmailDeliveryStatus.FAILED,
      `Stale PROCESSING row automatically recovered and handled (status: ${recoveredLog?.status})`
    );

    // Test 4: Scheduler Duplicate Reminder Detection (Zero P2002 Spam)
    console.log('\n--- TEST 4: SCHEDULER DUPLICATE REMINDER PRE-CHECK ---');
    const reminderType = `TEST_REMINDER_${ts}`;
    const entityType = 'Payment';
    const entityId = `entity_${ts}`;

    // Claim 1: Should succeed
    const claim1 = await (ProductionSchedulerService as any).claimReminder(reminderType, entityType, entityId);
    assert(claim1 === true, 'Initial reminder claim succeeds');

    // Claim 2: Duplicate check - should return false cleanly via pre-check without throwing P2002
    const claim2 = await (ProductionSchedulerService as any).claimReminder(reminderType, entityType, entityId);
    assert(claim2 === false, 'Subsequent duplicate check returns false cleanly without error');

    console.log('\n======================================================');
    console.log(`PHASE 1 TEST SUMMARY: ${passed} PASSED / ${failed} FAILED`);
    console.log('======================================================\n');
  } finally {
    (GmailService as any).httpPostJson = originalHttpPostJson;
    (GmailService as any).getValidAccessToken = originalGetValidAccessToken;
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
