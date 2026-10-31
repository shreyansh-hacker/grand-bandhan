import { Request, Response } from 'express';
import { prisma } from '@grand-bandhan/database';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, generateSecurePortalToken } from '../../utils/jwt';
import { loginSchema, registerSchema } from '@grand-bandhan/validation';
import { UserRole, AgencyStatus, AccountStatus } from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';

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
