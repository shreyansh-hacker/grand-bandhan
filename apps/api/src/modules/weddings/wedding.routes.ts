import { Router } from 'express';
import {
  listWeddings,
  getWeddingById,
  createWedding,
  convertEnquiryToWedding,
  updateWedding,
} from './wedding.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

router.get('/', authenticate, listWeddings);
router.get('/:id', authenticate, getWeddingById);
router.post(
  '/',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  createWedding
);
router.post(
  '/convert-enquiry',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  convertEnquiryToWedding
);
router.post(
  '/convert-enquiry/:enquiryId',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  convertEnquiryToWedding
);
router.patch(
  '/:id',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  updateWedding
);

export default router;
