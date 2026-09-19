import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Modo standalone para Docker/AWS
  output: 'standalone',

  // React Strict Mode
  reactStrictMode: true,

  // Remover header 'X-Powered-By: Next.js'
  poweredByHeader: false,

  // Compressão Gzip
  compress: true,

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
