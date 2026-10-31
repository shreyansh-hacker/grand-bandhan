import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { AuthenticatedRequest } from '../../middleware/auth';
import { UserRole } from '@grand-bandhan/shared';

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

    const [total, sent, failed, queued] = await Promise.all([
      prisma.emailLog.count({ where: whereClause }),
      prisma.emailLog.count({ where: { ...whereClause, status: 'SENT' } }),
      prisma.emailLog.count({ where: { ...whereClause, status: 'FAILED' } }),
      prisma.emailLog.count({ where: { ...whereClause, status: 'QUEUED' } }),
    ]);

    res.json({
      success: true,
      data: {
        provider: process.env.EMAIL_API_KEY ? 'Resend (Production)' : 'Sandbox Logger (Local Evaluation)',
        totalLogged: total,
        metrics: {
          total,
          sent,
          failed,
          queued,
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

    // Tenant check
    if (req.user?.role !== UserRole.SUPER_ADMIN && log.agencyId !== req.user?.agencyId) {
      res.status(403).json({ success: false, message: 'Unauthorized to retry this email' });
      return;
    }

    const updated = await prisma.emailLog.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
        status: 'SENT',
        sentAt: new Date(),
        errorMessage: null,
      },
    });

    res.json({
      success: true,
      message: `Notification ${id} marked for retry.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
