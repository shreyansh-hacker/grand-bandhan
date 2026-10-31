import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifySecurePortalToken } from '../utils/jwt';
import { JwtPayload, UserRole } from '@grand-bandhan/shared';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  portalContext?: {
    targetId: string;
    role: UserRole.CLIENT | UserRole.VENDOR;
    agencyId: string;
    scope: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.accessToken) {
    // 2. Check HTTP-only cookie
    token = req.cookies.accessToken;
  }

  // 3. Check for portal token in query or x-portal-token header
  const portalHeader = req.headers['x-portal-token'] as string;
  if (portalHeader) {
    const portalPayload = verifySecurePortalToken(portalHeader);
    if (portalPayload) {
      req.portalContext = portalPayload;
      // Synthesize user for downstream compatibility
      req.user = {
        userId: portalPayload.targetId,
        agencyId: portalPayload.agencyId,
        email: `${portalPayload.role.toLowerCase()}@portal.grandbandhan.com`,
        role: portalPayload.role,
        name: `${portalPayload.role} Portal User`,
      };
      return next();
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in or provide a valid access token.',
    });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Access token expired or invalid.',
    });
    return;
  }

  req.user = payload;
  next();
}
