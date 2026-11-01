import { Router } from 'express';
import {
  listWeddings,
  getWeddingById,
  createWedding,
  convertEnquiryToWedding,
  updateWedding,
  getWeddingPortalDetails,
  getWeddingGuests,
  addWeddingGuest,
  updateWeddingGuest,
  deleteWeddingGuest,
} from './wedding.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// Client Portal & Guest RSVP endpoints (accessible directly via weddingId/token)
router.get('/:id/portal-details', getWeddingPortalDetails);
router.get('/:id/guests', getWeddingGuests);
router.post('/:id/guests', addWeddingGuest);
router.patch('/:id/guests/:guestId', updateWeddingGuest);
router.delete('/:id/guests/:guestId', deleteWeddingGuest);

// Core Wedding Management
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
