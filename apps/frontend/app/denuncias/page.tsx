'use client';

import { useState, useEffect } from 'react';
import PrivateLayout from '@/components/layouts/PrivateLayout';
import {
  Search,
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  protocol: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  isAnonymous: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadComplaints();
  }, [pagination.page, statusFilter, typeFilter, priorityFilter]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get('/complaints', { params });

      setComplaints(response.data.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error('Erro ao carregar denúncias:', error);
      toast.error('Erro ao carregar denúncias');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadComplaints();
  };

  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em Investigação',
      UNDER_REVIEW: 'Em Análise',
      RESOLVED: 'Resolvida',
      DISMISSED: 'Arquivada',
      ESCALATED: 'Escalada',
    };
    return translations[status] || status;
  };

  const translateType = (type: string) => {
    const translations: Record<string, string> = {
      HARASSMENT: 'Assédio',
      DISCRIMINATION: 'Discriminação',
      FRAUD: 'Fraude',
      CORRUPTION: 'Corrupção',
      SAFETY: 'Segurança',
      ETHICS: 'Ética',
      OTHER: 'Outros',
    };
    return translations[type] || type;
  };

  const translatePriority = (priority: string) => {
    const translations: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    };
    return translations[priority] || priority;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      UNDER_REVIEW: 'bg-purple-100 text-purple-800 border-purple-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      DISMISSED: 'bg-gray-100 text-gray-800 border-gray-200',
      ESCALATED: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Denúncias</h1>
            <p className="text-slate-600">
              Gestão de todas as denúncias do sistema
              {pagination.total > 0 && ` (${pagination.total} total)`}
            </p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por protocolo, título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Search Button */}
            <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar
            </button>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {(statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all') && (
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="IN_PROGRESS">Em Investigação</option>
                  <option value="UNDER_REVIEW">Em Análise</option>
                  <option value="RESOLVED">Resolvida</option>
                  <option value="DISMISSED">Arquivada</option>
                  <option value="ESCALATED">Escalada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none"
                >
                  <option value="all">Todas</option>
                  <option value="CRITICAL">Crítica</option>
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Média</option>
                  <option value="LOW">Baixa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="HARASSMENT">Assédio</option>
                  <option value="DISCRIMINATION">Discriminação</option>
                  <option value="FRAUD">Fraude</option>
                  <option value="CORRUPTION">Corrupção</option>
                  <option value="SAFETY">Segurança</option>
                  <option value="ETHICS">Ética</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-semibold">Nenhuma denúncia encontrada</p>
              <p className="text-sm">Tente ajustar os filtros ou buscar por outros termos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary-50 to-secondary-50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Protocolo
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Título
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Tipo
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Prioridade
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Data
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-secondary-50/50 transition-all group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-primary-600">
                              {complaint.protocol}
                            </span>
                            {complaint.isAnonymous && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-semibold">
                                Anônima
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-xs truncate text-sm font-medium text-slate-900">
                            {complaint.title}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-700">
                          {translateType(complaint.type)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(complaint.priority)}`}
                          >
                            {translatePriority(complaint.priority)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(complaint.status)}`}
                          >
                            {translateStatus(complaint.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {formatDate(complaint.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link href={`/denuncias/${complaint.id}`}>
                              <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                            </Link>
                            <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Mostrando{' '}
                    <span className="font-semibold text-slate-900">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-semibold text-slate-900">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de <span className="font-semibold text-slate-900">{pagination.total}</span>{' '}
                    resultados
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Mostrar apenas páginas próximas da atual
                      if (
                        pageNumber === 1 ||
                        pageNumber === pagination.totalPages ||
                        (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setPagination((prev) => ({ ...prev, page: pageNumber }))}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                              pageNumber === pagination.page
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                                : 'border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === pagination.page - 2 ||
                        pageNumber === pagination.page + 2
                      ) {
                        return (
                          <span key={pageNumber} className="px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
}
