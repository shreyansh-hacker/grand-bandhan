import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Task, TaskStatus } from '@grand-bandhan/shared';

export const taskService = {
  async list(weddingId?: string): Promise<Task[]> {
    const url = weddingId ? `${ENDPOINTS.TASKS.LIST}?weddingId=${weddingId}` : ENDPOINTS.TASKS.LIST;
    const response = await apiClient.get<{ success: boolean; data: Task[] }>(url);
    return response.data.data || [];
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await apiClient.patch<{ success: boolean; data: Task }>(
      ENDPOINTS.TASKS.UPDATE_STATUS(id),
      { status }
    );
    return response.data.data;
  },
};
