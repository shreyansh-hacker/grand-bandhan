import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { AgreementStatus } from '@grand-bandhan/shared';

export interface AgreementItem {
  id: string;
  enquiryId: string;
  weddingId?: string;
  agencyId: string;
  agreementNumber: string;
  version: number;
  status: AgreementStatus;
  totalAmount: number;
  depositAmount: number;
  clientSignatureName?: string;
  signedAt?: string;
  countersignedBy?: string;
  countersignedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  pdfUrl?: string;
  htmlContent?: string;
  enquiry?: {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    weddingDate?: string;
    location?: string;
    referenceNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GenerateAgreementInput {
  enquiryId: string;
  totalAmount?: number;
  depositAmount?: number;
  customClauses?: string[];
}

export const agreementService = {
  async list(): Promise<AgreementItem[]> {
    const response = await apiClient.get<{ success: boolean; data: AgreementItem[] }>(
      ENDPOINTS.AGREEMENTS.LIST
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<AgreementItem> {
    const response = await apiClient.get<{ success: boolean; data: AgreementItem }>(
      ENDPOINTS.AGREEMENTS.DETAIL(id)
    );
    return response.data.data;
  },

  async generate(data: GenerateAgreementInput): Promise<AgreementItem> {
    const response = await apiClient.post<{ success: boolean; data: AgreementItem }>(
      ENDPOINTS.AGREEMENTS.GENERATE,
      data
    );
    return response.data.data;
  },

  async send(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.AGREEMENTS.SEND(id)
    );
    return response.data;
  },

  async verify(
    id: string,
    status: 'VERIFIED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<{ success: boolean; message: string; agreement: AgreementItem }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      agreement: AgreementItem;
    }>(ENDPOINTS.AGREEMENTS.VERIFY(id), { status, rejectionReason });
    return response.data;
  },
};
