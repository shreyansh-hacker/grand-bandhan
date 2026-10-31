import { Router } from 'express';
import { listVendors, getVendorById, createVendor } from './vendor.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// Allow reading vendor catalog for authenticated users
router.get('/', authenticate, listVendors);
router.get('/:id', authenticate, getVendorById);
router.post('/', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER), createVendor);

export default router;
