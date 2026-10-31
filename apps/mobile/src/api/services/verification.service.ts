import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { VerificationResponse } from '@grand-bandhan/shared';

export interface ServiceVerificationItem {
  id: string;
  weddingId: string;
  vendorId: string;
  serviceName: string;
  scheduledConfirmationTime: string;
  response?: VerificationResponse | null;
  status: string;
  issueNotes?: string | null;
  evidencePhotos?: string[];
  vendor?: {
    id: string;
    name: string;
    category: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  confirmedByUser?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface VerificationResponsePayload {
  response: VerificationResponse;
  issueNotes?: string;
  evidencePhotos?: string[];
}

export const verificationService = {
  async list(weddingId: string): Promise<ServiceVerificationItem[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: ServiceVerificationItem[];
    }>(`${ENDPOINTS.VERIFICATIONS.LIST}?weddingId=${weddingId}`);
    return response.data.data || [];
  },

  async respond(
    id: string,
    payload: VerificationResponsePayload
  ): Promise<{ success: boolean; data: ServiceVerificationItem; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: ServiceVerificationItem;
      message: string;
    }>(ENDPOINTS.VERIFICATIONS.RESPOND(id), payload);
    return response.data;
  },

  async trigger(payload: {
    weddingId: string;
    vendorId: string;
    serviceName: string;
    scheduledConfirmationTime?: string;
  }): Promise<ServiceVerificationItem> {
    const response = await apiClient.post<{
      success: boolean;
      data: ServiceVerificationItem;
    }>(ENDPOINTS.VERIFICATIONS.TRIGGER, payload);
    return response.data.data;
  },
};
