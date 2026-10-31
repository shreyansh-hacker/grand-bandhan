import { Router } from 'express';
import { listNotificationLogs, getNotificationHealth, retryNotification } from './notification.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

router.get(
  '/logs',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  listNotificationLogs
);

router.get(
  '/health',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  getNotificationHealth
);

router.post(
  '/logs/:id/retry',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  retryNotification
);

export default router;
