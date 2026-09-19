import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/'];

// Rotas protegidas que exigem autenticação
const PROTECTED_ROUTES = ['/dashboard', '/denuncias', '/usuarios', '/configuracoes'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se tem token no cookie ou será verificado no client-side
  const authCookie = request.cookies.get('auth-token');

  // Se for rota protegida e não tem cookie, redirecionar para login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !authCookie) {
    // Verificar se tem token no localStorage (será feito no client-side)
    // Por enquanto, permitir que o componente PrivateLayout faça a verificação
    return NextResponse.next();
  }

  // Se estiver na página de login e já estiver autenticado, redirecionar para dashboard
  if (pathname === '/login' && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar em quais rotas o middleware será executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
