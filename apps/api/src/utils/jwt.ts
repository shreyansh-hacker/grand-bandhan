import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { JwtPayload, UserRole } from '@grand-bandhan/shared';

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
}

export function generateRefreshToken(payload: { userId: string; tokenVersion: number }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; tokenVersion: number } | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; tokenVersion: number };
  } catch (error) {
    return null;
  }
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface PortalTokenPayload {
  targetId: string; // weddingId or vendorId
  role: UserRole.CLIENT | UserRole.VENDOR;
  agencyId: string;
  scope: 'quotation_review' | 'service_verification' | 'digital_agreement' | 'full_portal';
}

export function generateSecurePortalToken(payload: PortalTokenPayload, expiresIn = '3d'): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: expiresIn as any });
}

export function verifySecurePortalToken(token: string): PortalTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as PortalTokenPayload;
  } catch (error) {
    return null;
  }
}

export function generatePasswordResetToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, purpose: 'password_reset' }, env.JWT_ACCESS_SECRET, {
    expiresIn: '1h',
  });
}

export function verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    if (decoded?.purpose !== 'password_reset') return null;
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    return null;
  }
}
