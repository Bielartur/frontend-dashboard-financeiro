import { useState, useEffect, useCallback } from 'react';
import { useRequests } from '@/hooks/use-requests';
import { DashboardResponse } from '@/models/Financial';
import { toast } from 'sonner';

export function useDashboard(year: string = 'last-12') {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getDashboard } = useRequests();

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dashboardData = await getDashboard(year);
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
      toast.error('Não foi possível carregar os dados do dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refresh = () => {
    fetchDashboardData();
  };

  return {
    data,
    isLoading,
    error,
    refresh,
    getAvailableMonths: useRequests().getAvailableMonths
  };
}
