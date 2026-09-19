import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Painel Administrativo - OuviON',
  description: 'Painel de administração da plataforma OuviON',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
