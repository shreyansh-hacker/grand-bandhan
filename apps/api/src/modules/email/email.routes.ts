import { Router } from 'express';
import {
  startOAuth,
  handleOAuth2Callback,
  getEmailStatus,
  sendTestEmail,
} from './email.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// 1. Google OAuth Start (Admin only)
router.get(
  '/oauth/start',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  startOAuth
);

// 2. Google OAuth Callback (Invoked by Google OAuth redirect)
router.get('/oauth2/callback', handleOAuth2Callback);

// 3. Gmail Connection & Outbox Status (Admin only)
router.get(
  '/status',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  getEmailStatus
);

// 4. Send Gmail Test Email (Admin only)
router.post(
  '/test',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  sendTestEmail
);

export default router;
