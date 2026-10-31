import { Router } from 'express';
import { createProposal, getProposalById, respondToProposal } from './proposal.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER),
  createProposal
);

router.get('/:id', getProposalById);
router.post('/:id/respond', respondToProposal);

export default router;
