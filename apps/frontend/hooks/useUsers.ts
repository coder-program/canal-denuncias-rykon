import { useState, useEffect } from 'react';
import { usersService, QueryUsersParams } from '@/lib/services';
import { User } from '@/types';
import { toast } from 'sonner';

export function useUsers(params?: QueryUsersParams) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.list(params);
      setUsers(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar usuários';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [JSON.stringify(params)]);

  return { users, loading, error, refetch: fetchUsers };
}
