import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Wedding } from '@grand-bandhan/shared';

export interface WeddingSummary extends Partial<Wedding> {
  id: string;
  agencyId?: string;
  weddingCode?: string;
  brideName: string;
  groomName: string;
  startDate?: string | Date;
  weddingDate?: string | Date;
  location: string;
  guestCount: number;
  budgetMin?: number;
  budgetMax?: number;
  packageType: any;
  status: any;
  agreementStatus?: string;
  tasksCount?: number;
  tasksCompleted?: number;
  tasksProgress?: number;
  plannerName?: string;
  totalPaid?: number;
  totalAmount?: number;
}

export const weddingService = {
  async list(): Promise<WeddingSummary[]> {
    const response = await apiClient.get<{ success: boolean; data: WeddingSummary[] }>(
      ENDPOINTS.WEDDINGS.LIST
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      ENDPOINTS.WEDDINGS.DETAIL(id)
    );
    return response.data.data;
  },
};
