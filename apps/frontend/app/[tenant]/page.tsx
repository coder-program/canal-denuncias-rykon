'use client';

import { useTenant } from '@/contexts/TenantContext';
import Link from 'next/link';

export default function TenantLandingPage() {
  const { tenant, branding } = useTenant();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-transparent">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className="h-12" />
          ) : (
            <h1 className="text-2xl font-bold text-white">{branding.companyName}</h1>
          )}

          <Link
            href={`/${tenant.slug}/login`}
            className="px-6 py-2 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: branding.primaryColor,
              color: 'white',
            }}
          >
            Acessar Plataforma
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Canal de Denúncias Confidencial</h2>

          <p className="text-xl text-gray-300 mb-12">
            Denuncie condutas inadequadas de forma segura, anônima e confidencial. Sua voz importa
            para construirmos um ambiente de trabalho mais ético e transparente.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href={`/${tenant.slug}/nova-denuncia`}
              className="px-8 py-4 rounded-lg font-bold text-lg transition-transform hover:scale-105"
              style={{
                backgroundColor: branding.primaryColor,
                color: 'white',
              }}
            >
              Fazer uma Denúncia
            </Link>

            <Link
              href={`/${tenant.slug}/acompanhar`}
              className="px-8 py-4 rounded-lg font-bold text-lg border-2 transition-transform hover:scale-105"
              style={{
                borderColor: branding.secondaryColor,
                color: branding.secondaryColor,
              }}
            >
              Acompanhar Denúncia
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
            <div
              className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Confidencial</h3>
            <p className="text-gray-300">
              Seus dados são protegidos e sua identidade pode permanecer anônima.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
            <div
              className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Acompanhamento</h3>
            <p className="text-gray-300">
              Acompanhe o status da sua denúncia com um protocolo único e seguro.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
            <div
              className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ação Rápida</h3>
            <p className="text-gray-300">
              Equipe especializada analisa e toma as devidas providências rapidamente.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black bg-opacity-30 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {branding.companyName}. Todos os direitos reservados.
          </p>
          <p className="text-sm mt-2">Powered by OuviON</p>
        </div>
      </footer>
    </div>
  );
}
