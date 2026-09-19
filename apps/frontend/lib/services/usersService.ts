import { apiClient } from '../api';
import { User } from '@/types';

// ==================== TYPES ====================

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'INVESTIGATOR' | 'REPORTER' | 'VIEWER';
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: 'ADMIN' | 'INVESTIGATOR' | 'REPORTER' | 'VIEWER';
  isActive?: boolean;
}

export interface QueryUsersParams {
  role?: string;
  isActive?: boolean;
  search?: string;
}

// ==================== USERS SERVICE ====================

export const usersService = {
  /**
   * GET /users
   * Listar usuários com filtro opcional
   */
  list: async (params?: QueryUsersParams): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users', { params });
    return response.data;
  },

  /**
   * GET /users/:id
   * Obter usuário por ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * POST /users
   * Criar novo usuário (admin)
   */
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  /**
   * PATCH /users/:id
   * Atualizar usuário
   */
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /users/:id
   * Excluir usuário
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
