import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { Task, TaskStatus, TaskPriority } from '@grand-bandhan/shared';

export interface CreateTaskInput {
  weddingId: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  deadline?: string;
  dueDate?: string;
  assignedUserId?: string;
  vendorId?: string;
}

export const taskService = {
  async list(weddingId?: string): Promise<Task[]> {
    const url = weddingId ? `${ENDPOINTS.TASKS.LIST}?weddingId=${weddingId}` : ENDPOINTS.TASKS.LIST;
    const response = await apiClient.get<{ success: boolean; data: Task[] }>(url);
    return response.data.data || [];
  },

  async create(data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<{ success: boolean; data: Task }>(
      ENDPOINTS.TASKS.CREATE,
      data
    );
    return response.data.data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await apiClient.patch<{ success: boolean; data: Task }>(
      ENDPOINTS.TASKS.UPDATE_STATUS(id),
      { status }
    );
    return response.data.data;
  },

  async regenerate(weddingId: string): Promise<{ data: Task[]; message: string }> {
    const response = await apiClient.post<{ success: boolean; data: Task[]; message: string }>(
      ENDPOINTS.TASKS.REGENERATE,
      { weddingId }
    );
    return { data: response.data.data || [], message: response.data.message };
  },
};
