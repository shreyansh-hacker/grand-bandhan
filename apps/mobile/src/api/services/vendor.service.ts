import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Vendor } from '@grand-bandhan/shared';

export interface CreateVendorInput {
  name: string;
  category: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  city?: string;
  notes?: string;
}

export const vendorService = {
  async list(): Promise<Vendor[]> {
    const response = await apiClient.get<{ success: boolean; data: Vendor[] }>(
      ENDPOINTS.VENDORS.LIST
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<Vendor> {
    const response = await apiClient.get<{ success: boolean; data: Vendor }>(
      ENDPOINTS.VENDORS.DETAIL(id)
    );
    return response.data.data;
  },

  async create(data: CreateVendorInput): Promise<Vendor> {
    const response = await apiClient.post<{ success: boolean; data: Vendor }>(
      ENDPOINTS.VENDORS.CREATE,
      data
    );
    return response.data.data;
  },
};
