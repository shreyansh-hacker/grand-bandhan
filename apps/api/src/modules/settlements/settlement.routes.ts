import { Router } from 'express';
import { getSettlement, saveSettlement } from './settlement.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

router.get('/:weddingId', authenticate, getSettlement);
router.post('/:weddingId', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.WEDDING_PLANNER), saveSettlement);

export default router;
