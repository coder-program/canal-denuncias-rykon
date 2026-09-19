'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function DynamicFavicon() {
  useEffect(() => {
    loadFavicon();

    // Escutar evento de atualização de tema/logo
    const handleLogoUpdate = () => {
      loadFavicon();
    };

    window.addEventListener('theme-updated', handleLogoUpdate);
    return () => window.removeEventListener('theme-updated', handleLogoUpdate);
  }, []);

  const loadFavicon = async () => {
    try {
      const response = await apiClient.get('/settings');
      const logoUrl = response.data.companyLogo;

      if (logoUrl && typeof document !== 'undefined') {
        // Atualizar favicon
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = logoUrl;

        // Atualizar apple-touch-icon
        let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.head.appendChild(appleLink);
        }
        appleLink.href = logoUrl;
      }
    } catch (error) {
      console.log('Logo não disponível, usando favicon padrão');
    }
  };

  return null;
}
