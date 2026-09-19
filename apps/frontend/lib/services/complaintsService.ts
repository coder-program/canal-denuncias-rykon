import { apiClient } from '../api';
import { Complaint } from '@/types';

// ==================== TYPES ====================

export interface CreateComplaintRequest {
  isAnonymous: boolean;
  reporterEmail?: string;
  reporterPhone?: string;
  type: 'HARASSMENT' | 'DISCRIMINATION' | 'FRAUD' | 'CORRUPTION' | 'SAFETY' | 'ETHICS' | 'OTHER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  location?: string;
  incidentDate?: string | Date;
  involvedPeople?: string | string[];
  witnesses?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateComplaintRequest {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED';
  investigatorId?: string;
  resolution?: string;
}

export interface QueryComplaintsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ComplaintsListResponse {
  data: Complaint[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ComplaintStatsResponse {
  total: number;
  byStatus: {
    pending: number;
    inProgress: number;
    resolved: number;
  };
  byType: {
    [key: string]: number;
  };
  byPriority: {
    [key: string]: number;
  };
}

// ==================== COMPLAINTS SERVICE ====================

export const complaintsService = {
  /**
   * POST /complaints
   * Criar nova denúncia (público)
   */
  create: async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await apiClient.post<Complaint>('/complaints', data);
    return response.data;
  },

  /**
   * GET /complaints
   * Listar denúncias com filtros e paginação
   */
  list: async (params?: QueryComplaintsParams): Promise<ComplaintsListResponse> => {
    const response = await apiClient.get<ComplaintsListResponse>('/complaints', { params });
    return response.data;
  },

  /**
   * GET /complaints/:id
   * Obter denúncia por ID
   */
  getById: async (id: string): Promise<Complaint> => {
    const response = await apiClient.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  /**
   * GET /complaints/protocol/:protocol
   * Buscar denúncia por protocolo
   */
  getByProtocol: async (protocol: string): Promise<Complaint> => {
    const response = await apiClient.get<Complaint>(`/complaints/protocol/${protocol}`);
    return response.data;
  },

  /**
   * GET /complaints/stats
   * Obter estatísticas de denúncias
   */
  getStats: async (): Promise<ComplaintStatsResponse> => {
    const response = await apiClient.get<ComplaintStatsResponse>('/complaints/stats');
    return response.data;
  },

  /**
   * PATCH /complaints/:id
   * Atualizar denúncia
   */
  update: async (id: string, data: UpdateComplaintRequest): Promise<Complaint> => {
    const response = await apiClient.patch<Complaint>(`/complaints/${id}`, data);
    return response.data;
  },

  /**
   * PATCH /complaints/:id/status
   * Alterar status da denúncia
   */
  changeStatus: async (
    id: string,
    status: 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED',
    resolution?: string,
  ): Promise<Complaint> => {
    const response = await apiClient.patch<Complaint>(`/complaints/${id}/status`, {
      status,
      resolution,
    });
    return response.data;
  },

  /**
   * PATCH /complaints/:id/assign
   * Atribuir investigador
   */
  assignInvestigator: async (id: string, investigatorId: string): Promise<Complaint> => {
    const response = await apiClient.patch<Complaint>(`/complaints/${id}/assign`, {
      investigatorId,
    });
    return response.data;
  },

  /**
   * DELETE /complaints/:id
   * Excluir denúncia
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/complaints/${id}`);
  },

  /**
   * POST /attachments/complaint/:complaintId
   * Upload de anexo para uma denúncia
   */
  uploadAttachment: async (complaintId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/attachments/complaint/${complaintId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * POST /attachments/complaint/:complaintId (múltiplos arquivos)
   * Upload de múltiplos anexos para uma denúncia
   */
  uploadAttachments: async (complaintId: string, files: File[]): Promise<any[]> => {
    const uploadPromises = files.map((file) =>
      complaintsService.uploadAttachment(complaintId, file),
    );
    return Promise.all(uploadPromises);
  },

  /**
   * GET /complaints/:complaintId/comments
   * Listar comentários de uma denúncia
   */
  getComments: async (complaintId: string): Promise<any[]> => {
    const response = await apiClient.get(`/complaints/${complaintId}/comments`);
    return response.data;
  },

  /**
   * POST /complaints/:complaintId/comments
   * Adicionar comentário a uma denúncia
   */
  addComment: async (complaintId: string, content: string): Promise<any> => {
    const response = await apiClient.post(`/complaints/${complaintId}/comments`, {
      content,
    });
    return response.data;
  },

  /**
   * PUT /complaints/:complaintId/comments/:id
   * Atualizar comentário
   */
  updateComment: async (complaintId: string, commentId: string, content: string): Promise<any> => {
    const response = await apiClient.put(`/complaints/${complaintId}/comments/${commentId}`, {
      content,
    });
    return response.data;
  },

  /**
   * DELETE /complaints/:complaintId/comments/:id
   * Deletar comentário
   */
  deleteComment: async (complaintId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/complaints/${complaintId}/comments/${commentId}`);
  },
};
