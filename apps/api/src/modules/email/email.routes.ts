import { Router } from 'express';
import {
  createOAuthHandoffTicket,
  startOAuth,
  handleOAuth2Callback,
  getEmailStatus,
  sendTestEmail,
} from './email.controller';
import { authenticate, authenticateOptional } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// 1. Generate Single-Use OAuth Handoff Ticket (Admin only)
// POST /api/email/oauth/handoff
router.post(
  '/oauth/handoff',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  createOAuthHandoffTicket
);

// 2. Google OAuth Start (Admin session or single-use handoff ticket)
// GET /api/email/oauth/start?ticket=...
// Never accepts JWTs in URL query parameters.
router.get(
  '/oauth/start',
  authenticateOptional,
  startOAuth
);

// 3. Google OAuth Callback (Invoked by Google OAuth redirect with CSRF state nonce)
// GET /api/email/oauth2/callback
router.get('/oauth2/callback', handleOAuth2Callback);

// 4. Gmail Connection & Outbox Status (Admin only, agency-isolated)
// GET /api/email/status
router.get(
  '/status',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  getEmailStatus
);

// 5. Send Gmail Test Email (Admin only, agency-isolated)
// POST /api/email/test
router.post(
  '/test',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  sendTestEmail
);

export default router;
