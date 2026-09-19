import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface TenantBranding {
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginBackgroundUrl: string | null;
  customCss: string | null;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
}

export interface TenantBrandingResponse {
  tenant: Tenant;
  branding: TenantBranding;
}

export const brandingService = {
  /**
   * Busca tenant e branding por slug
   */
  async getBySlug(slug: string): Promise<TenantBrandingResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenant/branding/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar branding:', error);
      throw error;
    }
  },

  /**
   * Busca branding por tenantId (autenticado)
   */
  async getByTenantId(tenantId: string, token: string): Promise<TenantBranding> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tenant/branding/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar branding:', error);
      throw error;
    }
  },

  /**
   * Atualiza branding (admin apenas)
   */
  async update(
    tenantId: string,
    data: Partial<TenantBranding>,
    token: string,
  ): Promise<TenantBranding> {
    try {
      const response = await axios.put(`${API_BASE_URL}/tenant/branding/${tenantId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar branding:', error);
      throw error;
    }
  },
};
