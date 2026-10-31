import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Enquiry, EnquiryStatus, PlanningForSide } from '@grand-bandhan/shared';

export type CustomerEnquiry = Enquiry & {
  referenceNumber?: string;
  location?: string;
  email?: string;
  phone?: string;
  assignedPlannerId?: string;
};

export interface CreateEnquiryInput {
  customerName: string;
  email: string;
  phone: string;
  weddingDate?: string;
  location: string;
  guestCount: number;
  theme?: string;
  minBudget: number;
  maxBudget: number;
  source: 'WEBSITE' | 'REFERRAL' | 'INSTAGRAM' | 'WALK_IN' | 'OTHER';
  planningFor: PlanningForSide;
  notes?: string;
}

export interface PublicEnquiryInput extends CreateEnquiryInput {
  partnerName?: string;
  isDateFlexible?: boolean;
  packageType?: string;
  eventsRequired?: string[];
  servicesRequired?: string[];
  preferredContactMethod?: 'EMAIL' | 'PHONE' | 'WHATSAPP';
}

export const enquiryService = {
  async list(): Promise<CustomerEnquiry[]> {
    const response = await apiClient.get<{ success: boolean; data: CustomerEnquiry[] }>(
      ENDPOINTS.ENQUIRIES.LIST
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<CustomerEnquiry> {
    const response = await apiClient.get<{ success: boolean; data: CustomerEnquiry }>(
      ENDPOINTS.ENQUIRIES.DETAIL(id)
    );
    return response.data.data;
  },

  async create(data: CreateEnquiryInput): Promise<CustomerEnquiry> {
    const response = await apiClient.post<{ success: boolean; data: CustomerEnquiry }>(
      ENDPOINTS.ENQUIRIES.CREATE,
      data
    );
    return response.data.data;
  },

  async createPublic(data: PublicEnquiryInput, agencySlug?: string): Promise<{ enquiry: any; referenceNumber: string }> {
    const response = await apiClient.post<{ success: boolean; data: any; referenceNumber: string }>(
      ENDPOINTS.ENQUIRIES.PUBLIC_CREATE + (agencySlug ? `?agencySlug=${agencySlug}` : ''),
      data
    );
    return { enquiry: response.data.data, referenceNumber: response.data.referenceNumber };
  },

  async assignPlanner(id: string, plannerId: string): Promise<CustomerEnquiry> {
    const response = await apiClient.post<{ success: boolean; data: CustomerEnquiry }>(
      ENDPOINTS.ENQUIRIES.ASSIGN(id),
      { plannerId }
    );
    return response.data.data;
  },

  async updateStatus(id: string, status: EnquiryStatus, notes?: string, followUpDate?: string): Promise<CustomerEnquiry> {
    const response = await apiClient.patch<{ success: boolean; data: CustomerEnquiry }>(
      ENDPOINTS.ENQUIRIES.UPDATE_STATUS(id),
      { status, notes, followUpDate }
    );
    return response.data.data;
  },
};
