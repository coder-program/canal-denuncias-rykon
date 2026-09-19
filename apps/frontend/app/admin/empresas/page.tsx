'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../layout-admin';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  MoreVertical,
  Mail,
  Users,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  users: number;
  complaints: number;
  mrr: number;
  createdAt: string;
  expiresAt?: string;
}

export default function EmpresasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
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

  // Mock data - substituir por chamada API
  const tenants: Tenant[] = [
    {
      id: '1',
      name: 'Tech Corp Brasil',
      slug: 'techcorp',
      email: 'admin@techcorp.com.br',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      users: 45,
      complaints: 1234,
      mrr: 2500,
      createdAt: '2025-01-15',
      expiresAt: '2026-01-15',
    },
    {
      id: '2',
      name: 'Indústria Silva SA',
      slug: 'silva-industria',
      email: 'contato@silvaind.com.br',
      plan: 'PRO',
      status: 'ACTIVE',
      users: 28,
      complaints: 856,
      mrr: 890,
      createdAt: '2025-02-10',
      expiresAt: '2026-02-10',
    },
    {
      id: '3',
      name: 'Varejo Mega',
      slug: 'varejo-mega',
      email: 'ti@varejomega.com.br',
      plan: 'BASIC',
      status: 'TRIAL',
      users: 12,
      complaints: 234,
      mrr: 0,
      createdAt: '2026-02-15',
      expiresAt: '2026-03-01',
    },
    {
      id: '4',
      name: 'Consultoria Prime',
      slug: 'consultoria-prime',
      email: 'admin@prime.com.br',
      plan: 'PRO',
      status: 'SUSPENDED',
      users: 8,
      complaints: 45,
      mrr: 0,
      createdAt: '2024-11-20',
    },
    {
      id: '5',
      name: 'StartUp Inovação',
      slug: 'startup-inova',
      email: 'contato@startupinova.com',
      plan: 'FREE',
      status: 'CANCELLED',
      users: 3,
      complaints: 12,
      mrr: 0,
      createdAt: '2024-08-05',
    },
  ];

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'ALL' || tenant.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Ativa' },
      TRIAL: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Trial' },
      SUSPENDED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Ban, label: 'Suspensa' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelada' },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        <span>{badge.label}</span>
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const plans = {
      FREE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Free' },
      BASIC: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Basic' },
      PRO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Pro' },
      ENTERPRISE: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Enterprise' },
    };
    const planInfo = plans[plan as keyof typeof plans];

    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${planInfo.bg} ${planInfo.text}`}
      >
        {planInfo.label}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as empresas (tenants) da plataforma</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nova Empresa</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ativas</p>
              <p className="text-3xl font-bold mt-1">48</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Trial</p>
              <p className="text-3xl font-bold mt-1">7</p>
            </div>
            <Clock className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Suspensas</p>
              <p className="text-3xl font-bold mt-1">3</p>
            </div>
            <Ban className="w-12 h-12 text-yellow-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Canceladas</p>
              <p className="text-3xl font-bold mt-1">2</p>
            </div>
            <XCircle className="w-12 h-12 text-red-200 opacity-80" />
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
              placeholder="Buscar por nome, slug ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="ALL">Todos Status</option>
              <option value="ACTIVE">Ativas</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspensas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="ALL">Todos Planos</option>
              <option value="FREE">Free</option>
              <option value="BASIC">Basic</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
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
                  Empresa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Denúncias
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  MRR
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Criada em
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900">{tenant.name}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{tenant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                      {tenant.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">{getPlanBadge(tenant.plan)}</td>
                  <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{tenant.users}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{tenant.complaints}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {tenant.mrr > 0 ? `R$ ${tenant.mrr}` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
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

          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhuma empresa encontrada</p>
              <p className="text-gray-400 text-sm mt-1">
                Tente ajustar os filtros ou criar uma nova empresa
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Empresa - simplificado por enquanto */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Nova Empresa</h2>
              <p className="text-gray-600 mt-1">Cadastrar nova empresa na plataforma</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tech Corp Brasil"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  placeholder="Ex: techcorp"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL de acesso: https://app.ouvion.com/<strong>slug</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email do Administrador
                </label>
                <input
                  type="email"
                  placeholder="admin@empresa.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Plano</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="TRIAL">Trial (14 dias)</option>
                  <option value="BASIC">Basic - R$ 290/mês</option>
                  <option value="PRO">Pro - R$ 890/mês</option>
                  <option value="ENTERPRISE">Enterprise - R$ 2.500/mês</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Um email será enviado automaticamente ao administrador com
                  as credenciais de acesso.
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
                  alert('Funcionalidade será implementada: criar empresa via API');
                  setShowNewModal(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all"
              >
                Criar Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
