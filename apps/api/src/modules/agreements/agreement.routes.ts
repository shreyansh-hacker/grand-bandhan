import { Router } from 'express';
import { getAgreement, signAgreement } from './agreement.controller';

const router = Router();

// Allows both authenticated clients and portal users via token / link
router.get('/:weddingId', getAgreement);
router.post('/:weddingId/sign', signAgreement);

export default router;
