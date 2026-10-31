import { Router } from 'express';
import {
  createPublicEnquiry,
  createEnquiry,
  listEnquiries,
  getEnquiryById,
  getEnquiryByReference,
  assignPlanner,
  updateEnquiryStatus,
  scheduleConsultation,
} from './enquiry.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// Public routes
router.post('/public', createPublicEnquiry);
router.get('/reference/:referenceNumber', getEnquiryByReference);

// Authenticated agency operations
router.post('/', authenticate, createEnquiry);
router.get('/', authenticate, listEnquiries);
router.get('/:id', authenticate, getEnquiryById);
router.post(
  '/:id/assign',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  assignPlanner
);
router.patch(
  '/:id/status',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  updateEnquiryStatus
);
router.post(
  '/:id/consultation',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  scheduleConsultation
);

export default router;
