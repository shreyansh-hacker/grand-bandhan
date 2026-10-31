import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { UserRole } from '@grand-bandhan/shared';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Super Admin has access across everything
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`,
      });
      return;
    }

    next();
  };
}

export function requireAgencyAccess() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    const requestedAgencyId = (req.params.agencyId || req.query.agencyId || req.body.agencyId) as string;
    if (requestedAgencyId && requestedAgencyId !== req.user.agencyId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You do not belong to the requested agency.',
      });
      return;
    }

    next();
  };
}
