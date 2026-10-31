import { Router } from 'express';
import {
  listVerifications,
  createVerificationTrigger,
  submitVerificationResponse,
  submitVendorResolution,
  resolveVerificationIssue,
} from './verification.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, listVerifications);
router.post('/trigger', authenticate, createVerificationTrigger);
// Can be called by client/staff (with auth or portal token)
router.post('/:id/respond', authenticate, submitVerificationResponse);
// Can be called by vendor via portal
router.post('/:id/vendor-response', submitVendorResolution);
// Agency / Client resolution sign-off
router.post('/:id/resolve', authenticate, resolveVerificationIssue);

export default router;
