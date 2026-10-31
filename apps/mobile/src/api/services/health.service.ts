import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { ApiStatusResponse, NeonDbStatusResponse } from '../../types';

export const healthService = {
  /**
   * Check Render backend health & Neon connection
   */
  async getHealth(): Promise<ApiStatusResponse> {
    const response = await apiClient.get<ApiStatusResponse>(ENDPOINTS.HEALTH);
    return response.data;
  },

  /**
   * Check PostgreSQL Neon Database live telemetry
   */
  async getNeonStatus(): Promise<NeonDbStatusResponse> {
    const response = await apiClient.get<NeonDbStatusResponse>(ENDPOINTS.NEON_STATUS);
    return response.data;
  },
};
