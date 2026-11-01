import { ProductionSchedulerService } from '../scheduler/scheduler.service';
import { prisma } from '@grand-bandhan/database';
import {
  ServiceVerificationStatus,
  SOCKET_EVENTS,
} from '@grand-bandhan/shared';
import { broadcastWeddingUpdate } from '../../socket';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

let schedulerInterval: NodeJS.Timeout | null = null;
let isExecuting = false;

/**
 * Execute a single pass checking for due/overdue service verifications
 */
export async function runVerificationCheck(): Promise<{
  checked: number;
  broadcastCount: number;
  escalatedCount: number;
}> {
  if (isExecuting) {
    return { checked: 0, broadcastCount: 0, escalatedCount: 0 };
  }

  isExecuting = true;
  let broadcastCount = 0;
  let escalatedCount = 0;

  try {
    const now = new Date();

    // Query active verifications whose scheduled confirmation time has arrived or passed
    const dueVerifications = await prisma.serviceVerification.findMany({
      where: {
        status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
        scheduledConfirmationTime: { lte: now },
      },
      include: {
        vendor: true,
        wedding: {
          select: {
            id: true,
            agencyId: true,
            weddingCode: true,
            brideName: true,
            groomName: true,
          },
        },
      },
      take: 50,
    });

    for (const item of dueVerifications) {
      const history = Array.isArray(item.auditHistory)
        ? (item.auditHistory as any[])
        : [];

      // Find the last broadcast timestamp
      const lastBroadcastEntry = [...history]
        .reverse()
        .find((h) => h.action === 'SCHEDULED_TRIGGER_BROADCAST');

      const lastBroadcastTime = lastBroadcastEntry
        ? new Date(lastBroadcastEntry.timestamp).getTime()
        : 0;

      const millisSinceLastBroadcast = now.getTime() - lastBroadcastTime;
      const fifteenMinutesMs = 15 * 60 * 1000;
      const thirtyMinutesMs = 30 * 60 * 1000;

      // Multi-instance safe verification broadcast claim (15-min atomic bucket)
      const broadcastBucket = Math.floor(now.getTime() / fifteenMinutesMs);
      const broadcastReminderType = `VERIFY_BROADCAST_${broadcastBucket}`;

      if (!lastBroadcastEntry || millisSinceLastBroadcast >= fifteenMinutesMs) {
        const claimed = await ProductionSchedulerService.claimReminder(
          broadcastReminderType,
          'ServiceVerification',
          item.id,
          item.wedding.agencyId
        );

        if (claimed) {
          broadcastWeddingUpdate(
            item.weddingId,
            SOCKET_EVENTS.SERVICE_VERIFICATION_TRIGGERED,
            {
              verification: item,
              scheduledConfirmationTime: item.scheduledConfirmationTime,
              isOverduePrompt: true,
            }
          );

          history.push({
            action: 'SCHEDULED_TRIGGER_BROADCAST',
            timestamp: now.toISOString(),
            attempt: (lastBroadcastEntry?.attempt || 0) + 1,
          });

          await prisma.serviceVerification.update({
            where: { id: item.id },
            data: { auditHistory: history },
          });

          await ProductionSchedulerService.markReminderSent(
            broadcastReminderType,
            'ServiceVerification',
            item.id,
            claimed
          );

          broadcastCount++;
        }
      }

      // Multi-instance safe escalation claim (> 30 mins past scheduled time)
      const millisPastDue = now.getTime() - new Date(item.scheduledConfirmationTime).getTime();
      const alreadyEscalated = history.some((h) => h.action === 'UNANSWERED_ESCALATION');

      if (millisPastDue >= thirtyMinutesMs && !alreadyEscalated) {
        const escalationType = 'VERIFY_ESCALATION_30M';
        const claimed = await ProductionSchedulerService.claimReminder(
          escalationType,
          'ServiceVerification',
          item.id,
          item.wedding.agencyId
        );

        if (claimed) {
          history.push({
            action: 'UNANSWERED_ESCALATION',
            timestamp: now.toISOString(),
            minutesOverdue: Math.floor(millisPastDue / 60000),
          });

          await prisma.serviceVerification.update({
            where: { id: item.id },
            data: { auditHistory: history },
          });

          try {
            await NotificationService.emit(NotificationEvent.SERVICE_ISSUE_REPORTED, {
              agencyId: item.wedding.agencyId,
              recipientEmail: item.vendor.email,
              recipientName: item.vendor.name,
              recipientRole: 'VENDOR',
              data: {
                vendorName: item.vendor.name,
                serviceName: item.serviceName,
                issueNotes: `Service confirmation for "${item.serviceName}" has been pending for over 30 minutes past scheduled time (${item.scheduledConfirmationTime.toISOString()}).`,
              },
            });
            await ProductionSchedulerService.markReminderSent(
              escalationType,
              'ServiceVerification',
              item.id,
              claimed
            );
          } catch (notifErr: any) {
            console.warn('[Scheduler] Notification dispatch warning:', notifErr.message);
            await ProductionSchedulerService.markReminderFailed(
              escalationType,
              'ServiceVerification',
              item.id,
              notifErr.message,
              claimed
            );
          }

          escalatedCount++;
        }
      }
    }

    return {
      checked: dueVerifications.length,
      broadcastCount,
      escalatedCount,
    };
  } catch (err: any) {
    console.error('[Scheduler] Error running verification check:', err.message);
    return { checked: 0, broadcastCount: 0, escalatedCount: 0 };
  } finally {
    isExecuting = false;
  }
}

/**
 * Initialize recurring background scheduler on the Render API server
 */
export function startVerificationScheduler(intervalMs = 60000): void {
  if (schedulerInterval) {
    return;
  }

  console.log(`⏱️ Initializing Grand Bandhan Service Verification Scheduler (interval: ${intervalMs / 1000}s)`);

  // Run initial check after 5 seconds to catch any past-due verifications on server boot
  setTimeout(() => {
    runVerificationCheck().catch((err) =>
      console.warn('[Scheduler] Initial pass error:', err)
    );
  }, 5000);

  schedulerInterval = setInterval(() => {
    runVerificationCheck().catch((err) =>
      console.warn('[Scheduler] Recurring pass error:', err)
    );
  }, intervalMs);
}

/**
 * Stop scheduler gracefully
 */
export function stopVerificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏱️ Stopped Grand Bandhan Service Verification Scheduler');
  }
}
