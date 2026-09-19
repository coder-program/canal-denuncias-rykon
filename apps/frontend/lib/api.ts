import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para adicionar token em todas as requisições
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');

      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const { state } = parsed;

          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error('[API] Erro ao parsear auth-storage:', error);
        }
      }
    }

    // Se o body for FormData, remover Content-Type para que o navegador defina automaticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Flag para evitar múltiplas tentativas de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para tratar erros e refresh automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as any;

    // Erro de rede
    if (!error.response) {
      toast.error('Erro de conexão com o servidor');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Ignorar refresh em rotas de autenticação
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    // Token expirado (401) - tentar refresh (exceto em rotas de auth)
    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Se já está refreshing, adicionar à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tentar renovar o token
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          if (state?.refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: state.refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Atualizar tokens no localStorage
            const updatedStorage = {
              ...JSON.parse(authStorage),
              state: {
                ...state,
                token: accessToken,
                refreshToken: newRefreshToken,
              },
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedStorage));

            // Atualizar header da requisição original
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Processar fila
            processQueue(null, accessToken);
            isRefreshing = false;

            // Retentar requisição original
            return apiClient(originalRequest);
          }
        }

        throw new Error('No refresh token available');
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Remover autenticação e redirecionar
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          toast.error('Sessão expirada. Faça login novamente.');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    // Tratamento de outros erros por status
    switch (status) {
      case 400:
        toast.error(data?.message || 'Dados inválidos');
        break;
      case 403:
        toast.error('Acesso negado. Você não tem permissão.');
        break;
      case 404:
        toast.error(data?.message || 'Recurso não encontrado');
        break;
      case 409:
        toast.error(data?.message || 'Conflito de dados');
        break;
      case 500:
        toast.error('Erro interno do servidor');
        break;
      default:
        if (status !== 401) {
          toast.error(data?.message || 'Erro inesperado');
        }
    }

    return Promise.reject(error);
  },
);
