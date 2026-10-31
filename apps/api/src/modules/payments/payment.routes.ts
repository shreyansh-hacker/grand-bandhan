import { Router } from 'express';
import { listPayments, createPaymentMilestone, recordPaymentTransaction } from './payment.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, listPayments);
router.post('/', authenticate, createPaymentMilestone);
router.post('/:id/transactions', authenticate, recordPaymentTransaction);

export default router;
