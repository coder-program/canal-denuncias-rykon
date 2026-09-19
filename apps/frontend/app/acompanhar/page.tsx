'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Home,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Check,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { complaintsService } from '@/lib/services';

interface ComplaintStatus {
  id: string;
  protocol: string;
  status:
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'UNDER_REVIEW'
    | 'IN_ANALYSIS'
    | 'IN_INVESTIGATION'
    | 'RESOLVED'
    | 'CLOSED';
  type: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  PENDING: {
    label: 'Pendente',
    color: 'yellow',
    icon: Clock,
    description: 'Sua denúncia foi recebida e está aguardando análise inicial.',
    bgClass: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200',
    iconBgClass: 'bg-yellow-500',
  },
  IN_PROGRESS: {
    label: 'Em Investigação',
    color: 'purple',
    icon: AlertCircle,
    description: 'Investigação em andamento com coleta de evidências.',
    bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200',
    iconBgClass: 'bg-purple-500',
  },
  UNDER_REVIEW: {
    label: 'Em Análise',
    color: 'blue',
    icon: FileText,
    description: 'Análise detalhada sendo realizada pela equipe responsável.',
    bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200',
    iconBgClass: 'bg-blue-500',
  },
  IN_ANALYSIS: {
    label: 'Em Análise',
    color: 'blue',
    icon: FileText,
    description: 'Equipe está analisando as informações fornecidas.',
    bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200',
    iconBgClass: 'bg-blue-500',
  },
  IN_INVESTIGATION: {
    label: 'Em Investigação',
    color: 'purple',
    icon: AlertCircle,
    description: 'Investigação em andamento com coleta de evidências.',
    bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200',
    iconBgClass: 'bg-purple-500',
  },
  RESOLVED: {
    label: 'Resolvida',
    color: 'green',
    icon: CheckCircle,
    description: 'Denúncia foi analisada e as medidas necessárias foram tomadas.',
    bgClass: 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200',
    iconBgClass: 'bg-green-500',
  },
  DISMISSED: {
    label: 'Arquivada',
    color: 'gray',
    icon: XCircle,
    description: 'Denúncia foi arquivada após análise.',
    bgClass: 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200',
    iconBgClass: 'bg-gray-500',
  },
  CLOSED: {
    label: 'Encerrada',
    color: 'gray',
    icon: XCircle,
    description: 'Processo encerrado após resolução ou análise conclusiva.',
    bgClass: 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200',
    iconBgClass: 'bg-gray-500',
  },
};

