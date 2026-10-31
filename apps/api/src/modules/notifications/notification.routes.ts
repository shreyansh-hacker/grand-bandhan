import { Router } from 'express';
import {
  listNotificationLogs,
  getNotificationHealth,
  retryNotification,
  getSchedules,
  listUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
} from './notification.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { UserRole } from '@grand-bandhan/shared';

const router = Router();

// Phase 3: Smart Backend Schedule Synchronization (All authenticated roles)
router.get('/schedules', authenticate, getSchedules);

// Phase 4: Central Persistent Notification Inbox (All authenticated roles)
router.get('/', authenticate, listUserNotifications);
router.get('/unread-count', authenticate, getUnreadNotificationCount);
router.patch('/:id/read', authenticate, markNotificationRead);
router.post('/mark-all-read', authenticate, markAllNotificationsRead);
router.get('/preferences', authenticate, getUserNotificationPreferences);
router.put('/preferences', authenticate, updateUserNotificationPreferences);

// Administrative Email Delivery Logs & Health
router.get(
  '/logs',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  listNotificationLogs
);

router.get(
  '/health',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  getNotificationHealth
);

router.post(
  '/logs/:id/retry',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN),
  retryNotification
);

export default router;
