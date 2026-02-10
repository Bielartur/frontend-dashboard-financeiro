
import { apiRequest } from "@/utils/apiRequests";
import { DashboardAvailableMonth, DashboardResponse } from "@/models/Financial";

export const dashboardService = {
  getDashboard: async (year: string = 'last-12', groupBy: string = 'category') => {
    const queryYear = year === 'last-12' ? 'last-12' : year;
    return await apiRequest<DashboardResponse>(`dashboard/?year=${queryYear}&group_by=${groupBy}`, "GET");
  },

  getAvailableMonths: async () => {
    return await apiRequest<DashboardAvailableMonth[]>("dashboard/available-months", "GET");
  }
};
