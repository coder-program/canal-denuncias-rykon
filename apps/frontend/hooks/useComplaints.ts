import { useState, useEffect } from 'react';
import { complaintsService, ComplaintsListResponse, QueryComplaintsParams } from '@/lib/services';
import { toast } from 'sonner';

export function useComplaints(params?: QueryComplaintsParams) {
  const [data, setData] = useState<ComplaintsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await complaintsService.list(params);
      setData(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar denúncias';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [JSON.stringify(params)]);

  return {
    complaints: data?.data || [],
    meta: data?.pagination,
    loading,
    error,
    refetch: fetchComplaints,
  };
}
