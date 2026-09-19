'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/services';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    token,
    refreshToken,
    setUser,
    logout: storeLogout,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuário está autenticado ao montar o componente
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated || !token) {
        setIsLoading(false);
        return;
      }

      try {
        // Verificar se o token ainda é válido buscando dados do usuário
        const userData = await authService.me();
        setUser(userData as any);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Token inválido, fazer logout
        await storeLogout();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []); // Executar apenas uma vez ao montar

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para acessar esta página');
      router.push('/login');
      return false;
    }
    return true;
  };

  const requireRole = (allowedRoles: string[]) => {
    if (!requireAuth()) return false;

    if (user && !allowedRoles.includes(user.role)) {
      toast.error('Você não tem permissão para acessar esta página');
      router.push('/dashboard');
      return false;
    }

    return true;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
    requireRole,
    logout: storeLogout,
  };
}
