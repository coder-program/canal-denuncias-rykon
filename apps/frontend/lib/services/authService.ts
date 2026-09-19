import { apiClient } from '../api';

// ==================== TYPES ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==================== AUTH SERVICE ====================

export const authService = {
  /**
   * POST /auth/login
   * Login com email e senha
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * POST /auth/register
   * Registrar novo usuário (REPORTER por padrão)
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * POST /auth/refresh
   * Renovar access token
   */
  refresh: async (data: RefreshTokenRequest): Promise<Omit<LoginResponse, 'user'>> => {
    const response = await apiClient.post('/auth/refresh', data);
    return response.data;
  },

  /**
   * POST /auth/logout
   * Fazer logout (invalidar tokens)
   */
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  /**
   * GET /auth/me
   * Obter usuário autenticado
   */
  me: async (): Promise<LoginResponse['user']> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
