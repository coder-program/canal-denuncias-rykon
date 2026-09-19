'use client';

import { useState, useEffect, useRef } from 'react';
import { use } from 'react';
import PrivateLayout from '@/components/layouts/PrivateLayout';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  Download,
  Send,
  Eye,
  X,
  Check,
  Loader2,
  AlertCircle,
  Paperclip,
  Upload,
  File,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  protocol: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  investigatorId?: string;
  investigator?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  author: {
    id: string;
    fullName: string;
    email: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploaderUser: {
    id: string;
    fullName: string;
  };
}

interface Investigator {
  id: string;
  fullName: string;
  email: string;
}

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [selectedInvestigatorId, setSelectedInvestigatorId] = useState('');
  const [assigningInvestigator, setAssigningInvestigator] = useState(false);

  useEffect(() => {
    loadComplaint();
    loadInvestigators();
    loadComments();
    loadAttachments();
  }, [resolvedParams.id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/complaints/${resolvedParams.id}`);
      setComplaint(response.data);
      if (response.data.investigatorId) {
        setSelectedInvestigatorId(response.data.investigatorId);
      }
    } catch (error: any) {
      console.error('Erro ao carregar denúncia:', error);
      toast.error('Erro ao carregar denúncia');
    } finally {
      setLoading(false);
    }
  };

  const loadInvestigators = async () => {
    try {
      const response = await apiClient.get('/users?role=INVESTIGATOR');
      setInvestigators(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar investigadores:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response = await apiClient.get(`/complaints/${resolvedParams.id}/comments`);
      setComments(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadAttachments = async () => {
    try {
      setLoadingAttachments(true);
      const response = await apiClient.get(`/attachments/complaint/${resolvedParams.id}`);
      setAttachments(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar anexos:', error);
      toast.error('Erro ao carregar anexos');
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho máximo (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB em bytes
      if (file.size > maxSize) {
        toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    // Verificar autenticação
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      toast.error('Você precisa estar autenticado para enviar arquivos');
      return;
    }

    try {
      const { state } = JSON.parse(authStorage);
      if (!state?.token) {
        toast.error('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }
    } catch (e) {
      toast.error('Erro ao verificar autenticação');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('[Upload] Enviando arquivo:', selectedFile.name, selectedFile.size, 'bytes');

      // Não definir Content-Type manualmente - deixar o axios detectar automaticamente
      await apiClient.post(`/attachments/complaint/${resolvedParams.id}`, formData);

      toast.success('Arquivo enviado com sucesso!');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadAttachments(); // Recarrega lista de anexos
    } catch (error: any) {
      console.error('Erro ao enviar arquivo:', error);
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || 'Erro ao enviar arquivo';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    try {
      const response = await apiClient.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });

      // Criar URL do blob e forçar download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download iniciado');
    } catch (error: any) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este anexo?')) {
      return;
    }

    try {
      await apiClient.delete(`/attachments/${attachmentId}`);
      toast.success('Anexo excluído com sucesso');
      loadAttachments(); // Recarrega lista
    } catch (error: any) {
      console.error('Erro ao excluir anexo:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir anexo');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    if (comment.trim().length < 5) {
      toast.error('Comentário deve ter no mínimo 5 caracteres');
      return;
    }

    try {
      setSendingComment(true);
      await apiClient.post(`/complaints/${resolvedParams.id}/comments`, {
        content: comment.trim(),
      });
      toast.success('Comentário adicionado com sucesso!');
      setComment('');
      loadComments();
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar comentário');
    } finally {
      setSendingComment(false);
    }
  };

  const assignInvestigator = async () => {
    if (!selectedInvestigatorId) {
      toast.error('Selecione um investigador');
      return;
    }

    try {
      setAssigningInvestigator(true);
      await apiClient.patch(`/complaints/${resolvedParams.id}/assign/${selectedInvestigatorId}`);
      toast.success('Investigador atribuído com sucesso!');
      loadComplaint();
    } catch (error: any) {
      console.error('Erro ao atribuir investigador:', error);
      toast.error(error.response?.data?.message || 'Erro ao atribuir investigador');
    } finally {
      setAssigningInvestigator(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    if (!statusReason || statusReason.length < 10) {
      toast.error('Motivo deve ter no mínimo 10 caracteres');
      return;
    }

    try {
      setChangingStatus(true);
      await apiClient.patch(`/complaints/${resolvedParams.id}/status`, {
        status: selectedStatus,
        reason: statusReason,
      });
      toast.success('Status alterado com sucesso!');
      setShowStatusModal(false);
      setStatusReason('');
      loadComplaint();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error(error.response?.data?.message || 'Erro ao alterar status');
    } finally {
      setChangingStatus(false);
    }
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
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      red: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[color] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      </PrivateLayout>
    );
  }

  if (!complaint) {
    return (
      <PrivateLayout>
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <AlertCircle className="w-16 h-16 mb-4" />
          <p className="text-xl font-semibold">Denúncia não encontrada</p>
          <Link href="/denuncias" className="mt-4 btn-primary">
            Voltar para lista
          </Link>
        </div>
      </PrivateLayout>
    );
  }

  const infoCards = [
    {
      label: 'Tipo',
      value: translateType(complaint.type),
      icon: FileText,
      color: 'blue',
    },
    {
      label: 'Denunciante',
      value: complaint.isAnonymous ? 'Anônimo' : complaint.reporterName || 'Não informado',
      icon: User,
      color: 'purple',
    },
    {
      label: 'Investigador',
      value: complaint.investigator?.fullName || 'Não atribuído',
      icon: User,
      color: 'orange',
    },
    {
      label: 'Criado em',
      value: formatDate(complaint.createdAt),
      icon: Calendar,
      color: 'green',
    },
    {
      label: 'Atualizado em',
      value: formatDate(complaint.updatedAt),
      icon: Calendar,
      color: 'yellow',
    },
    {
      label: 'Prioridade',
      value: translatePriority(complaint.priority),
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/denuncias">
            <button className="p-2 rounded-lg border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{complaint.title}</h1>
              <span className="px-4 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                {translateStatus(complaint.status)}
              </span>
            </div>
            <p className="text-slate-600 font-mono text-sm">
              Protocolo:{' '}
              <span className="font-semibold text-primary-600">{complaint.protocol}</span>
            </p>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`card border-2 ${getColorClasses(card.color)}`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${getColorClasses(card.color)} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold opacity-75">{card.label}</div>
                    <div className="text-sm font-bold">{card.value}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Descrição da Denúncia</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Attachments */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Anexos
                </h2>
                {attachments.length > 0 && (
                  <span className="text-sm text-slate-500">{attachments.length} arquivo(s)</span>
                )}
              </div>

              {/* Upload Section */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={uploading}
                  >
                    <File className="w-4 h-4" />
                    {selectedFile ? 'Trocar Arquivo' : 'Escolher Arquivo'}
                  </button>

                  {selectedFile && (
                    <>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-slate-700">{selectedFile.name}</p>
                        <p className="text-slate-500">{formatFileSize(selectedFile.size)}</p>
                      </div>

                      <button
                        onClick={handleFileUpload}
                        disabled={uploading}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Enviar
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        disabled={uploading}
                        className="btn btn-secondary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Formatos aceitos: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT (máx. 10MB)
                </p>
              </div>

              {/* Attachments List */}
              {loadingAttachments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Paperclip className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-600 font-medium">Nenhum anexo</p>
                  <p className="text-slate-500 text-sm">
                    Envie documentos relevantes para esta denúncia
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-8 h-8 text-primary-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">
                            {attachment.filename}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{formatFileSize(attachment.size)}</span>
                            <span>•</span>
                            <span>{formatDate(attachment.uploadedAt)}</span>
                            <span>•</span>
                            <span>Por {attachment.uploaderUser.fullName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <button
                          onClick={() =>
                            handleDownloadAttachment(attachment.id, attachment.filename)
                          }
                          className="btn btn-secondary btn-sm flex items-center gap-2"
                          title="Baixar arquivo"
                        >
                          <Download className="w-4 h-4" />
                          Baixar
                        </button>
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          className="btn btn-danger btn-sm"
                          title="Excluir anexo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="card">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Comentários da Investigação</h2>

              {/* Comments List */}
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Send className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-600 font-medium">Nenhum comentário ainda</p>
                  <p className="text-slate-500 text-sm">Seja o primeiro a comentar</p>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{c.author.fullName}</p>
                          <p className="text-xs text-slate-500">{formatDate(c.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <div className="border-t pt-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Adicionar comentário sobre a investigação..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  rows={3}
                  disabled={sendingComment}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAddComment}
                    className="btn-primary"
                    disabled={sendingComment || !comment.trim()}
                  >
                    {sendingComment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 inline-block animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2 inline-block" />
                        Enviar Comentário
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Change */}
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">Alterar Status</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedStatus('PENDING');
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-3 bg-yellow-50 text-yellow-700 border-2 border-yellow-200 rounded-xl font-semibold hover:bg-yellow-100 transition-colors"
                >
                  Pendente
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('IN_PROGRESS');
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-3 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                >
                  Em Investigação
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('UNDER_REVIEW');
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-3 bg-purple-50 text-purple-700 border-2 border-purple-200 rounded-xl font-semibold hover:bg-purple-100 transition-colors"
                >
                  Em Análise
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('RESOLVED');
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-3 bg-green-50 text-green-700 border-2 border-green-200 rounded-xl font-semibold hover:bg-green-100 transition-colors"
                >
                  Resolvida
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('DISMISSED');
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Arquivada
                </button>
              </div>
            </div>

            {/* Assign Investigator */}
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">Atribuir Investigador</h3>
              <select
                value={selectedInvestigatorId}
                onChange={(e) => setSelectedInvestigatorId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none mb-3"
                disabled={assigningInvestigator}
              >
                <option value="">Selecione um investigador</option>
                {investigators.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.fullName}
                  </option>
                ))}
              </select>
              <button
                onClick={assignInvestigator}
                className="btn-primary w-full"
                disabled={assigningInvestigator || !selectedInvestigatorId}
              >
                {assigningInvestigator ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline-block animate-spin" />
                    Atribuindo...
                  </>
                ) : (
                  'Atribuir'
                )}
              </button>
            </div>

            {/* Contact Reporter */}
            {!complaint.isAnonymous && complaint.reporterEmail && (
              <div className="card bg-blue-50 border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">Contato do Denunciante</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-800">
                    <strong>E-mail:</strong> {complaint.reporterEmail}
                  </p>
                  {complaint.reporterPhone && (
                    <p className="text-blue-800">
                      <strong>Telefone:</strong> {complaint.reporterPhone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Confirmar Alteração</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusReason('');
                }}
                className="text-slate-400 hover:text-slate-600"
                disabled={changingStatus}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-slate-600 mb-4">
              Deseja alterar o status da denúncia para{' '}
              <strong>{translateStatus(selectedStatus)}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Motivo da alteração (mínimo 10 caracteres)
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Descreva o motivo da mudança de status..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                rows={3}
                disabled={changingStatus}
              />
              {statusReason && statusReason.length < 10 && (
                <p className="text-xs text-red-600 mt-1">
                  {10 - statusReason.length} caracteres restantes
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusReason('');
                }}
                className="flex-1 btn-secondary"
                disabled={changingStatus}
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusChange}
                className="flex-1 btn-primary"
                disabled={changingStatus || !statusReason || statusReason.length < 10}
              >
                {changingStatus ? (
                  <Loader2 className="w-5 h-5 mr-2 inline-block animate-spin" />
                ) : (
                  <Check className="w-5 h-5 mr-2 inline-block" />
                )}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </PrivateLayout>
  );
}
