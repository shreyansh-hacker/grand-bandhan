import { Router } from 'express';
import {
  listPayments,
  createPaymentMilestone,
  recordPaymentTransaction,
  recordPaymentFailure,
  sendPaymentReminder,
} from './payment.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, listPayments);
router.post('/', authenticate, createPaymentMilestone);
router.post('/:id/transactions', authenticate, recordPaymentTransaction);
router.post('/:id/fail', authenticate, recordPaymentFailure);
router.post('/:id/reminder', authenticate, sendPaymentReminder);

export default router;
