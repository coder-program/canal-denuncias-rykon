import { useState, useEffect } from 'react';
import { complaintsService, ComplaintStatsResponse } from '@/lib/services';
import { toast } from 'sonner';

export function useDashboardStats() {
  const [stats, setStats] = useState<ComplaintStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintsService.getStats();
      setStats(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar estatísticas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
