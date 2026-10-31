import { Router } from 'express';
import {
  registerAgency,
  listAgencyApplications,
  updateAgencyStatus,
  getMyAgency,
  updateMyAgency,
  listAgencyUsers,
  createAgencyUser,
  updateAgencyUser,
} from './agency.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// Public onboarding
router.post('/register', registerAgency);

// Super Admin agency governance
router.get('/applications', authenticate, requireRole(UserRole.SUPER_ADMIN), listAgencyApplications);
router.patch('/:id/status', authenticate, requireRole(UserRole.SUPER_ADMIN), updateAgencyStatus);

// Agency Admin self-service
router.get('/me', authenticate, requireRole(UserRole.AGENCY_ADMIN, UserRole.SUPER_ADMIN), getMyAgency);
router.patch('/me', authenticate, requireRole(UserRole.AGENCY_ADMIN, UserRole.SUPER_ADMIN), updateMyAgency);

// Agency Users & Team Management
router.get('/users', authenticate, requireRole(UserRole.AGENCY_ADMIN, UserRole.SUPER_ADMIN), listAgencyUsers);
router.post('/users', authenticate, requireRole(UserRole.AGENCY_ADMIN, UserRole.SUPER_ADMIN), createAgencyUser);
router.patch('/users/:userId', authenticate, requireRole(UserRole.AGENCY_ADMIN, UserRole.SUPER_ADMIN), updateAgencyUser);

export default router;
