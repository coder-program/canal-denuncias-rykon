'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Bell, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { notificationsService, Notification } from '@/lib/services';

interface PrivateLayoutProps {
  children: React.ReactNode;
}

// Função para calcular tempo relativo
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Agora mesmo';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} atrás`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} dia${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} atrás`;
  return date.toLocaleDateString('pt-BR');
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Carregar notificações
  const loadNotifications = async () => {
    if (!isAuthenticated || isLoggingOut) return;

    try {
      setLoadingNotifications(true);
      const [notifs, count] = await Promise.all([
        notificationsService.getAll(),
        notificationsService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error: any) {
      // Silenciar erro de rede se estiver fazendo logout
      if (!isLoggingOut) {
        console.error('Erro ao carregar notificações:', error.message || error);
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Marcar como lida
  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Carregar notificações ao montar e a cada 30 segundos
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fechar notificações ao mudar de rota
  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Só redireciona para login se não estiver fazendo logout intencionalmente
    if (!isAuthenticated && !isLoggingOut) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoggingOut]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    logout();
    router.push('/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e métricas',
    },
    {
      name: 'Denúncias',
      href: '/denuncias',
      icon: FileText,
      description: 'Gestão de denúncias',
    },
    {
      name: 'Usuários',
      href: '/usuarios',
      icon: Users,
      description: 'Gestão de usuários',
      roles: ['ADMIN'],
    },
    {
      name: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
      description: 'Configurações do sistema',
      roles: ['ADMIN'],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || ''),
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Canal Denúncias</h1>
              <p className="text-xs text-slate-500">Compliance</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <div className="relative z-50">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-[60]">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">Notificações</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-8 text-center text-slate-500">
                        <p>Carregando...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p>Nenhuma notificação</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const timeAgo = getTimeAgo(notification.createdAt);
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  !notification.isRead ? 'bg-blue-500' : 'bg-slate-300'
                                }`}
                              />
                              <div className="flex-1">
                                <h4
                                  className={`font-semibold text-sm ${
                                    !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-slate-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">{timeAgo}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-200 text-center">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                        Ver todas as notificações
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notifications Overlay */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
      )}
    </div>
  );
}