export default function AcompanharDenuncia() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [protocol, setProtocol] = useState(searchParams?.get('protocol') || '');
  const [complaint, setComplaint] = useState<ComplaintStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleSearch = async (searchProtocol?: string) => {
    const protocolToSearch = searchProtocol || protocol;

    if (!protocolToSearch.trim()) {
      setError('Por favor, digite o número do protocolo.');
      return;
    }

    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      console.log('[Acompanhar] Buscando protocolo:', protocolToSearch);
      // Buscar denúncia por protocolo na API
      const data = await complaintsService.getByProtocol(protocolToSearch);
      console.log('[Acompanhar] Denúncia encontrada:', data);
      console.log('[Acompanhar] Status retornado:', data.status);

      // Mapear os dados da API para o formato esperado
      const mappedComplaint: ComplaintStatus = {
        id: data.id,
        protocol: data.protocol,
        status: data.status as ComplaintStatus['status'],
        type: data.type,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      console.log('[Acompanhar] Complaint mapeado:', mappedComplaint);
      console.log('[Acompanhar] Status config existe?', statusConfig[mappedComplaint.status]);
      setComplaint(mappedComplaint);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('[Acompanhar] Erro ao buscar denúncia:', err);

      if (err.response?.status === 404) {
        setError('Protocolo não encontrado. Verifique se digitou corretamente.');
      } else {
        setError('Erro ao buscar denúncia. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const protocolParam = searchParams?.get('protocol');
    console.log('[Acompanhar] useEffect - Protocol param:', protocolParam);
    if (protocolParam && protocolParam.trim()) {
      setProtocol(protocolParam);
      handleSearch(protocolParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const status = complaint ? statusConfig[complaint.status] : null;
  const StatusIcon = status?.icon;

  console.log('[Acompanhar] Render - complaint:', complaint);
  console.log('[Acompanhar] Render - status:', status);
  console.log('[Acompanhar] Render - StatusIcon:', StatusIcon);

  return (
    <div className="min-h-screen gradient-bg">
      {/* HEADER */}
      <Header showAdminButton={false} />

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* FORMULÁRIO DE BUSCA */}
        <div className="card mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Consultar Protocolo</h2>
              <p className="text-slate-600">Digite o número do protocolo para verificar o status</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Número do Protocolo
              </label>
              <input
                type="text"
                placeholder="Ex: DEN-2025-001234"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Consultar Status</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTADO DA BUSCA */}
        {complaint && status && StatusIcon && (
          <div className="space-y-6">
            {/* STATUS ATUAL */}
            <div className={`card ${status.bgClass}`}>
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-xl ${status.iconBgClass} flex items-center justify-center shadow-lg`}
                >
                  <StatusIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">Status Atual</p>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{status.label}</h3>
                  <p className="text-slate-700">{status.description}</p>
                </div>
              </div>

              {/* Botão de Atualizar e Última Atualização */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-600">
                  {lastUpdate && (
                    <span>
                      Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')} -{' '}
                      {lastUpdate.toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSearch(complaint.protocol)}
                  disabled={loading}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Atualizando...' : 'Atualizar Status'}
                </button>
              </div>
            </div>

            {/* INFORMAÇÕES DA DENÚNCIA */}
            <div className="card">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Informações da Denúncia</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Protocolo</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {complaint.protocol}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Tipo</span>
                  <span className="font-semibold text-slate-900">{complaint.type}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Data de Abertura</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(complaint.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600">Última Atualização</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(complaint.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* LINHA DO TEMPO */}
            <div className="card">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Linha do Tempo do Processo</h3>

              <div className="relative space-y-6">
                {/* Linha vertical conectora */}
                <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-slate-200" />

                {/* Timeline Steps */}
                {[
                  {
                    key: 'PENDING',
                    label: 'Pendente',
                    icon: Clock,
                    description: 'Denúncia recebida e aguardando análise',
                    stage: 0,
                  },
                  {
                    key: 'IN_INVESTIGATION',
                    label: 'Em Investigação',
                    icon: AlertCircle,
                    description: 'Investigação em andamento',
                    stage: 1,
                  },
                  {
                    key: 'UNDER_REVIEW',
                    label: 'Em Análise',
                    icon: FileText,
                    description: 'Análise detalhada sendo realizada',
                    stage: 2,
                  },
                  {
                    key: 'RESOLVED',
                    label: 'Resolvida',
                    icon: CheckCircle,
                    description: 'Denúncia resolvida com ações tomadas',
                    stage: 3,
                  },
                  {
                    key: 'DISMISSED',
                    label: 'Arquivada',
                    icon: XCircle,
                    description: 'Denúncia arquivada',
                    stage: 4,
                  },
                  {
                    key: 'CLOSED',
                    label: 'Encerrada',
                    icon: XCircle,
                    description: 'Processo finalizado',
                    stage: 5,
                  },
                ].map((step, index) => {
                  const Icon = step.icon;

                  // Mapear todos os status possíveis para os estágios da timeline
                  const statusToStage: { [key: string]: number } = {
                    PENDING: 0,
                    IN_PROGRESS: 1,
                    IN_INVESTIGATION: 1,
                    UNDER_REVIEW: 2,
                    IN_ANALYSIS: 2,
                    RESOLVED: 3,
                    DISMISSED: 4,
                    CLOSED: 5,
                  };

                  const currentStage = statusToStage[complaint.status] ?? 0;
                  const stepStage = step.stage;

                  const isCurrent = currentStage === stepStage;
                  const isCompleted = stepStage < currentStage;
                  const isPending = stepStage > currentStage;

                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      {/* Ponto da timeline */}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-primary-500 ring-4 ring-primary-200 scale-110'
                            : isCompleted
                              ? 'bg-green-500 ring-2 ring-green-200'
                              : 'bg-slate-200'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isCurrent || isCompleted ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-bold text-lg ${
                              isCurrent
                                ? 'text-primary-600'
                                : isCompleted
                                  ? 'text-green-600'
                                  : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                              Status Atual
                            </span>
                          )}
                          {isCompleted && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                        <p
                          className={`text-sm ${
                            isCurrent
                              ? 'text-slate-700 font-medium'
                              : isCompleted
                                ? 'text-slate-600'
                                : 'text-slate-400'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INFORMAÇÕES IMPORTANTES */}
            <div className="card bg-blue-50 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Informações Importantes</h4>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li>• Guarde seu número de protocolo para futuras consultas</li>
                    <li>• O prazo médio de análise é de 15 a 30 dias úteis</li>
                    <li>• Você será notificado sobre atualizações importantes</li>
                    <li>• Em caso de dúvidas, entre em contato: compliance@empresa.com</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AÇÕES */}
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Início
                </button>
              </Link>
              <button
                onClick={() => window.print()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Imprimir Comprovante
              </button>
            </div>
          </div>
        )}

        {/* AVISO INICIAL */}
        {!complaint && !loading && (
          <div className="card text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Digite o Protocolo</h3>
            <p className="text-slate-600">
              Informe o número do protocolo no campo acima para consultar o status da denúncia.
            </p>
          </div>
        )}
      </div>

      {/* CSS PARA IMPRESSÃO */}
      <style jsx global>{`
        @media print {
          nav,
          button {
            display: none !important;
          }
          .card {
            break-inside: avoid;
            box-shadow: none;
            border: 1px solid #e2e8f0;
          }
        }
      `}</style>
    </div>
  );
}
