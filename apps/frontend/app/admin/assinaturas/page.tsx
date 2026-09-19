'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../layout-admin';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Download,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Subscription {
  id: string;
  tenantName: string;
  tenantSlug: string;
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
  mrr: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  nextBillingDate: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  tenantName: string;
  amount: number;
  plan: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  date: string;
  method: string;
}

export default function AssinaturasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'transactions'>('subscriptions');

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

  // Mock data - Assinaturas
  const subscriptions: Subscription[] = [
    {
      id: '1',
      tenantName: 'Tech Corp Brasil',
      tenantSlug: 'techcorp',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      mrr: 2500,
      billingCycle: 'YEARLY',
      nextBillingDate: '2026-01-15',
      createdAt: '2025-01-15',
    },
    {
      id: '2',
      tenantName: 'Indústria Silva SA',
      tenantSlug: 'silva-industria',
      plan: 'PRO',
      status: 'ACTIVE',
      mrr: 890,
      billingCycle: 'MONTHLY',
      nextBillingDate: '2026-03-10',
      createdAt: '2025-02-10',
    },
    {
      id: '3',
      tenantName: 'Varejo Mega',
      tenantSlug: 'varejo-mega',
      plan: 'BASIC',
      status: 'TRIAL',
      mrr: 0,
      billingCycle: 'MONTHLY',
      nextBillingDate: '2026-03-01',
      createdAt: '2026-02-15',
    },
    {
      id: '4',
      tenantName: 'Consultoria Prime',
      tenantSlug: 'consultoria-prime',
      plan: 'PRO',
      status: 'PAST_DUE',
      mrr: 890,
      billingCycle: 'MONTHLY',
      nextBillingDate: '2026-02-20',
      createdAt: '2024-11-20',
    },
  ];

  // Mock data - Transações
  const transactions: Transaction[] = [
    {
      id: '1',
      tenantName: 'Tech Corp Brasil',
      amount: 2500,
      plan: 'Enterprise',
      status: 'PAID',
      date: '2026-01-15',
      method: 'Cartão de Crédito',
    },
    {
      id: '2',
      tenantName: 'Indústria Silva SA',
      amount: 890,
      plan: 'Pro',
      status: 'PAID',
      date: '2026-02-10',
      method: 'Boleto',
    },
    {
      id: '3',
      tenantName: 'Consultoria Prime',
      amount: 890,
      plan: 'Pro',
      status: 'FAILED',
      date: '2026-02-20',
      method: 'Cartão de Crédito',
    },
    {
      id: '4',
      tenantName: 'Varejo Mega',
      amount: 290,
      plan: 'Basic',
      status: 'PENDING',
      date: '2026-02-21',
      method: 'Pix',
    },
  ];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.tenantSlug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'ALL' || sub.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const filteredTransactions = transactions.filter((trans) => {
    const matchesSearch = trans.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Ativa' },
      TRIAL: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Trial' },
      PAST_DUE: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Vencida' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Cancelada' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Pago' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pendente' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Falhou' },
      REFUNDED: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: ArrowDownRight,
        label: 'Reembolsado',
      },
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assinaturas & Pagamentos</h1>
        <p className="text-gray-600 mt-1">Controle financeiro da plataforma</p>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-1 text-green-100 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+15,3%</span>
            </div>
          </div>
          <p className="text-green-100 text-sm font-medium">MRR Total</p>
          <p className="text-3xl font-bold mt-1">R$ 48.500</p>
          <p className="text-green-100 text-xs mt-1">Receita Mensal Recorrente</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-1 text-blue-100 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+8,2%</span>
            </div>
          </div>
          <p className="text-blue-100 text-sm font-medium">ARR</p>
          <p className="text-3xl font-bold mt-1">R$ 582K</p>
          <p className="text-blue-100 text-xs mt-1">Receita Anual Recorrente</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-1 text-purple-100 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+12</span>
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium">Assinaturas Ativas</p>
          <p className="text-3xl font-bold mt-1">48</p>
          <p className="text-purple-100 text-xs mt-1">Empresas pagantes</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-1 text-orange-100 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+5,1%</span>
            </div>
          </div>
          <p className="text-orange-100 text-sm font-medium">Ticket Médio</p>
          <p className="text-3xl font-bold mt-1">R$ 1.010</p>
          <p className="text-orange-100 text-xs mt-1">Por empresa/mês</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">LTV Médio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">R$ 12.400</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">23,5%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2,4%</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">R$ 2.680</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'subscriptions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Assinaturas Ativas ({filteredSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Histórico de Transações ({filteredTransactions.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {activeTab === 'subscriptions' && (
              <>
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
                    <option value="PAST_DUE">Vencidas</option>
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
                    <option value="BASIC">Basic</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'transactions' && (
              <div className="md:col-span-2 flex justify-end">
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Exportar CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subscriptions Table */}
        {activeTab === 'subscriptions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    MRR
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ciclo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Próxima Cobrança
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente desde
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900">{sub.tenantName}</p>
                          <p className="text-sm text-gray-500">{sub.tenantSlug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getPlanBadge(sub.plan)}</td>
                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {sub.mrr > 0 ? `R$ ${sub.mrr}` : 'R$ 0'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {sub.billingCycle === 'MONTHLY' ? 'Mensal' : 'Anual'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {new Date(sub.nextBillingDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhuma assinatura encontrada</p>
                <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros</p>
              </div>
            )}
          </div>
        )}

        {/* Transactions Table */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((trans) => (
                  <tr key={trans.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{trans.tenantName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{trans.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">R$ {trans.amount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{trans.method}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(trans.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {new Date(trans.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhuma transação encontrada</p>
                <p className="text-gray-400 text-sm mt-1">Tente ajustar a busca</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
