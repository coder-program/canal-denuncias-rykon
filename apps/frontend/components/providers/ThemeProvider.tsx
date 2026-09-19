'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface SettingsContextData {
  primaryColor?: string;
  secondaryColor?: string;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsContextData>({
    primaryColor: '#3b82f6',
    secondaryColor: '#f97316',
  });

  useEffect(() => {
    loadSettings();

    // Escutar evento customizado de atualização de tema
    const handleThemeUpdate = () => {
      loadSettings();
    };

    window.addEventListener('theme-updated', handleThemeUpdate);
    return () => window.removeEventListener('theme-updated', handleThemeUpdate);
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/settings');
      if (response.data.primaryColor || response.data.secondaryColor) {
        setSettings({
          primaryColor: response.data.primaryColor || '#3b82f6',
          secondaryColor: response.data.secondaryColor || '#f97316',
        });
      }

      // Atualizar título da página com nome da empresa
      if (response.data.companyName && typeof document !== 'undefined') {
        const currentTitle = document.title;
        // Só atualizar se ainda estiver com o título padrão
        if (currentTitle.includes('Canal de Denúncias')) {
          document.title = `Canal de Denúncias - ${response.data.companyName}`;
        }
      }
    } catch (error) {
      console.log('Usando cores padrão');
    }
  };

  useEffect(() => {
    // Aplicar cores via CSS variables
    if (typeof document !== 'undefined') {
      const primary = settings.primaryColor || '#3b82f6';
      const secondary = settings.secondaryColor || '#f97316';

      document.documentElement.style.setProperty('--color-primary', primary);
      document.documentElement.style.setProperty('--color-secondary', secondary);

      // Atualizar também as variações de tons (RGB)
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 59, g: 130, b: 246 };
      };

      const primaryRgb = hexToRgb(primary);
      const secondaryRgb = hexToRgb(secondary);

      document.documentElement.style.setProperty(
        '--color-primary-rgb',
        `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
      );
      document.documentElement.style.setProperty(
        '--color-secondary-rgb',
        `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`,
      );
    }
  }, [settings]);

  return <>{children}</>;
}
