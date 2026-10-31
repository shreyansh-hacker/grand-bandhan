import { Router } from 'express';
import { login, register, getCurrentUser, logout, createPortalLink } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', logout);
router.post('/portal-link', authenticate, createPortalLink);

export default router;
