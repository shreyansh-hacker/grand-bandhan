import { Router } from 'express';
import { listEvents, createEvent, updateEventStatus, updateVendorArrival } from './event.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, listEvents);
router.post('/', authenticate, createEvent);
router.patch('/:id/status', authenticate, updateEventStatus);
router.post('/:eventId/arrivals/:vendorId', authenticate, updateVendorArrival);

export default router;
