import crypto from 'crypto';
import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, generateSecurePortalToken, generatePasswordResetToken, verifyPasswordResetToken } from '../../utils/jwt';
import { loginSchema, registerSchema } from '@grand-bandhan/validation';
import { UserRole, AgencyStatus, AccountStatus } from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEvent } from '../notifications/notification.types';
import { env } from '../../config/env';

// In-memory rate limiting map for password reset requests
const resetRequestLimits = new Map<string, { count: number; resetAt: number }>();

function checkResetRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = resetRequestLimits.get(identifier);
  if (!entry || now > entry.resetAt) {
    resetRequestLimits.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count++;
  return true;
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.parse(req.body);
    const email = parsed.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { agency: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = await comparePassword(parsed.password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Check Agency Status
    if (user.role !== UserRole.SUPER_ADMIN && user.agency) {
      if (user.agency.status === AgencyStatus.PENDING_APPROVAL) {
        // Return restricted access info
        res.json({
          success: true,
          status: 'PENDING_APPROVAL',
          message: 'Your agency application is under review by the Super Administrator.',
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              agencyId: user.agencyId,
              agencyName: user.agency.name,
              agencyStatus: user.agency.status,
            },
          },
        });
        return;
      }

      if (user.agency.status === AgencyStatus.REJECTED) {
        res.status(403).json({
          success: false,
          status: 'REJECTED',
          message: `Your agency application was not approved. Reason: ${user.agency.rejectionReason || 'Contact support'}`,
        });
        return;
      }

      if (user.agency.status === AgencyStatus.SUSPENDED) {
        res.status(403).json({
          success: false,
          status: 'SUSPENDED',
          message: 'Your agency workspace is currently suspended. Please contact support.',
        });
        return;
      }
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {});

    const payload = {
      userId: user.id,
      agencyId: user.agencyId,
      email: user.email,
      role: user.role as any,
      name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id, tokenVersion: user.tokenVersion || 1 });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      success: true,
      status: 'APPROVED',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agencyId: user.agencyId,
          phone: user.phone,
          agencyName: user.agency?.name,
          agencyStatus: user.agency?.status,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal login error' });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.parse(req.body);
    const email = parsed.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    // Role gatekeeping: Prohibit public registration for administrative and planner roles
    const requestedRole = parsed.role || UserRole.CLIENT;
    if (
      requestedRole === UserRole.SUPER_ADMIN ||
      requestedRole === UserRole.WEDDING_PLANNER ||
      requestedRole === UserRole.COORDINATOR
    ) {
      res.status(403).json({
        success: false,
        message: 'Registration for administrative and operational planner roles requires an authorized internal agency invitation.',
      });
      return;
    }

    const agencyName = parsed.agencyName || 'Imperial Wedding Agency';
    const slug = `${agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const passwordHash = await hashPassword(parsed.password);

    // Atomic transaction creating Agency + User
    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: agencyName,
          slug,
          contactEmail: email,
          contactPhone: parsed.phone || null,
          status: AgencyStatus.APPROVED, // Direct registration defaults to approved or pending depending on role
        },
      });

      const user = await tx.user.create({
        data: {
          agencyId: agency.id,
          name: parsed.name.trim(),
          email,
          phone: parsed.phone || null,
          passwordHash,
          role: parsed.role || UserRole.AGENCY_ADMIN,
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
        },
      });

      return { agency, user };
    });

    const payload = {
      userId: result.user.id,
      agencyId: result.agency.id,
      email: result.user.email,
      role: result.user.role as any,
      name: result.user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: result.user.id, tokenVersion: 1 });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          agencyId: result.agency.id,
          phone: result.user.phone,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ success: false, errors: err.errors });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        agency: {
          select: { id: true, name: true, slug: true, status: true, logoUrl: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agencyId: user.agencyId,
          phone: user.phone,
          agencyName: user.agency?.name,
          agencyStatus: user.agency?.status,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export function logout(req: Request, res: Response): void {
  res.clearCookie('accessToken');
  res.json({ success: true, message: 'Logged out successfully' });
}

export function createPortalLink(req: AuthenticatedRequest, res: Response): void {
  const { targetId, role, scope, expiresIn } = req.body;
  if (!targetId || !role) {
    res.status(400).json({ success: false, message: 'targetId and role are required' });
    return;
  }

  const token = generateSecurePortalToken(
    {
      targetId,
      role,
      agencyId: req.user?.agencyId || 'default-agency',
      scope: scope || 'full_portal',
    },
    expiresIn || '7d'
  );

  const portalType = role === UserRole.CLIENT ? 'client' : 'vendor';
  const url = `${process.env.FRONTEND_URL || 'https://grand-bandhan-theta.vercel.app'}/portal/${portalType}/${token}`;

  res.json({
    success: true,
    data: {
      token,
      url,
      expiresIn: expiresIn || '7d',
    },
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Rate-limit check per IP and email to prevent abuse
    if (!checkResetRateLimit(`ip_${clientIp}`) || !checkResetRateLimit(`email_${normalizedEmail}`)) {
      res.status(429).json({ success: false, message: 'Too many password reset requests. Please try again later.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { agency: true },
    });

    if (user && user.accountStatus !== AccountStatus.SUSPENDED) {
      // 1. Generate 32-byte cryptographically secure random token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // 2. Invalidate any prior unused reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // 3. Store only the secure hash with 1-hour expiry
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 60 minutes
        },
      });

      // 4. Construct secure reset URL using configured frontend URL
      const frontendBase = env.FRONTEND_URL || 'https://grand-bandhan-theta.vercel.app';
      const resetUrl = `${frontendBase}/reset-password?token=${rawToken}`;

      // 5. Emit Password Reset email through existing Gmail notification pipeline
      await NotificationService.emit(NotificationEvent.PASSWORD_RESET, {
        agencyId: user.agencyId,
        recipientEmail: user.email,
        recipientName: user.name,
        data: {
          name: user.name,
          email: user.email,
          resetUrl,
          token: rawToken,
        },
      });
    }

    // Return uniform message to prevent account enumeration
    res.json({
      success: true,
      message: 'If an imperial account exists with this email, password reset instructions have been dispatched.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error processing request' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'Reset token and new password are required' });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    // 1. Hash incoming token and look up in PasswordResetToken table
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    let targetUserId: string | null = null;
    let targetUserTokenVersion = 1;

    if (resetRecord && !resetRecord.usedAt && resetRecord.expiresAt > new Date()) {
      targetUserId = resetRecord.userId;
      targetUserTokenVersion = resetRecord.user?.tokenVersion || 1;

      // Mark token as consumed atomically
      await prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });
    } else {
      // Backward-compatible fallback for legacy JWT reset tokens
      const jwtPayload = verifyPasswordResetToken(token);
      if (jwtPayload) {
        const user = await prisma.user.findUnique({ where: { id: jwtPayload.userId } });
        if (user) {
          targetUserId = user.id;
          targetUserTokenVersion = user.tokenVersion || 1;
        }
      }
    }

    if (!targetUserId) {
      res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    // Atomically update password, increment tokenVersion (revoking active access), and purge refresh tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUserId },
        data: {
          passwordHash,
          tokenVersion: targetUserTokenVersion + 1,
        },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId: targetUserId },
      }),
    ]);

    res.json({
      success: true,
      message: 'Your imperial password has been successfully reset. Please log in with your new credentials.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error resetting password' });
  }
}
