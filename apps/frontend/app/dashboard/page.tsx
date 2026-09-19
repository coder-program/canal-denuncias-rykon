'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivateLayout from '@/components/layouts/PrivateLayout';
import { apiClient } from '@/lib/api';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { complaintsService, ComplaintsListResponse } from '@/lib/services/complaintsService';
import { Complaint } from '@/types';
import { FileText, Clock, CheckCircle2, AlertCircle, Eye, Loader2, Search, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { stats, loading, error, refetch } = useDashboardStats();

  const [themeColors, setThemeColors] = useState({
    primary: '#3b82f6',
    secondary: '#f97316',
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ComplaintsListResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    loadThemeColors();
    window.addEventListener('theme-updated', loadThemeColors);
    return () => window.removeEventListener('theme-updated', loadThemeColors);
  }, []);

  const loadThemeColors = async () => {
    try {
      const response = await apiClient.get('/settings');
      const settings = response.data;
      if (settings.primaryColor) {
        setThemeColors({
          primary: settings.primaryColor,
          secondary: settings.secondaryColor || '#f97316',
        });
      }
    } catch (error) {
      console.error('Failed to load theme colors:', error);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await complaintsService.list({
        search: searchQuery,
        limit: 10,
        page: 1,
      });

      // Verificar se a resposta tem a estrutura esperada
      if (results && results.pagination && results.data) {
        setSearchResults(results);
      } else {
        console.error('Invalid search results structure:', results);
        setSearchError('Resposta inválida do servidor');
        setSearchResults(null);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError(err?.response?.data?.message || 'Erro ao buscar denúncias');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchError(null);
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mapear tipos de denúncia
  const typeLabels: Record<string, string> = {
    HARASSMENT: 'Assédio',
    CORRUPTION: 'Corrupção',
    FRAUD: 'Fraude',
    DISCRIMINATION: 'Discriminação',
    VIOLENCE: 'Violência',
    THEFT: 'Roubo',
    SAFETY: 'Segurança',
    ETHICS: 'Ética',
    OTHER: 'Outros',
  };

  // Mapear prioridades
  const priorityLabels: Record<string, string> = {
    CRITICAL: 'Crítica',
    URGENT: 'Urgente',
    HIGH: 'Alta',
    MEDIUM: 'Média',
    LOW: 'Baixa',
  };

  const priorityColors: Record<string, string> = {
    CRITICAL: '#dc2626',
    URGENT: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6',
  };

  // Dados para gráfico de barras (Denúncias por Tipo)
  const complaintsByType = stats?.byType
    ? Object.entries(stats.byType).map(([type, count]) => ({
        type: typeLabels[type] || type,
        count,
      }))
    : [];

  // Dados para gráfico pizza (Denúncias por Prioridade)
  const complaintsByPriority = stats?.byPriority
    ? Object.entries(stats.byPriority).map(([priority, value]) => ({
        name: priorityLabels[priority] || priority,
        value,
        color: priorityColors[priority] || '#64748b',
      }))
    : [];

  const metricCards = [
    {
      title: 'Total de Denúncias',
      value: stats?.total || 0,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Pendentes',
      value: stats?.byStatus?.pending || 0,
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-100',
    },
    {
      title: 'Em Investigação',
      value: stats?.byStatus?.inProgress || 0,
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-100',
    },
    {
      title: 'Resolvidas',
      value: stats?.byStatus?.resolved || 0,
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-100',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      UNDER_INVESTIGATION: 'bg-blue-100 text-blue-800 border-blue-200',
      'Em Investigação': 'bg-blue-100 text-blue-800 border-blue-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      Resolvida: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-slate-100 text-slate-800 border-slate-200',
      Encerrada: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      Crítica: 'bg-red-100 text-red-800 border-red-200',
      URGENT: 'bg-red-100 text-red-800 border-red-200',
      Urgente: 'bg-red-100 text-red-800 border-red-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      Alta: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Média: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
      Baixa: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Carregando estatísticas...</p>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Erro ao carregar dashboard</h3>
              <p className="text-sm">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm font-semibold text-red-700 hover:text-red-900"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Visão geral do sistema de denúncias</p>
        </div>

        {/* Search Section */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Buscar Denúncia</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por protocolo, título, descrição ou tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchError && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">{searchError}</span>
              </div>
            </div>
          )}

          {searchResults && searchResults.pagination && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Resultados da Busca ({searchResults.pagination?.total || 0})
                </h3>
                {(searchResults.pagination?.total || 0) > 0 && (
                  <span className="text-sm text-slate-600">
                    Página {searchResults.pagination?.page || 1} de{' '}
                    {searchResults.pagination?.totalPages || 1}
                  </span>
                )}
              </div>

              {!searchResults.data || searchResults.data.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">Nenhuma denúncia encontrada</p>
                  <p className="text-sm">Tente usar outros termos de busca</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Protocolo
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Título
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Prioridade
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Data
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {searchResults.data?.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-semibold text-primary-600">
                              {complaint.protocol}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-900">{complaint.title}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">
                              {typeLabels[complaint.type] || complaint.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(complaint.status)}`}
                            >
                              {complaint.status === 'PENDING' && 'Pendente'}
                              {complaint.status === 'UNDER_INVESTIGATION' && 'Em Investigação'}
                              {complaint.status === 'RESOLVED' && 'Resolvida'}
                              {complaint.status === 'CLOSED' && 'Encerrada'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(priorityLabels[complaint.priority])}`}
                            >
                              {priorityLabels[complaint.priority] || complaint.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">
                              {new Date(complaint.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/denuncias/${complaint.id}`)}
                              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.title} className="card group hover:scale-105 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.bgGradient} flex items-center justify-center`}
                  >
                    <Icon
                      className={`w-6 h-6 bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}
                    />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</div>
                <div className="text-sm text-slate-600">{metric.title}</div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="card lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Denúncias por Tipo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complaintsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={themeColors.primary} />
                    <stop offset="100%" stopColor={themeColors.secondary} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Por Prioridade</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complaintsByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complaintsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Card */}
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sistema de Denúncias Ativo</h3>
              <p className="text-slate-700">Dados atualizados em tempo real do banco de dados</p>
            </div>
            <button onClick={refetch} className="btn-secondary flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
