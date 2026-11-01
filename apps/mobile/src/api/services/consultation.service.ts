import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { ConsultationType, ConsultationStatus } from '@grand-bandhan/shared';

export interface ConsultationItem {
  id: string;
  enquiryId: string;
  plannerId?: string;
  scheduledAt: string;
  meetingType: ConsultationType;
  meetingLink?: string;
  meetingLocation?: string;
  status: ConsultationStatus;
  notes?: string;
  meetingNotes?: string;
  coupleVision?: string;
  themePreferences?: string;
  guestCountConfirmed?: number;
  budgetDiscussed?: number;
  venuePreferences?: string;
  specialRequirements?: string;
  familyExpectations?: string;
  enquiry?: {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    weddingDate?: string;
    location?: string;
    referenceNumber?: string;
  };
  planner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleConsultationInput {
  enquiryId: string;
  scheduledAt: string;
  meetingType: ConsultationType;
  meetingLink?: string;
  meetingLocation?: string;
  plannerId?: string;
  clientPreferredTime?: string;
  notes?: string;
}

export interface CompleteConsultationInput {
  meetingNotes: string;
  coupleVision?: string;
  themePreferences?: string;
  guestCountConfirmed?: number;
  budgetDiscussed?: number;
  venuePreferences?: string;
  specialRequirements?: string;
  familyExpectations?: string;
}

export interface RescheduleConsultationInput {
  scheduledAt: string;
  meetingType: ConsultationType;
  meetingLink?: string;
  meetingLocation?: string;
  rescheduleReason?: string;
}

export const consultationService = {
  async list(): Promise<ConsultationItem[]> {
    const response = await apiClient.get<{ success: boolean; data: ConsultationItem[] }>(
      ENDPOINTS.CONSULTATIONS.LIST
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<ConsultationItem> {
    const response = await apiClient.get<{ success: boolean; data: ConsultationItem }>(
      ENDPOINTS.CONSULTATIONS.DETAIL(id)
    );
    return response.data.data;
  },

  async schedule(data: ScheduleConsultationInput): Promise<ConsultationItem> {
    const response = await apiClient.post<{ success: boolean; data: ConsultationItem }>(
      ENDPOINTS.CONSULTATIONS.SCHEDULE,
      data
    );
    return response.data.data;
  },

  async complete(id: string, data: CompleteConsultationInput): Promise<ConsultationItem> {
    const response = await apiClient.post<{ success: boolean; data: ConsultationItem }>(
      ENDPOINTS.CONSULTATIONS.COMPLETE(id),
      data
    );
    return response.data.data;
  },

  async reschedule(id: string, data: RescheduleConsultationInput): Promise<ConsultationItem> {
    const response = await apiClient.patch<{ success: boolean; data: ConsultationItem }>(
      ENDPOINTS.CONSULTATIONS.RESCHEDULE(id),
      data
    );
    return response.data.data;
  },

  async cancel(id: string, reason?: string): Promise<ConsultationItem> {
    const response = await apiClient.post<{ success: boolean; data: ConsultationItem }>(
      ENDPOINTS.CONSULTATIONS.CANCEL(id),
      { reason }
    );
    return response.data.data;
  },
};
