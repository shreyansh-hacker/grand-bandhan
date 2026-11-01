import { Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { updateProfileSchema, changePasswordSchema } from '@grand-bandhan/validation';
import { comparePassword, hashPassword } from '../../utils/hash';
import { AuthenticatedRequest } from '../../middleware/auth';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';
import { UserRole } from '@grand-bandhan/shared';

export async function getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            status: true,
            city: true,
            state: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
        notificationPreference: true,
        _count: {
          select: {
            assignedWeddings: true,
            assignedTasks: true,
            verifiedServices: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Sanitize password hash
    const { passwordHash, ...sanitized } = user;

    res.json({
      success: true,
      data: sanitized,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parsed = updateProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(parsed.name && { name: parsed.name.trim() }),
        ...(parsed.phone && { phone: parsed.phone.trim() }),
        ...(parsed.department !== undefined && { department: parsed.department }),
        ...(parsed.specialization !== undefined && { specialization: parsed.specialization }),
        ...(parsed.avatarUrl !== undefined && { avatarUrl: parsed.avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        specialization: true,
        avatarUrl: true,
        accountStatus: true,
        updatedAt: true,
      },
    });

    await NotificationService.emit(NotificationEvent.PROFILE_UPDATED, {
      recipientEmail: req.user!.email,
      recipientName: updated.name,
      data: {
        name: updated.name,
        updatedFields: Object.keys(parsed).join(', '),
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function changeMyPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parsed = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isValid = await comparePassword(parsed.currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const newHash = await hashPassword(parsed.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        tokenVersion: { increment: 1 }, // Invalidate existing refresh tokens
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again with your new credentials.',
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMyPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let pref = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await prisma.notificationPreference.create({
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

    res.json({ success: true, data: pref });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateMyPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { transactionalEmails, weddingUpdates, paymentAlerts, taskAlerts, marketingEmails } = req.body;

    const pref = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        ...(transactionalEmails !== undefined && { transactionalEmails }),
        ...(weddingUpdates !== undefined && { weddingUpdates }),
        ...(paymentAlerts !== undefined && { paymentAlerts }),
        ...(taskAlerts !== undefined && { taskAlerts }),
        ...(marketingEmails !== undefined && { marketingEmails }),
      },
      create: {
        userId,
        transactionalEmails: transactionalEmails ?? true,
        weddingUpdates: weddingUpdates ?? true,
        paymentAlerts: paymentAlerts ?? true,
        taskAlerts: taskAlerts ?? true,
        marketingEmails: marketingEmails ?? false,
      },
    });

    res.json({
      success: true,
      data: pref,
      message: 'Notification preferences updated.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getStaffList(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const agencyId = req.user?.agencyId;
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;

    const where: any = {
      isActive: true,
      role: {
        in: [
          UserRole.SUPER_ADMIN,
          UserRole.AGENCY_ADMIN,
          UserRole.WEDDING_PLANNER,
          UserRole.COORDINATOR,
        ],
      },
    };

    if (!isSuperAdmin && agencyId) {
      where.agencyId = agencyId;
    }

    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        specialization: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: staff,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
