/**
 * Token Manager
 * Gerencia tokens JWT no localStorage de forma segura
 */

const TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';
const TOKEN_EXPIRY_KEY = 'auth-token-expiry';

export const tokenManager = {
  /**
   * Salvar access token
   */
  setAccessToken: (token: string, expiresIn?: string) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(TOKEN_KEY, token);

    // Calcular tempo de expiração (padrão: 15 minutos)
    if (expiresIn) {
      const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  },

  /**
   * Obter access token
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Salvar refresh token
   */
  setRefreshToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Obter refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Verificar se o token está expirado
   */
  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;

    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;

    return Date.now() > parseInt(expiryTime);
  },

  /**
   * Verificar se o token vai expirar em breve (5 minutos)
   */
  isTokenExpiringSoon: (): boolean => {
    if (typeof window === 'undefined') return false;

    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;

    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() > parseInt(expiryTime) - fiveMinutes;
  },

  /**
   * Limpar todos os tokens
   */
  clearTokens: () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  /**
   * Verificar se há tokens salvos
   */
  hasTokens: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(REFRESH_TOKEN_KEY));
  },
};
