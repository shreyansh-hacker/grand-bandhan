import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { UserRole } from '@grand-bandhan/shared';
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
