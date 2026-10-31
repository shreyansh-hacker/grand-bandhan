import { Router } from 'express';
import { listVendors, getVendorById, createVendor, publicVendorApply, approveVendor } from './vendor.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// Public Vendor Application
router.post('/public-apply', publicVendorApply);

// Authenticated Vendor Catalog
router.get('/', authenticate, listVendors);
router.get('/:id', authenticate, getVendorById);
router.post('/', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER), createVendor);

// Approve Vendor
router.patch('/:id/approve', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN), approveVendor);

export default router;
