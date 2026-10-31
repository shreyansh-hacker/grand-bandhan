import { prisma } from '@grand-bandhan/database';
import { PaymentStatus, TaskStatus, WeddingStatus, UserRole } from '@grand-bandhan/shared';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';

// Standard IST Offset (+05:30)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getNowIST(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

export function formatISTDate(date: Date): string {
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);
  return istDate.toISOString().slice(0, 10);
}

export interface SchedulerRunResult {
  paymentDueReminders: number;
  paymentOverdueReminders: number;
  taskDeadlineReminders: number;
  taskOverdueReminders: number;
  weddingReminders: number;
  eventReminders: number;
  vendorVerifications: number;
  retriesProcessed: number;
}

export class ProductionSchedulerService {
  private static isRunning = false;

  /**
   * Execute a complete scheduled reminder sweep across all active agencies.
   * Atomically claims jobs to prevent duplicate dispatches across concurrent instances.
   */
  public static async runAllChecks(): Promise<SchedulerRunResult> {
    if (this.isRunning) {
      console.log('⏳ [Scheduler] Check pass already in progress. Skipping overlapping run.');
      return {
        paymentDueReminders: 0,
        paymentOverdueReminders: 0,
        taskDeadlineReminders: 0,
        taskOverdueReminders: 0,
        weddingReminders: 0,
        eventReminders: 0,
        vendorVerifications: 0,
        retriesProcessed: 0,
      };
    }

    this.isRunning = true;
    const now = new Date();
    const todayStr = formatISTDate(now);

    const result: SchedulerRunResult = {
      paymentDueReminders: 0,
      paymentOverdueReminders: 0,
      taskDeadlineReminders: 0,
      taskOverdueReminders: 0,
      weddingReminders: 0,
      eventReminders: 0,
      vendorVerifications: 0,
      retriesProcessed: 0,
    };

    try {
      // 1. Process Outbox Pending Retries
      const retryOutcome = await NotificationService.processPendingRetries(10);
      result.retriesProcessed = retryOutcome.processed;

      // 2. Payment Due Reminders (7 Days Before, 3 Days Before, Today)
      result.paymentDueReminders = await this.checkPaymentDueReminders(now, todayStr);

      // 3. Payment Overdue Reminders (Daily for up to 14 days)
      result.paymentOverdueReminders = await this.checkPaymentOverdueReminders(now, todayStr);

      // 4. Task Deadline Reminders (24h Before)
      result.taskDeadlineReminders = await this.checkTaskDeadlineReminders(now);

      // 5. Task Overdue Reminders (After deadline, daily)
      result.taskOverdueReminders = await this.checkTaskOverdueReminders(now, todayStr);

      // 6. Wedding Reminders (7 Days Before, 24h Before)
      result.weddingReminders = await this.checkWeddingReminders(now);

      // 7. Event Timeline Reminders (2 Hours Before)
      result.eventReminders = await this.checkEventTimelineReminders(now);

      // 8. Vendor Service Verification Day-of Checkpoints
      result.vendorVerifications = await this.checkVendorVerifications(now);

      const totalDispatched =
        result.paymentDueReminders +
        result.paymentOverdueReminders +
        result.taskDeadlineReminders +
        result.taskOverdueReminders +
        result.weddingReminders +
        result.eventReminders +
        result.vendorVerifications;

      if (totalDispatched > 0 || result.retriesProcessed > 0) {
        console.log(`⏱️ [Scheduler] Sweep completed: ${totalDispatched} reminders dispatched, ${result.retriesProcessed} retries processed.`);
      }

      return result;
    } catch (err: any) {
      console.error('[Scheduler] Error during scheduled check sweep:', err.message);
      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Atomically claims a scheduled reminder record in Neon DB.
   * Performs an efficient pre-check to eliminate routine P2002 constraint error noise in logs,
   * while preserving database-level uniqueness as the ultimate concurrency safeguard across instances.
   */
  private static async claimReminder(
    reminderType: string,
    entityType: string,
    entityId: string,
    agencyId?: string | null,
    metadata?: any
  ): Promise<boolean> {
    try {
      // 1. Efficient pre-check to eliminate routine constraint collision logs
      const existing = await prisma.scheduledReminder.findUnique({
        where: {
          reminderType_entityType_entityId: {
            reminderType,
            entityType,
            entityId,
          },
        },
        select: { id: true, status: true },
      });

      if (existing) {
        return false;
      }

      // 2. Atomic insert: DB unique constraint serves as final concurrency safeguard
      const scheduled = await prisma.scheduledReminder.create({
        data: {
          agencyId: agencyId || null,
          reminderType,
          entityType,
          entityId,
          scheduledFor: new Date(),
          status: 'PROCESSING',
          metadata: metadata || null,
        },
      });
      return !!scheduled;
    } catch (err: any) {
      // Unique constraint violation P2002 means reminder was already claimed concurrently
      if (err.code === 'P2002') {
        return false;
      }
      console.warn('[Scheduler] Claim reminder error:', err.message);
      return false;
    }
  }

  private static async markReminderSent(reminderType: string, entityType: string, entityId: string): Promise<void> {
    await prisma.scheduledReminder.updateMany({
      where: { reminderType, entityType, entityId },
      data: { status: 'SENT', sentAt: new Date() },
    }).catch(() => {});
  }

  /**
   * Payment Due Reminders:
   * 7 Days before, 3 Days before, and on the due date.
   */
  private static async checkPaymentDueReminders(now: Date, todayStr: string): Promise<number> {
    let sentCount = 0;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    // Fetch active pending milestone payments
    const payments = await prisma.payment.findMany({
      where: {
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIALLY_PAID] },
      },
      include: {
        wedding: {
          select: {
            agencyId: true,
            weddingCode: true,
            clientEmail: true,
            brideName: true,
            groomName: true,
            status: true,
          },
        },
      },
      take: 100,
    });

    for (const p of payments) {
      if (!p.dueDate || !p.wedding || !p.wedding.clientEmail) continue;
      if (p.wedding.status === WeddingStatus.CANCELLED || p.wedding.status === WeddingStatus.COMPLETED) continue;

      const dueTime = p.dueDate.getTime();
      const diffMs = dueTime - now.getTime();
      const coupleNames = `${p.wedding.brideName} & ${p.wedding.groomName}`;
      const remainingAmount = p.amount - (p.paidAmount || 0);
      if (remainingAmount <= 0) continue;

      // 1. Due Today (diff between -12h and +12h, and same IST date)
      if (Math.abs(diffMs) <= 12 * 60 * 60 * 1000) {
        const reminderType = `PAYMENT_DUE_TODAY_${todayStr}`;
        const claimed = await this.claimReminder(reminderType, 'Payment', p.id, p.wedding.agencyId);
        if (claimed) {
          await NotificationService.emit(NotificationEvent.PAYMENT_DUE, {
            agencyId: p.wedding.agencyId,
            recipientEmail: p.wedding.clientEmail,
            recipientName: coupleNames,
            recipientRole: 'CLIENT',
            idempotencyKey: `${reminderType}_${p.id}`,
            data: {
              weddingCode: p.wedding.weddingCode,
              clientName: coupleNames,
              amount: remainingAmount,
              milestoneName: `${p.milestoneName} (Due Today)`,
              dueDate: p.dueDate.toISOString(),
            },
          });
          await this.markReminderSent(reminderType, 'Payment', p.id);
          sentCount++;
        }
      }
      // 2. Due in ~3 Days (diff between 2.5 and 3.5 days)
      else if (diffMs > 2.5 * 24 * 60 * 60 * 1000 && diffMs <= 3.5 * 24 * 60 * 60 * 1000) {
        const reminderType = 'PAYMENT_DUE_3D';
        const claimed = await this.claimReminder(reminderType, 'Payment', p.id, p.wedding.agencyId);
        if (claimed) {
          await NotificationService.emit(NotificationEvent.PAYMENT_DUE, {
            agencyId: p.wedding.agencyId,
            recipientEmail: p.wedding.clientEmail,
            recipientName: coupleNames,
            recipientRole: 'CLIENT',
            idempotencyKey: `${reminderType}_${p.id}`,
            data: {
              weddingCode: p.wedding.weddingCode,
              clientName: coupleNames,
              amount: remainingAmount,
              milestoneName: `${p.milestoneName} (Due in 3 Days)`,
              dueDate: p.dueDate.toISOString(),
            },
          });
          await this.markReminderSent(reminderType, 'Payment', p.id);
          sentCount++;
        }
      }
      // 3. Due in ~7 Days (diff between 6.5 and 7.5 days)
      else if (diffMs > 6.5 * 24 * 60 * 60 * 1000 && diffMs <= 7.5 * 24 * 60 * 60 * 1000) {
        const reminderType = 'PAYMENT_DUE_7D';
        const claimed = await this.claimReminder(reminderType, 'Payment', p.id, p.wedding.agencyId);
        if (claimed) {
          await NotificationService.emit(NotificationEvent.PAYMENT_DUE, {
            agencyId: p.wedding.agencyId,
            recipientEmail: p.wedding.clientEmail,
            recipientName: coupleNames,
            recipientRole: 'CLIENT',
            idempotencyKey: `${reminderType}_${p.id}`,
            data: {
              weddingCode: p.wedding.weddingCode,
              clientName: coupleNames,
              amount: remainingAmount,
              milestoneName: `${p.milestoneName} (Due in 7 Days)`,
              dueDate: p.dueDate.toISOString(),
            },
          });
          await this.markReminderSent(reminderType, 'Payment', p.id);
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  /**
   * Payment Overdue Reminders:
   * Dispatches a daily alert after due date for up to 14 days.
   */
  private static async checkPaymentOverdueReminders(now: Date, todayStr: string): Promise<number> {
    let sentCount = 0;
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const overduePayments = await prisma.payment.findMany({
      where: {
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIALLY_PAID] },
        dueDate: { lt: now, gte: fourteenDaysAgo },
      },
      include: {
        wedding: {
          select: {
            agencyId: true,
            weddingCode: true,
            clientEmail: true,
            brideName: true,
            groomName: true,
            status: true,
          },
        },
      },
      take: 50,
    });

    for (const p of overduePayments) {
      if (!p.dueDate || !p.wedding || !p.wedding.clientEmail) continue;
      if (p.wedding.status === WeddingStatus.CANCELLED || p.wedding.status === WeddingStatus.COMPLETED) continue;

      const remainingAmount = p.amount - (p.paidAmount || 0);
      if (remainingAmount <= 0) continue;

      const reminderType = `PAYMENT_OVERDUE_${todayStr}`;
      const claimed = await this.claimReminder(reminderType, 'Payment', p.id, p.wedding.agencyId);
      if (claimed) {
        const coupleNames = `${p.wedding.brideName} & ${p.wedding.groomName}`;
        await NotificationService.emit(NotificationEvent.PAYMENT_DUE, {
          agencyId: p.wedding.agencyId,
          recipientEmail: p.wedding.clientEmail,
          recipientName: coupleNames,
          recipientRole: 'CLIENT',
          idempotencyKey: `${reminderType}_${p.id}`,
          data: {
            weddingCode: p.wedding.weddingCode,
            clientName: coupleNames,
            amount: remainingAmount,
            milestoneName: `${p.milestoneName} (Overdue Notice)`,
            dueDate: p.dueDate.toISOString(),
          },
        });
        await this.markReminderSent(reminderType, 'Payment', p.id);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Task Deadline Reminders:
   * Dispatches alert 24 hours before milestone deadline.
   */
  private static async checkTaskDeadlineReminders(now: Date): Promise<number> {
    let sentCount = 0;
    const in20Hours = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const in26Hours = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const dueTasks = await prisma.task.findMany({
      where: {
        status: { notIn: [TaskStatus.DONE] },
        deadline: { gte: in20Hours, lte: in26Hours },
        assignedUserId: { not: null },
      },
      include: {
        assignedUser: { select: { name: true, email: true } },
        wedding: { select: { weddingCode: true, agencyId: true } },
      },
      take: 50,
    });

    for (const t of dueTasks) {
      if (!t.assignedUser?.email) continue;

      const reminderType = 'TASK_DEADLINE_24H';
      const claimed = await this.claimReminder(reminderType, 'Task', t.id, t.wedding.agencyId);
      if (claimed) {
        await NotificationService.emit(NotificationEvent.TASK_ASSIGNED, {
          agencyId: t.wedding.agencyId,
          recipientEmail: t.assignedUser.email,
          recipientName: t.assignedUser.name,
          recipientRole: 'STAFF',
          idempotencyKey: `${reminderType}_${t.id}`,
          data: {
            taskTitle: `${t.title} (Deadline in 24 Hours)`,
            category: t.category,
            priority: t.priority,
            dueDate: t.deadline?.toISOString(),
            weddingCode: t.wedding.weddingCode,
          },
        });
        await this.markReminderSent(reminderType, 'Task', t.id);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Task Overdue Reminders:
   * Dispatches overdue alert once daily for up to 3 days.
   */
  private static async checkTaskOverdueReminders(now: Date, todayStr: string): Promise<number> {
    let sentCount = 0;
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const overdueTasks = await prisma.task.findMany({
      where: {
        status: { notIn: [TaskStatus.DONE] },
        deadline: { lt: now, gte: threeDaysAgo },
        assignedUserId: { not: null },
      },
      include: {
        assignedUser: { select: { name: true, email: true } },
        wedding: { select: { weddingCode: true, agencyId: true } },
      },
      take: 50,
    });

    for (const t of overdueTasks) {
      if (!t.assignedUser?.email) continue;

      const reminderType = `TASK_OVERDUE_${todayStr}`;
      const claimed = await this.claimReminder(reminderType, 'Task', t.id, t.wedding.agencyId);
      if (claimed) {
        await NotificationService.emit(NotificationEvent.TASK_OVERDUE, {
          agencyId: t.wedding.agencyId,
          recipientEmail: t.assignedUser.email,
          recipientName: t.assignedUser.name,
          recipientRole: 'STAFF',
          idempotencyKey: `${reminderType}_${t.id}`,
          data: {
            taskTitle: t.title,
            weddingCode: t.wedding.weddingCode,
            assignedTo: t.assignedUser.name,
            dueDate: t.deadline?.toISOString(),
          },
        });
        await this.markReminderSent(reminderType, 'Task', t.id);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Wedding Reminders:
   * 7 Days before and 24 Hours before wedding date.
   */
  private static async checkWeddingReminders(now: Date): Promise<number> {
    let sentCount = 0;
    const in6Days = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000);
    const in20Hours = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const in26Hours = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    // 1. Weddings in 7 Days
    const weddings7D = await prisma.wedding.findMany({
      where: {
        status: WeddingStatus.CONFIRMED,
        weddingDate: { gte: in6Days, lte: in7Days },
      },
      take: 20,
    });

    for (const w of weddings7D) {
      if (!w.clientEmail) continue;
      const reminderType = 'WEDDING_REMINDER_7D';
      const claimed = await this.claimReminder(reminderType, 'Wedding', w.id, w.agencyId);
      if (claimed) {
        const coupleNames = `${w.brideName} & ${w.groomName}`;
        await NotificationService.emit(NotificationEvent.EVENT_REMINDER, {
          agencyId: w.agencyId,
          recipientEmail: w.clientEmail,
          recipientName: coupleNames,
          recipientRole: 'CLIENT',
          idempotencyKey: `${reminderType}_${w.id}`,
          data: {
            eventTitle: `Royal Wedding Celebration (${coupleNames})`,
            startTime: w.weddingDate.toISOString(),
            venue: w.location,
            weddingCode: w.weddingCode,
            coordinatorName: 'Senior Operations Team',
          },
        });
        await this.markReminderSent(reminderType, 'Wedding', w.id);
        sentCount++;
      }
    }

    // 2. Weddings in 24 Hours
    const weddings24H = await prisma.wedding.findMany({
      where: {
        status: WeddingStatus.CONFIRMED,
        weddingDate: { gte: in20Hours, lte: in26Hours },
      },
      take: 20,
    });

    for (const w of weddings24H) {
      if (!w.clientEmail) continue;
      const reminderType = 'WEDDING_REMINDER_24H';
      const claimed = await this.claimReminder(reminderType, 'Wedding', w.id, w.agencyId);
      if (claimed) {
        const coupleNames = `${w.brideName} & ${w.groomName}`;
        await NotificationService.emit(NotificationEvent.EVENT_REMINDER, {
          agencyId: w.agencyId,
          recipientEmail: w.clientEmail,
          recipientName: coupleNames,
          recipientRole: 'CLIENT',
          idempotencyKey: `${reminderType}_${w.id}`,
          data: {
            eventTitle: `Wedding Day: Tomorrow (${coupleNames})`,
            startTime: w.weddingDate.toISOString(),
            venue: w.location,
            weddingCode: w.weddingCode,
            coordinatorName: 'Senior Operations Team',
          },
        });
        await this.markReminderSent(reminderType, 'Wedding', w.id);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Event Timeline Reminders:
   * 2 Hours before event start.
   */
  private static async checkEventTimelineReminders(now: Date): Promise<number> {
    let sentCount = 0;
    const in1Hour = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const in2Point5Hours = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

    const upcomingEvents = await prisma.eventTimeline.findMany({
      where: {
        startTime: { gte: in1Hour, lte: in2Point5Hours },
      },
      include: {
        wedding: {
          select: {
            agencyId: true,
            weddingCode: true,
            clientEmail: true,
            brideName: true,
            groomName: true,
          },
        },
        responsibleStaff: { select: { name: true, email: true } },
      },
      take: 30,
    });

    for (const ev of upcomingEvents) {
      const reminderType = 'EVENT_REMINDER_2H';
      const claimed = await this.claimReminder(reminderType, 'EventTimeline', ev.id, ev.wedding.agencyId);
      if (claimed) {
        // Notify Couple
        if (ev.wedding.clientEmail) {
          await NotificationService.emit(NotificationEvent.EVENT_REMINDER, {
            agencyId: ev.wedding.agencyId,
            recipientEmail: ev.wedding.clientEmail,
            recipientName: `${ev.wedding.brideName} & ${ev.wedding.groomName}`,
            recipientRole: 'CLIENT',
            idempotencyKey: `${reminderType}_${ev.id}_client`,
            data: {
              eventTitle: ev.title,
              startTime: ev.startTime.toISOString(),
              venue: ev.location,
              weddingCode: ev.wedding.weddingCode,
              coordinatorName: ev.responsibleStaff?.name || 'Onsite Coordinator',
            },
          });
        }

        // Notify Responsible Staff
        if (ev.responsibleStaff?.email) {
          await NotificationService.emit(NotificationEvent.EVENT_REMINDER, {
            agencyId: ev.wedding.agencyId,
            recipientEmail: ev.responsibleStaff.email,
            recipientName: ev.responsibleStaff.name,
            recipientRole: 'COORDINATOR',
            idempotencyKey: `${reminderType}_${ev.id}_staff`,
            data: {
              eventTitle: ev.title,
              startTime: ev.startTime.toISOString(),
              venue: ev.location,
              weddingCode: ev.wedding.weddingCode,
              coordinatorName: ev.responsibleStaff.name,
            },
          });
        }

        await this.markReminderSent(reminderType, 'EventTimeline', ev.id);
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Vendor Verification Checkpoints:
   * Prompt vendor at scheduled confirmation time on wedding day.
   */
  private static async checkVendorVerifications(now: Date): Promise<number> {
    let sentCount = 0;
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const dueVerifications = await prisma.serviceVerification.findMany({
      where: {
        status: 'AWAITING_CONFIRMATION',
        scheduledConfirmationTime: { lte: now, gte: oneHourAgo },
      },
      include: {
        vendor: { select: { name: true, email: true } },
        wedding: { select: { agencyId: true, weddingCode: true } },
      },
      take: 30,
    });

    for (const sv of dueVerifications) {
      if (!sv.vendor?.email) continue;

      const reminderType = 'VENDOR_VERIFICATION_CHECKPOINT';
      const claimed = await this.claimReminder(reminderType, 'ServiceVerification', sv.id, sv.wedding.agencyId);
      if (claimed) {
        await NotificationService.emit(NotificationEvent.SERVICE_VERIFICATION_REQUESTED, {
          agencyId: sv.wedding.agencyId,
          recipientEmail: sv.vendor.email,
          recipientName: sv.vendor.name,
          recipientRole: 'VENDOR',
          idempotencyKey: `${reminderType}_${sv.id}`,
          data: {
            vendorName: sv.vendor.name,
            serviceName: sv.serviceName,
            weddingCode: sv.wedding.weddingCode,
            scheduledTime: sv.scheduledConfirmationTime?.toISOString(),
          },
        });
        await this.markReminderSent(reminderType, 'ServiceVerification', sv.id);
        sentCount++;
      }
    }

    return sentCount;
  }
}
