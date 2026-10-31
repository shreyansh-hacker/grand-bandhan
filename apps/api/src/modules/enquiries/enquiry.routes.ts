import { Router } from 'express';
import {
  createEnquiry,
  listEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  convertEnquiryToWedding,
} from './enquiry.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// Public creation for web leads
router.post('/', createEnquiry);

// Protected routes for agency team
router.get('/', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER), listEnquiries);
router.get('/:id', authenticate, getEnquiryById);
router.patch('/:id/status', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER), updateEnquiryStatus);
router.post('/:id/convert', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER), convertEnquiryToWedding);

export default router;
