import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Payment } from '@grand-bandhan/shared';

export const paymentService = {
  async listPayments(weddingId?: string): Promise<Payment[]> {
    const url = weddingId ? `${ENDPOINTS.PAYMENTS.LIST}?weddingId=${weddingId}` : ENDPOINTS.PAYMENTS.LIST;
    const response = await apiClient.get<{ success: boolean; data: Payment[] }>(url);
    return response.data.data || [];
  },

  async listSettlements(weddingId?: string): Promise<any[]> {
    const url = weddingId ? `${ENDPOINTS.SETTLEMENTS.LIST}?weddingId=${weddingId}` : ENDPOINTS.SETTLEMENTS.LIST;
    const response = await apiClient.get<{ success: boolean; data: any[] }>(url);
    return response.data.data || [];
  },
};
