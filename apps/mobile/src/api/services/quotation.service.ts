import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Quotation, QuotationStatus, QuotationRequestStatus } from '@grand-bandhan/shared';

export interface QuotationRequest {
  id: string;
  weddingId: string;
  category: string;
  guestCount?: number;
  status: QuotationRequestStatus;
  notes?: string;
  quotations?: VendorQuotation[];
  createdAt: string;
}

export interface VendorQuotation extends Omit<Partial<Quotation>, 'vendor'> {
  id: string;
  quotationRequestId: string;
  vendorId: string;
  baseAmount: number;
  pricePerPlate?: number;
  additionalCosts?: number;
  status: QuotationStatus;
  notes?: string;
  vendor?: {
    id: string;
    name: string;
    category: string;
    contactPhone?: string;
  };
}

export interface QuotationComparison {
  request: QuotationRequest;
  quotations: (VendorQuotation & {
    vendor?: { name: string; category: string; contactPhone?: string };
    computedTotal: number;
    guestCountUsed: number;
  })[];
  recommendation?: {
    recommendedQuotationId: string;
    rationale: string;
  };
}

export interface SubmitQuoteInput {
  vendorId: string;
  baseAmount: number;
  pricePerPlate?: number;
  additionalCosts?: number;
  validUntil?: string;
  notes?: string;
  inclusions?: string[];
  exclusions?: string[];
}

export const quotationService = {
  async listRequests(weddingId: string): Promise<QuotationRequest[]> {
    const response = await apiClient.get<{ success: boolean; data: QuotationRequest[] }>(
      `${ENDPOINTS.QUOTATIONS.LIST}?weddingId=${weddingId}`
    );
    return response.data.data || [];
  },

  async getComparison(id: string): Promise<QuotationComparison> {
    const response = await apiClient.get<{ success: boolean; data: QuotationComparison }>(
      ENDPOINTS.QUOTATIONS.COMPARISON(id)
    );
    return response.data.data;
  },

  async submitQuote(requestId: string, data: SubmitQuoteInput): Promise<VendorQuotation> {
    const response = await apiClient.post<{ success: boolean; data: VendorQuotation }>(
      ENDPOINTS.QUOTATIONS.SUBMIT(requestId),
      data
    );
    return response.data.data;
  },

  async selectQuotation(requestId: string, selectedQuotationId: string): Promise<any> {
    const response = await apiClient.post<{ success: boolean; data: any; message: string }>(
      ENDPOINTS.QUOTATIONS.SELECT(requestId),
      { selectedQuotationId }
    );
    return response.data.data;
  },
};
