import { Router } from 'express';
import {
  listQuotationRequests,
  getQuotationRequestComparison,
  createQuotationRequest,
  submitVendorQuotation,
  selectFinalQuotation,
} from './quotation.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Quotation Requests
router.get('/', authenticate, listQuotationRequests);
router.get('/:id/comparison', getQuotationRequestComparison); // Public or portal token accessible
router.post('/', authenticate, createQuotationRequest);
router.post('/:requestId/quotes', submitVendorQuotation); // Vendor portal can submit quotes
router.post('/:requestId/select', authenticate, selectFinalQuotation); // Couple or agency decision

export default router;
