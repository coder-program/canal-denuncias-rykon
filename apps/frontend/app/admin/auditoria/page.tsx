'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../layout-admin';
import {
  FileText,
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  CreditCard,
  Settings,
  LogIn,
  UserPlus,
  Ban,
  XCircle,
  Edit,
  Calendar,
  MapPin,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export default function AuditoriaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (!userStr || !token || userStr === 'undefined' || token === 'undefined') {
      router.push('/loginadm');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao fazer parse do usuário:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      router.push('/loginadm');
    }
  }, [router]);

  // Mock data - Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2026-02-21T10:30:00',
      userId: '1',
      userName: 'Super Administrador OuviON',
      userEmail: 'superadmin@ouvion.com',
      action: 'LOGIN',
      resource: 'auth',
      details: { loginType: 'SUPER_ADMIN', success: true },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'LOW',
    },
    {
      id: '2',
      timestamp: '2026-02-21T09:45:00',
      userId: '2',
      userName: 'João Silva',
      userEmail: 'joao.silva@ouvion.com',
      action: 'TENANT_CREATED',
      resource: 'tenant',
      resourceId: 'tenant-123',
      details: {
        tenantName: 'Nova Empresa Ltda',
        slug: 'nova-empresa',
        plan: 'PRO',
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'HIGH',
    },
    {
      id: '3',
      timestamp: '2026-02-21T09:15:00',
      userId: '2',
      userName: 'João Silva',
      userEmail: 'joao.silva@ouvion.com',
      action: 'PLAN_CHANGED',
      resource: 'subscription',
      resourceId: 'sub-456',
      details: {
        tenantName: 'Tech Corp Brasil',
        oldPlan: 'PRO',
        newPlan: 'ENTERPRISE',
        reason: 'Upgrade solicitado pelo cliente',
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'CRITICAL',
    },
    {
      id: '4',
      timestamp: '2026-02-21T08:30:00',
      userId: '5',
      userName: 'Ana Oliveira',
      userEmail: 'ana.oliveira@ouvion.com',
      action: 'SUBSCRIPTION_PAYMENT',
      resource: 'billing',
      resourceId: 'payment-789',
      details: {
        tenantName: 'Indústria Silva SA',
        amount: 890,
        status: 'PAID',
        method: 'Cartão de Crédito',
      },
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'MEDIUM',
    },
    {
      id: '5',
      timestamp: '2026-02-20T18:20:00',
      userId: '2',
      userName: 'João Silva',
      userEmail: 'joao.silva@ouvion.com',
      action: 'TENANT_SUSPENDED',
      resource: 'tenant',
      resourceId: 'tenant-789',
      details: {
        tenantName: 'Consultoria Prime',
        reason: 'Pagamento em atraso há 15 dias',
        dueAmount: 890,
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'HIGH',
    },
    {
      id: '6',
      timestamp: '2026-02-20T16:45:00',
      userId: '3',
      userName: 'Maria Santos',
      userEmail: 'maria.santos@ouvion.com',
      action: 'USER_PASSWORD_RESET',
      resource: 'user',
      resourceId: 'user-234',
      details: {
        targetUser: 'admin@techcorp.com.br',
        tenantName: 'Tech Corp Brasil',
        reason: 'Solicitação do usuário via suporte',
      },
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'MEDIUM',
    },
    {
      id: '7',
      timestamp: '2026-02-20T14:10:00',
      userId: '2',
      userName: 'João Silva',
      userEmail: 'joao.silva@ouvion.com',
      action: 'INTERNAL_USER_CREATED',
      resource: 'internal_user',
      resourceId: 'user-999',
      details: {
        newUserName: 'Carlos Mendes',
        newUserEmail: 'carlos.mendes@ouvion.com',
        role: 'SUPPORT',
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'HIGH',
    },
    {
      id: '8',
      timestamp: '2026-02-20T11:30:00',
      userId: '5',
      userName: 'Ana Oliveira',
      userEmail: 'ana.oliveira@ouvion.com',
      action: 'SUBSCRIPTION_CANCELLED',
      resource: 'subscription',
      resourceId: 'sub-111',
      details: {
        tenantName: 'StartUp Inovação',
        plan: 'FREE',
        reason: 'Empresa encerrou atividades',
        refundIssued: false,
      },
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'MEDIUM',
    },
    {
      id: '9',
      timestamp: '2026-02-19T09:00:00',
      userId: '1',
      userName: 'Super Administrador OuviON',
      userEmail: 'superadmin@ouvion.com',
      action: 'SETTINGS_CHANGED',
      resource: 'platform_settings',
      details: {
        setting: 'Trial Period Days',
        oldValue: '14',
        newValue: '30',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'CRITICAL',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesAction && matchesSeverity;
  });

  // Stats
  const stats = {
    total: auditLogs.length,
    critical: auditLogs.filter((l) => l.severity === 'CRITICAL').length,
    today: auditLogs.filter((l) => {
      const logDate = new Date(l.timestamp).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
    }).length,
    lastHour: auditLogs.filter((l) => {
      const logTime = new Date(l.timestamp).getTime();
      const hourAgo = Date.now() - 60 * 60 * 1000;
      return logTime > hourAgo;
    }).length,
  };

  const getActionIcon = (action: string) => {
    const icons: { [key: string]: any } = {
      LOGIN: LogIn,
      TENANT_CREATED: Building2,
      TENANT_SUSPENDED: Ban,
      TENANT_CANCELLED: XCircle,
      PLAN_CHANGED: CreditCard,
      SUBSCRIPTION_PAYMENT: CreditCard,
      SUBSCRIPTION_CANCELLED: XCircle,
      USER_PASSWORD_RESET: Shield,
      INTERNAL_USER_CREATED: UserPlus,
      SETTINGS_CHANGED: Settings,
    };
    return icons[action] || Activity;
  };

  const getActionBadge = (action: string) => {
    const actions: { [key: string]: { bg: string; text: string } } = {
      LOGIN: { bg: 'bg-blue-100', text: 'text-blue-800' },
      TENANT_CREATED: { bg: 'bg-green-100', text: 'text-green-800' },
      TENANT_SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800' },
      TENANT_CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800' },
      PLAN_CHANGED: { bg: 'bg-purple-100', text: 'text-purple-800' },
      SUBSCRIPTION_PAYMENT: { bg: 'bg-green-100', text: 'text-green-800' },
      SUBSCRIPTION_CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
      USER_PASSWORD_RESET: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      INTERNAL_USER_CREATED: { bg: 'bg-blue-100', text: 'text-blue-800' },
      SETTINGS_CHANGED: { bg: 'bg-orange-100', text: 'text-orange-800' },
    };

    const style = actions[action] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const label = action.replace(/_/g, ' ');

    return (
      <span
        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        {label}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severities = {
      LOW: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Baixa' },
      MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Média' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Alta' },
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítica' },
    };
    const info = severities[severity as keyof typeof severities];

    return (
      <span
        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${info.bg} ${info.text}`}
      >
        {info.label}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout user={user}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoria</h1>
          <p className="text-gray-600 mt-1">Logs de ações críticas e eventos da plataforma</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Download className="w-4 h-4" />
          <span className="font-medium">Exportar Logs</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Logs</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Ações Críticas</p>
              <p className="text-3xl font-bold mt-1">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Eventos Hoje</p>
              <p className="text-3xl font-bold mt-1">{stats.today}</p>
            </div>
            <Activity className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Última Hora</p>
              <p className="text-3xl font-bold mt-1">{stats.lastHour}</p>
            </div>
            <Clock className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por usuário, ação ou detalhes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="ALL">Todas Ações</option>
              <option value="LOGIN">Login</option>
              <option value="TENANT_CREATED">Empresa Criada</option>
              <option value="TENANT_SUSPENDED">Empresa Suspensa</option>
              <option value="PLAN_CHANGED">Plano Alterado</option>
              <option value="SUBSCRIPTION_PAYMENT">Pagamento</option>
              <option value="USER_PASSWORD_RESET">Reset de Senha</option>
              <option value="SETTINGS_CHANGED">Configurações</option>
            </select>
          </div>

          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="ALL">Todas Severidades</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline / Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const Icon = getActionIcon(log.action);
          const isExpanded = expandedLog === log.id;

          return (
            <div
              key={log.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div
                      className={`p-3 rounded-lg ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-100'
                          : log.severity === 'HIGH'
                            ? 'bg-orange-100'
                            : log.severity === 'MEDIUM'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          log.severity === 'CRITICAL'
                            ? 'text-red-600'
                            : log.severity === 'HIGH'
                              ? 'text-orange-600'
                              : log.severity === 'MEDIUM'
                                ? 'text-blue-600'
                                : 'text-gray-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getActionBadge(log.action)}
                        {getSeverityBadge(log.severity)}
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{log.userName}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{log.userEmail}</span>
                      </div>

                      <div className="text-sm text-gray-700">
                        {log.action === 'TENANT_CREATED' && (
                          <p>
                            Criou nova empresa: <strong>{log.details.tenantName}</strong> (Plano:{' '}
                            {log.details.plan})
                          </p>
                        )}
                        {log.action === 'PLAN_CHANGED' && (
                          <p>
                            Alterou plano de <strong>{log.details.tenantName}</strong>:{' '}
                            {log.details.oldPlan} → {log.details.newPlan}
                          </p>
                        )}
                        {log.action === 'TENANT_SUSPENDED' && (
                          <p>
                            Suspendeu empresa: <strong>{log.details.tenantName}</strong> -{' '}
                            {log.details.reason}
                          </p>
                        )}
                        {log.action === 'SUBSCRIPTION_PAYMENT' && (
                          <p>
                            Pagamento recebido de <strong>{log.details.tenantName}</strong>: R${' '}
                            {log.details.amount}
                          </p>
                        )}
                        {log.action === 'USER_PASSWORD_RESET' && (
                          <p>
                            Resetou senha do usuário <strong>{log.details.targetUser}</strong> de{' '}
                            {log.details.tenantName}
                          </p>
                        )}
                        {log.action === 'INTERNAL_USER_CREATED' && (
                          <p>
                            Criou usuário interno: <strong>{log.details.newUserName}</strong> (
                            {log.details.role})
                          </p>
                        )}
                        {log.action === 'SETTINGS_CHANGED' && (
                          <p>
                            Alterou configuração <strong>{log.details.setting}</strong>:{' '}
                            {log.details.oldValue} → {log.details.newValue}
                          </p>
                        )}
                        {log.action === 'LOGIN' && (
                          <p>Login realizado com sucesso ({log.details.loginType})</p>
                        )}
                        {log.action === 'SUBSCRIPTION_CANCELLED' && (
                          <p>
                            Cancelou assinatura de <strong>{log.details.tenantName}</strong> -{' '}
                            {log.details.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Informações Técnicas
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-gray-500">IP Address:</p>
                              <p className="font-mono text-gray-900">{log.ipAddress}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-gray-500">User Agent:</p>
                              <p className="font-mono text-xs text-gray-700 break-all">
                                {log.userAgent}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-gray-500">Timestamp Completo:</p>
                              <p className="font-mono text-gray-900">
                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Detalhes da Ação
                        </p>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <pre className="text-xs text-gray-700 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum log encontrado</p>
            <p className="text-gray-400 text-sm mt-1">
              Tente ajustar os filtros ou buscar por outros termos
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
