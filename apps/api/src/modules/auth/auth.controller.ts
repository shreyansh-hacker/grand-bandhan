import { Request, Response } from 'express';
import { DataStore } from '../store';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, generateSecurePortalToken } from '../../utils/jwt';
import { loginSchema, registerSchema } from '@grand-bandhan/validation';
import { UserRole } from '@grand-bandhan/shared';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.parse(req.body);
  const user = DataStore.users.findByEmail(parsed.email);

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const isValid = await comparePassword(parsed.password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const payload = {
    userId: user.id,
    agencyId: user.agencyId,
    email: user.email,
    role: user.role,
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
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    },
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.parse(req.body);

  const existing = DataStore.users.findByEmail(parsed.email);
  if (existing) {
    res.status(400).json({ success: false, message: 'An account with this email already exists' });
    return;
  }

  // Find or create default agency
  let agency = DataStore.agencies.findFirst(() => true);
  if (!agency) {
    agency = DataStore.agencies.create({
      name: parsed.agencyName || 'Grand Bandhan Luxury Weddings',
      slug: 'grand-bandhan',
      contactEmail: 'concierge@grandbandhan.com',
      contactPhone: '+91 98200 12345',
    });
  }

  const passwordHash = await hashPassword(parsed.password);
  const user = DataStore.users.create({
    agencyId: agency.id,
    name: parsed.name,
    email: parsed.email,
    passwordHash,
    role: parsed.role || UserRole.AGENCY_ADMIN,
    phone: parsed.phone || null,
  });

  const payload = {
    userId: user.id,
    agencyId: agency.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id, tokenVersion: 1 });

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
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: agency.id,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    },
  });
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const user = DataStore.users.findById(req.user.userId);
  res.json({
    success: true,
    data: {
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            agencyId: user.agencyId,
            phone: user.phone,
          }
        : req.user,
    },
  });
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

  const token = generateSecurePortalToken({
    targetId,
    role,
    agencyId: req.user?.agencyId || 'default-agency',
    scope: scope || 'full_portal',
  }, expiresIn || '7d');

  const portalType = role === UserRole.CLIENT ? 'client' : 'vendor';
  const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/${portalType}/${token}`;

  res.json({
    success: true,
    data: {
      token,
      url,
      expiresIn: expiresIn || '7d',
    },
  });
}
