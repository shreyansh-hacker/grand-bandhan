import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { WeddingEvent, VendorArrival, ArrivalStatus } from '@grand-bandhan/shared';

export const eventService = {
  async listEvents(weddingId?: string): Promise<WeddingEvent[]> {
    const url = weddingId ? `${ENDPOINTS.EVENTS.LIST}?weddingId=${weddingId}` : ENDPOINTS.EVENTS.LIST;
    const response = await apiClient.get<{ success: boolean; data: WeddingEvent[] }>(url);
    return response.data.data || [];
  },

  async listArrivals(weddingId?: string): Promise<VendorArrival[]> {
    const url = weddingId ? `${ENDPOINTS.EVENTS.ARRIVALS}?weddingId=${weddingId}` : ENDPOINTS.EVENTS.ARRIVALS;
    const response = await apiClient.get<{ success: boolean; data: VendorArrival[] }>(url);
    return response.data.data || [];
  },

  async updateArrival(id: string, arrivalStatus: ArrivalStatus, notes?: string): Promise<VendorArrival> {
    const response = await apiClient.patch<{ success: boolean; data: VendorArrival }>(
      ENDPOINTS.EVENTS.UPDATE_ARRIVAL(id),
      { arrivalStatus, notes }
    );
    return response.data.data;
  },
};
