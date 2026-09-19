'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/', '/login'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, refreshAccessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!pathname) {
        setIsLoading(false);
        return;
      }

      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      // Se for rota pública, não precisa verificar
      if (isPublicRoute) {
        setIsLoading(false);
        return;
      }

      // Se não está autenticado, redirecionar para login
      if (!isAuthenticated) {
        router.push('/login');
        setIsLoading(false);
        return;
      }

      // Tentar renovar token se necessário
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Erro ao renovar token:', error);
        router.push('/login');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, isAuthenticated, router, refreshAccessToken]);

  // Mostrar loading apenas em rotas protegidas
  if (isLoading && pathname && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
