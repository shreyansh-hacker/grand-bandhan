import { Router } from 'express';
import { getAgreement, sendAgreement, signAgreement } from './agreement.controller';

const router = Router();

// Allows both authenticated clients/planners and portal users via token / link
router.get('/:weddingId', getAgreement);
router.post('/:weddingId/send', sendAgreement);
router.post('/:weddingId/sign', signAgreement);

export default router;
