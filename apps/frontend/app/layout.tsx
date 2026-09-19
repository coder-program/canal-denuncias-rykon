import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/providers/ThemeProvider';
import DynamicFavicon from '@/components/providers/DynamicFavicon';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Canal de Denúncias - Compliance Corporativo',
  description: 'Sistema profissional de gestão de denúncias corporativas',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans`}>
        <DynamicFavicon />
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton duration={4000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
