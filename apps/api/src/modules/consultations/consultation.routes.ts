import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  scheduleConsultation,
  rescheduleConsultation,
  completeConsultation,
  cancelConsultation,
  listConsultations,
  getConsultationById,
} from './consultation.controller';

const router = Router();

router.use(authenticate);

router.post('/schedule', scheduleConsultation);
router.get('/', listConsultations);
router.get('/:id', getConsultationById);
router.patch('/:id/reschedule', rescheduleConsultation);
router.post('/:id/complete', completeConsultation);
router.post('/:id/cancel', cancelConsultation);

export default router;
