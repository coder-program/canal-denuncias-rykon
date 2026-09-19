'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../layout-admin';
import {
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Activity,
  Calendar,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    console.log('🔍 Dashboard: Verificando autenticação...');
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    console.log('📦 localStorage.user:', userStr);
    console.log('🔑 localStorage.token:', token ? 'exists' : 'null');

    if (!userStr || !token || userStr === 'undefined' || token === 'undefined') {
      console.log('❌ Dashboard: Sem credenciais, redirecionando para /loginadm');
      router.push('/loginadm');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      console.log('👤 Dashboard: Usuário parseado:', userData);

      // Verificar se é SUPER_ADMIN
      if (userData.role !== 'SUPER_ADMIN') {
        console.log('⚠️ Dashboard: Usuário não é SUPER_ADMIN, redirecionando para /dashboard');
        router.push('/dashboard');
        return;
      }

      console.log('✅ Dashboard: Autenticação OK, carregando dashboard...');
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Dashboard: Erro ao fazer parse do usuário:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      router.push('/loginadm');
    }
  }, [router]);

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

  // KPIs Estratégicos
  const kpis = [
    {
      id: 1,
      name: 'MRR (Receita Mensal)',
      value: 'R$ 48.500',
      change: '+15,3%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      description: 'vs. mês anterior',
    },
    {
      id: 2,
      name: 'Empresas Ativas',
      value: '48',
      change: '+8',
      changeType: 'increase',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      description: 'no último mês',
    },
    {
      id: 3,
      name: 'Taxa de Churn',
      value: '2,4%',
      change: '-0,8%',
      changeType: 'decrease',
      icon: TrendingDown,
      color: 'from-orange-500 to-orange-600',
      description: 'vs. mês anterior',
    },
    {
      id: 4,
      name: 'Canais Ativos',
      value: '156',
      change: '+23',
      changeType: 'increase',
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
      description: 'em operação',
    },
  ];

  // Métricas Secundárias
  const secondaryMetrics = [
    { label: 'LTV Médio', value: 'R$ 12.400', icon: TrendingUp },
    { label: 'Ticket Médio', value: 'R$ 1.010', icon: DollarSign },
    { label: 'Empresas Trial', value: '7', icon: Clock },
    { label: 'Denúncias Globais', value: '5.678', icon: FileText },
  ];

  // Status das Empresas
  const companiesStatus = [
    { status: 'Ativas', count: 48, color: 'text-green-600 bg-green-50', icon: CheckCircle },
    { status: 'Trial', count: 7, color: 'text-blue-600 bg-blue-50', icon: Clock },
    { status: 'Suspensas', count: 3, color: 'text-orange-600 bg-orange-50', icon: AlertTriangle },
    { status: 'Canceladas', count: 2, color: 'text-red-600 bg-red-50', icon: XCircle },
  ];

  // Empresas Recentes
  const recentCompanies = [
    {
      id: 1,
      name: 'Tech Corp Brasil',
      slug: 'techcorp',
      plan: 'Enterprise',
      users: 45,
      complaints: 123,
      status: 'ACTIVE',
      created: '2 dias atrás',
    },
    {
      id: 2,
      name: 'Indústria Silva SA',
      slug: 'industria-silva',
      plan: 'Professional',
      users: 28,
      complaints: 67,
      status: 'ACTIVE',
      created: '5 dias atrás',
    },
    {
      id: 3,
      name: 'Varejo Mega',
      slug: 'varejo-mega',
      plan: 'Starter',
      users: 12,
      complaints: 34,
      status: 'TRIAL',
      created: '1 semana atrás',
    },
  ];

  return (
    <AdminLayout user={user}>
      {/* Hero Section com KPIs */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard da Plataforma</h1>
          <p className="text-gray-600 mt-1">Visão estratégica do negócio OuviON</p>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className={`h-1 bg-gradient-to-r ${kpi.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                    <kpi.icon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      kpi.changeType === 'increase'
                        ? 'text-green-700 bg-green-50'
                        : 'text-orange-700 bg-orange-50'
                    }`}
                  >
                    {kpi.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{kpi.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {secondaryMetrics.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <metric.icon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">{metric.label}</p>
                <p className="text-lg font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status das Empresas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Status das Empresas</h3>
          <div className="space-y-3">
            {companiesStatus.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crescimento Mensal */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Crescimento</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Novas Empresas</span>
                <span className="font-bold text-green-600">+8 (20%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Cancelamentos</span>
                <span className="font-bold text-red-600">-2 (5%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Retenção</span>
                <span className="font-bold text-blue-600">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Alertas Críticos</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">2 empresas vencendo hoje</p>
                <p className="text-xs text-red-700">Verificar pagamentos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">3 trials expirando</p>
                <p className="text-xs text-orange-700">Próximos 3 dias</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Sistema operando normalmente</p>
                <p className="text-xs text-blue-700">Uptime: 99.98%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empresas Recentes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Empresas Recentes</h3>
          <button
            onClick={() => router.push('/admin/empresas')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todas →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Empresa
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Slug
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Plano
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Usuários
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Denúncias
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Criada
                </th>
              </tr>
            </thead>
            <tbody>
              {recentCompanies.map((company) => (
                <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{company.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">/{company.slug}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {company.plan}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">{company.users}</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">
                    {company.complaints}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {company.status === 'ACTIVE' ? 'Ativa' : 'Trial'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-600">{company.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
