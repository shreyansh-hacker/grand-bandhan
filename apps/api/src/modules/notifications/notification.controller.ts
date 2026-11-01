import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import {
  UserRole,
  ServiceVerificationStatus,
  TaskStatus,
  PaymentStatus,
  NotificationCategory,
  SynchronizedScheduleItem,
} from '@grand-bandhan/shared';
import { NotificationService } from './notification.service';

export async function listNotificationLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;

    const whereClause: any = {};
    if (!isSuperAdmin) {
      if (!agencyId) {
        res.status(403).json({ success: false, message: 'Agency context required' });
        return;
      }
      whereClause.agencyId = agencyId;
    }

    const logs = await prisma.emailLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: logs,
      total: logs.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getNotificationHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;

    const whereClause: any = isSuperAdmin ? {} : { agencyId };

    const [total, sent, failed, queued, processing] = await Promise.all([
      prisma.emailLog.count({ where: whereClause }),
      prisma.emailLog.count({ where: { ...whereClause, status: 'SENT' } }),
      prisma.emailLog.count({ where: { ...whereClause, status: 'FAILED' } }),
      prisma.emailLog.count({ where: { ...whereClause, status: 'QUEUED' } }),
      prisma.emailLog.count({ where: { ...whereClause, status: 'PROCESSING' } }),
    ]);

    res.json({
      success: true,
      data: {
        provider: 'Gmail API OAuth 2.0 (Verified Primary)',
        totalLogged: total,
        metrics: {
          total,
          sent,
          failed,
          queued,
          processing,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function retryNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  try {
    const log = await prisma.emailLog.findUnique({ where: { id } });
    if (!log) {
      res.status(404).json({ success: false, message: 'Notification log not found' });
      return;
    }

    // Tenant check: Super Admin or same agency
    if (req.user?.role !== UserRole.SUPER_ADMIN && log.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Unauthorized to retry this email' });
      return;
    }

    // Actually dispatch the email via Gmail API / NotificationService
    const dispatchResult = await NotificationService.dispatchSingleLog(id);

    const updated = await prisma.emailLog.findUnique({ where: { id } });

    if (!dispatchResult.success) {
      res.status(500).json({
        success: false,
        message: `Retry dispatch failed: ${dispatchResult.error}`,
        data: updated,
      });
      return;
    }

    res.json({
      success: true,
      message: `Notification ${id} successfully re-dispatched via Gmail API.`,
      providerMessageId: dispatchResult.messageId,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Phase 3: Smart Backend Schedule Synchronization
 * Returns all active scheduled checkpoints across verifications, timeline events, tasks, and payments.
 * Authoritative backend source of truth for device AlarmManager reconciliation.
 */
export async function getSchedules(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    const agencyId = req.user?.agencyId;
    const userId = req.user?.userId || (req.user as any)?.id;
    const role = req.user?.role;
    const sinceParam = req.query.since as string | undefined;
    const sinceDate = sinceParam ? new Date(sinceParam) : null;

    if (!isSuperAdmin && !agencyId) {
      res.status(403).json({ success: false, message: 'Agency context required' });
      return;
    }

    const whereAgency: any = isSuperAdmin ? {} : { agencyId };

    // Wedding filter based on role
    const whereWedding: any = { ...whereAgency };
    if (role === UserRole.CLIENT) {
      whereWedding.clientId = userId;
    } else if (role === UserRole.WEDDING_PLANNER) {
      whereWedding.plannerId = userId;
    }

    const now = new Date();
    // Look ahead 30 days and look back 12 hours for ongoing checkpoints
    const horizonPast = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const horizonFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [verifications, events, tasks, payments] = await Promise.all([
      // 1. Service Verifications
      prisma.serviceVerification.findMany({
        where: {
          wedding: whereWedding,
          status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
          scheduledConfirmationTime: { gte: horizonPast, lte: horizonFuture },
        },
        include: {
          wedding: { select: { id: true, weddingCode: true, brideName: true, groomName: true } },
          vendor: { select: { id: true, name: true, category: true } },
        },
      }),

      // 2. Timeline Events
      prisma.eventTimeline.findMany({
        where: {
          wedding: whereWedding,
          startTime: { gte: horizonPast, lte: horizonFuture },
        },
        include: {
          wedding: { select: { id: true, weddingCode: true, brideName: true, groomName: true } },
        },
      }),

      // 3. Pending Tasks
      prisma.task.findMany({
        where: {
          wedding: whereWedding,
          status: { not: TaskStatus.DONE },
          deadline: { gte: now, lte: horizonFuture },
          ...(role === UserRole.COORDINATOR || role === UserRole.WEDDING_PLANNER ? { assignedUserId: userId } : {}),
        },
        include: {
          wedding: { select: { id: true, weddingCode: true } },
        },
      }),

      // 4. Milestone Payments
      prisma.payment.findMany({
        where: {
          wedding: whereWedding,
          status: PaymentStatus.PENDING,
          dueDate: { gte: now, lte: horizonFuture },
        },
        include: {
          wedding: { select: { id: true, weddingCode: true } },
        },
      }),
    ]);

    const schedules: SynchronizedScheduleItem[] = [];

    // Map Service Verifications
    for (const v of verifications) {
      schedules.push({
        id: `verif_${v.id}`,
        entityType: 'SERVICE_VERIFICATION',
        entityId: v.id,
        weddingId: v.weddingId,
        weddingCode: v.wedding?.weddingCode,
        title: `Service Verification: ${v.serviceName}`,
        message: `Verify "${v.serviceName}" deliverable for ${v.wedding?.weddingCode || 'wedding'}.`,
        scheduledFor: v.scheduledConfirmationTime.toISOString(),
        timestampMs: new Date(v.scheduledConfirmationTime).getTime(),
        channelId: 'gb_verifications',
        deepLinkUri: `grandbandhan://verifications/${v.id}`,
        actionRequired: true,
        status: v.status,
        updatedAt: v.updatedAt.toISOString(),
      });
    }

    // Map Timeline Events
    for (const e of events) {
      schedules.push({
        id: `event_${e.id}`,
        entityType: 'TIMELINE_EVENT',
        entityId: e.id,
        weddingId: e.weddingId,
        weddingCode: e.wedding?.weddingCode,
        title: `Ceremony: ${e.title}`,
        message: `${e.title} is scheduled at ${e.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} (${e.location || 'Venue'}).`,
        scheduledFor: e.startTime.toISOString(),
        timestampMs: new Date(e.startTime).getTime(),
        channelId: 'gb_milestones',
        deepLinkUri: `grandbandhan://events/${e.id}`,
        actionRequired: false,
        status: e.status,
        updatedAt: e.updatedAt.toISOString(),
      });
    }

    // Map Tasks
    for (const t of tasks) {
      schedules.push({
        id: `task_${t.id}`,
        entityType: 'TASK_DEADLINE',
        entityId: t.id,
        weddingId: t.weddingId,
        weddingCode: t.wedding?.weddingCode,
        title: `Task Deadline: ${t.title}`,
        message: `Assigned task "${t.title}" is due today.`,
        scheduledFor: t.deadline.toISOString(),
        timestampMs: new Date(t.deadline).getTime(),
        channelId: 'gb_general',
        deepLinkUri: `grandbandhan://tasks/${t.id}`,
        actionRequired: true,
        status: t.status,
        updatedAt: t.updatedAt.toISOString(),
      });
    }

    // Map Payments
    for (const p of payments) {
      schedules.push({
        id: `payment_${p.id}`,
        entityType: 'PAYMENT_DUE',
        entityId: p.id,
        weddingId: p.weddingId,
        weddingCode: p.wedding?.weddingCode,
        title: `Milestone Payment Due`,
        message: `Milestone payment of ₹${p.amount.toLocaleString('en-IN')} for ${p.wedding?.weddingCode} is due.`,
        scheduledFor: p.dueDate.toISOString(),
        timestampMs: new Date(p.dueDate).getTime(),
        channelId: 'gb_payments',
        deepLinkUri: `grandbandhan://payments/${p.id}`,
        actionRequired: true,
        status: p.status,
        updatedAt: p.updatedAt.toISOString(),
      });
    }

    // Check canceled items if since cursor was passed
    const canceledIds: string[] = [];
    if (sinceDate) {
      const resolvedVerifications = await prisma.serviceVerification.findMany({
        where: {
          wedding: whereWedding,
          status: { in: [ServiceVerificationStatus.CONFIRMED, ServiceVerificationStatus.RESOLVED] },
          updatedAt: { gte: sinceDate },
        },
        select: { id: true },
      });
      resolvedVerifications.forEach((rv) => canceledIds.push(`verif_${rv.id}`));

      const completedTasks = await prisma.task.findMany({
        where: {
          wedding: whereWedding,
          status: TaskStatus.DONE,
          updatedAt: { gte: sinceDate },
        },
        select: { id: true },
      });
      completedTasks.forEach((ct) => canceledIds.push(`task_${ct.id}`));

      const settledPayments = await prisma.payment.findMany({
        where: {
          wedding: whereWedding,
          status: PaymentStatus.PAID,
          updatedAt: { gte: sinceDate },
        },
        select: { id: true },
      });
      settledPayments.forEach((sp) => canceledIds.push(`payment_${sp.id}`));
    }

    res.json({
      success: true,
      serverTime: now.toISOString(),
      schedules,
      canceledIds,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Phase 4: Central Persistent Notification Inbox
 */
export async function listUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const category = req.query.category as string | undefined;
    const unreadOnly = req.query.unread === 'true';
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '50', 10)));
    const offset = Math.max(0, parseInt((req.query.offset as string) || '0', 10));

    const where: any = { userId };
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    res.json({
      success: true,
      data: notifications,
      total,
      unreadCount,
      limit,
      offset,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUnreadNotificationCount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ success: true, count });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    const id = req.params.id as string;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    if (notif.userId !== userId && req.user?.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUserNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId,
          transactionalEmails: true,
          weddingUpdates: true,
          paymentAlerts: true,
          taskAlerts: true,
          marketingEmails: false,
        },
      });
    }

    res.json({ success: true, data: prefs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateUserNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const { transactionalEmails, weddingUpdates, paymentAlerts, taskAlerts, marketingEmails } = req.body;

    const updated = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        transactionalEmails: transactionalEmails ?? true,
        weddingUpdates: weddingUpdates ?? true,
        paymentAlerts: paymentAlerts ?? true,
        taskAlerts: taskAlerts ?? true,
        marketingEmails: marketingEmails ?? false,
      },
      update: {
        ...(transactionalEmails !== undefined ? { transactionalEmails } : {}),
        ...(weddingUpdates !== undefined ? { weddingUpdates } : {}),
        ...(paymentAlerts !== undefined ? { paymentAlerts } : {}),
        ...(taskAlerts !== undefined ? { taskAlerts } : {}),
        ...(marketingEmails !== undefined ? { marketingEmails } : {}),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
