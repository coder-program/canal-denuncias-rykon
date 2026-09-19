'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../layout-admin';
import {
  Users,
  Shield,
  Headphones,
  DollarSign,
  UserPlus,
  Search,
  Filter,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Clock,
  MoreVertical,
  Key,
  UserCheck,
} from 'lucide-react';

interface InternalUser {
  id: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'FINANCIAL';
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt: string | null;
  createdAt: string;
  permissions: string[];
}

export default function UsuariosInternosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

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

  // Mock data - Usuários Internos
  const internalUsers: InternalUser[] = [
    {
      id: '1',
      fullName: 'Super Administrador OuviON',
      email: 'superadmin@ouvion.com',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      lastLoginAt: '2026-02-21T10:30:00',
      createdAt: '2025-01-01',
      permissions: ['ALL'],
    },
    {
      id: '2',
      fullName: 'João Silva',
      email: 'joao.silva@ouvion.com',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      lastLoginAt: '2026-02-20T15:45:00',
      createdAt: '2025-02-15',
      permissions: ['ALL'],
    },
    {
      id: '3',
      fullName: 'Maria Santos',
      email: 'maria.santos@ouvion.com',
      role: 'SUPPORT',
      status: 'ACTIVE',
      lastLoginAt: '2026-02-21T09:15:00',
      createdAt: '2025-03-10',
      permissions: ['VIEW_TENANTS', 'ASSIST_USERS', 'VIEW_COMPLAINTS'],
    },
    {
      id: '4',
      fullName: 'Pedro Costa',
      email: 'pedro.costa@ouvion.com',
      role: 'SUPPORT',
      status: 'ACTIVE',
      lastLoginAt: '2026-02-19T14:20:00',
      createdAt: '2025-04-05',
      permissions: ['VIEW_TENANTS', 'ASSIST_USERS', 'VIEW_COMPLAINTS'],
    },
    {
      id: '5',
      fullName: 'Ana Oliveira',
      email: 'ana.oliveira@ouvion.com',
      role: 'FINANCIAL',
      status: 'ACTIVE',
      lastLoginAt: '2026-02-21T08:00:00',
      createdAt: '2025-02-20',
      permissions: ['VIEW_BILLING', 'MANAGE_SUBSCRIPTIONS', 'VIEW_REPORTS'],
    },
    {
      id: '6',
      fullName: 'Carlos Mendes',
      email: 'carlos.mendes@ouvion.com',
      role: 'SUPPORT',
      status: 'INACTIVE',
      lastLoginAt: '2025-12-15T10:30:00',
      createdAt: '2025-05-12',
      permissions: ['VIEW_TENANTS', 'ASSIST_USERS'],
    },
  ];

  const filteredUsers = internalUsers.filter((internalUser) => {
    const matchesSearch =
      internalUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internalUser.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || internalUser.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || internalUser.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    superAdmins: internalUsers.filter((u) => u.role === 'SUPER_ADMIN' && u.status === 'ACTIVE')
      .length,
    support: internalUsers.filter((u) => u.role === 'SUPPORT' && u.status === 'ACTIVE').length,
    financial: internalUsers.filter((u) => u.role === 'FINANCIAL' && u.status === 'ACTIVE').length,
    total: internalUsers.filter((u) => u.status === 'ACTIVE').length,
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      SUPER_ADMIN: { bg: 'bg-red-100', text: 'text-red-800', icon: Shield, label: 'Super Admin' },
      SUPPORT: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Headphones, label: 'Suporte' },
      FINANCIAL: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: DollarSign,
        label: 'Financeiro',
      },
    };
    const roleInfo = roles[role as keyof typeof roles];
    const Icon = roleInfo.icon;

    return (
      <span
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${roleInfo.bg} ${roleInfo.text}`}
      >
        <Icon className="w-3 h-3" />
        <span>{roleInfo.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Ativo' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Inativo' },
    };
    const statusInfo = statuses[status as keyof typeof statuses];
    const Icon = statusInfo.icon;

    return (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}
      >
        <Icon className="w-3 h-3" />
        <span>{statusInfo.label}</span>
      </span>
    );
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Nunca acessou';

    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
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
          <h1 className="text-3xl font-bold text-gray-900">Usuários Internos</h1>
          <p className="text-gray-600 mt-1">Equipe OuviON com acesso ao painel administrativo</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-semibold">Novo Usuário</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Super Admins</p>
              <p className="text-3xl font-bold mt-1">{stats.superAdmins}</p>
            </div>
            <Shield className="w-12 h-12 text-red-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Suporte</p>
              <p className="text-3xl font-bold mt-1">{stats.support}</p>
            </div>
            <Headphones className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Financeiro</p>
              <p className="text-3xl font-bold mt-1">{stats.financial}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Ativos</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <UserCheck className="w-12 h-12 text-purple-200 opacity-80" />
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
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="ALL">Todos Perfis</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SUPPORT">Suporte</option>
              <option value="FINANCIAL">Financeiro</option>
            </select>
          </div>

          <div className="relative">
            <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="ALL">Todos Status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Box */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Atenção - Acesso Privilegiado</p>
            <p className="text-sm text-yellow-700 mt-1">
              Usuários internos têm acesso total ao sistema. Conceda permissões apenas para membros
              confiáveis da equipe OuviON.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Permissões
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Membro desde
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((internalUser) => (
                <tr key={internalUser.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900">{internalUser.fullName}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{internalUser.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(internalUser.role)}</td>
                  <td className="px-6 py-4">{getStatusBadge(internalUser.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {formatLastLogin(internalUser.lastLoginAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {internalUser.permissions.slice(0, 2).map((perm, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {perm === 'ALL' ? 'Todas' : perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {internalUser.permissions.length > 2 && (
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{internalUser.permissions.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(internalUser.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          internalUser.status === 'ACTIVE'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={internalUser.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                      >
                        {internalUser.status === 'ACTIVE' ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Mais opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum usuário encontrado</p>
              <p className="text-gray-400 text-sm mt-1">
                Tente ajustar os filtros ou criar um novo usuário
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Usuário */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Novo Usuário Interno</h2>
              <p className="text-gray-600 mt-1">Conceder acesso ao painel administrativo</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Corporativo
                </label>
                <input
                  type="email"
                  placeholder="joao.silva@ouvion.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Perfil de Acesso
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Selecione um perfil</option>
                  <option value="SUPER_ADMIN">Super Admin - Acesso total à plataforma</option>
                  <option value="SUPPORT">Suporte - Assistência a clientes</option>
                  <option value="FINANCIAL">Financeiro - Gestão de pagamentos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha Temporária
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Gerar senha automática"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    <Key className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  O usuário receberá um email para definir uma nova senha no primeiro acesso
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Um email de boas-vindas será enviado automaticamente com
                  instruções de acesso.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Funcionalidade será implementada: criar usuário interno via API');
                  setShowNewModal(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all"
              >
                Criar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
