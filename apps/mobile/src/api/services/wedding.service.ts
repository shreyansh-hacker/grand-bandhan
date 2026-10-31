import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Wedding, WeddingPackageType, WeddingStatus } from '@grand-bandhan/shared';

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
  packageType: WeddingPackageType;
  status: WeddingStatus;
  agreementStatus?: string;
  tasksCount?: number;
  tasksCompleted?: number;
  tasksProgress?: number;
  plannerName?: string;
  totalPaid?: number;
  totalAmount?: number;
}

export interface CreateWeddingInput {
  brideName: string;
  groomName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  weddingDate: string;
  location: string;
  guestCount: number;
  budgetMin?: number;
  budgetMax?: number;
  packageType: WeddingPackageType;
  assignedPlannerId?: string;
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

  async create(data: CreateWeddingInput): Promise<Wedding> {
    const response = await apiClient.post<{ success: boolean; data: Wedding }>(
      ENDPOINTS.WEDDINGS.CREATE,
      data
    );
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateWeddingInput>): Promise<Wedding> {
    const response = await apiClient.patch<{ success: boolean; data: Wedding }>(
      ENDPOINTS.WEDDINGS.UPDATE(id),
      data
    );
    return response.data.data;
  },
};
