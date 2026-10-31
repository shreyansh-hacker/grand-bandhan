import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getMyPreferences,
  updateMyPreferences,
} from './profile.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);
router.post('/change-password', authenticate, changeMyPassword);
router.get('/preferences', authenticate, getMyPreferences);
router.patch('/preferences', authenticate, updateMyPreferences);

export default router;
