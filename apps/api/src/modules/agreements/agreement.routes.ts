import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getAgreement,
  generateAgreement,
  sendAgreement,
  signAgreement,
  uploadSignedAgreement,
  verifyAgreement,
  listAgreements,
  downloadAgreementHtml,
} from './agreement.controller';

const router = Router();

// Public / Portal Accessible (for couple viewing and signing)
router.get('/download/:id', downloadAgreementHtml);
router.get('/:id', getAgreement);
router.post('/:id/sign', signAgreement);
router.post('/:id/upload-signed', uploadSignedAgreement);

// Authenticated / Admin Operations
router.get('/', authenticate, listAgreements);
router.post('/generate', authenticate, generateAgreement);
router.post('/:id/send', authenticate, sendAgreement);
router.post('/:id/verify', authenticate, verifyAgreement);

export default router;
