import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OuviON - Login Administrativo',
  description: 'Acesso exclusivo para administradores da plataforma OuviON',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
