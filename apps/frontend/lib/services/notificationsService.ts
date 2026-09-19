import { apiClient } from '../api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  data: any;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationsService = {
  /**
   * GET /notifications
   * Listar todas as notificações do usuário
   */
  getAll: async (isRead?: boolean): Promise<Notification[]> => {
    const params = isRead !== undefined ? { isRead: String(isRead) } : {};
    const response = await apiClient.get<Notification[]>('/notifications', { params });
    return response.data;
  },

  /**
   * GET /notifications/unread-count
   * Contar notificações não lidas
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * PATCH /notifications/:id/read
   * Marcar notificação como lida
   */
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  /**
   * PATCH /notifications/read-all
   * Marcar todas as notificações como lidas
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
