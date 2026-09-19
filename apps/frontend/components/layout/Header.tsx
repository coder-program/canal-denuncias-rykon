'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface HeaderProps {
  showAdminButton?: boolean;
}

export default function Header({ showAdminButton = true }: HeaderProps) {
  const [companyName, setCompanyName] = useState('Canal de Denúncias');
  const [companyLogo, setCompanyLogo] = useState('');
  const [tagline] = useState('Compliance e Integridade Corporativa');

  useEffect(() => {
    loadHeaderData();

    // Reload on settings update
    const handleThemeUpdate = () => loadHeaderData();
    window.addEventListener('theme-updated', handleThemeUpdate);
    return () => window.removeEventListener('theme-updated', handleThemeUpdate);
  }, []);

  const loadHeaderData = async () => {
    try {
      const response = await apiClient.get('/settings');
      const settings = response.data;

      if (settings.companyName) {
        setCompanyName(settings.companyName);
      }

      if (settings.companyLogo) {
        setCompanyLogo(settings.companyLogo);
      }
    } catch (error) {
      console.error('Failed to load header data:', error);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          {/* Dynamic Logo */}
          {companyLogo ? (
            <div className="bg-transparent" style={{ width: '180px', height: '95px' }}>
              <img
                src={companyLogo}
                alt={`${companyName} Logo`}
                style={{ width: '180px', height: '95px' }}
                className="object-contain"
              />
            </div>
          ) : (
            <div
              style={{ width: '180px', height: '95px' }}
              className="rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg"
            >
              <Shield className="w-12 h-12 text-white" />
            </div>
          )}

          {/* Dynamic Company Name */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{companyName}</h1>
            <p className="text-sm text-slate-600">{tagline}</p>
          </div>
        </Link>

        {/* Admin Button */}
        {showAdminButton && (
          <Link href="/login">
            <button className="btn-primary flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Área Administrativa
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
