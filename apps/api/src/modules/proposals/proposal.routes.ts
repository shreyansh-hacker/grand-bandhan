import { Router } from 'express';
import {
  createProposal,
  getProposalById,
  respondToProposal,
  listProposals,
  updateProposal,
} from './proposal.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  listProposals
);

router.post(
  '/',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  createProposal
);

router.get('/:id', getProposalById);

router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  updateProposal
);

router.post('/:id/respond', respondToProposal);

export default router;
