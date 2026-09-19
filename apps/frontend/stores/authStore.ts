'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/lib/services';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await authService.login({ email, password });

          // Salvar tokens primeiro
          set({
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });

          // Buscar dados do usuário
          try {
            const userData = await authService.me();
            set({
              user: userData as User,
            });
            toast.success(`Bem-vindo, ${userData.name || userData.email}!`);
          } catch (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            toast.success('Login realizado com sucesso!');
          }
        } catch (error: any) {
          console.error('Login failed:', error);
          const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          // Só tenta fazer logout no backend se tiver refreshToken
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (error) {
          console.error('Logout failed:', error);
          // Continua com o logout local mesmo se falhar no backend
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          toast.success('Logout realizado com sucesso');
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authService.refresh({ refreshToken });

          set({
            token: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Se falhar, fazer logout
          await get().logout();
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
