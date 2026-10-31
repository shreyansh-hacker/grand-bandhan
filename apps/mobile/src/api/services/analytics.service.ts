import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export interface ExecutiveMetrics {
  totalWeddings: number;
  activeWeddings: number;
  upcomingWeddings: number;
  completedWeddings: number;
  totalEnquiries: number;
  brideSideEnquiries: number;
  groomSideEnquiries: number;
  pendingTasks: number;
  delayedTasks: number;
  vendorCount: number;
  onTimeArrivalRate: number;
  totalRevenue: number;
  totalExpenses: number;
  netGrossProfit: number;
  upcomingClientPayments: number;
  pendingVendorPayments: number;
}

export interface WeddingFinancialItem {
  id: string;
  code: string;
  couple: string;
  location: string;
  weddingDate: string;
  status: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface AnalyticsDashboardResponse {
  metrics: ExecutiveMetrics;
  weddingFinancials: WeddingFinancialItem[];
  recentVerifications: any[];
}

export const analyticsService = {
  async getDashboard(): Promise<AnalyticsDashboardResponse> {
    const response = await apiClient.get<{
      success: boolean;
      data: AnalyticsDashboardResponse;
    }>(ENDPOINTS.ANALYTICS.OVERVIEW);
    return response.data.data;
  },
};
