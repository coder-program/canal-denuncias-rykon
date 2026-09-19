'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Shield,
  FileText,
  Building2,
  Users,
  Calendar,
  Paperclip,
  AlertCircle,
  Send,
  X,
} from 'lucide-react';
import { complaintsService, CreateComplaintRequest } from '@/lib/services/complaintsService';
import Header from '@/components/layout/Header';

interface FormData {
  title: string;
  description: string;
  type: string;
  department: string;
  involvedPeople: string;
  incidentDate: string;
  location: string;
  isAnonymous: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  accusedPerson: string; // Nome do delato/acusado
}

const CATEGORIES = [
  { value: 'HARASSMENT', label: 'Assédio Moral ou Sexual' },
  { value: 'DISCRIMINATION', label: 'Discriminação' },
  { value: 'FRAUD', label: 'Fraude Financeira' },
  { value: 'CORRUPTION', label: 'Corrupção' },
  { value: 'SAFETY', label: 'Segurança do Trabalho' },
  { value: 'ETHICS', label: 'Questões Éticas' },
  { value: 'OTHER', label: 'Outros' },
];

const DEPARTMENTS = [
  'Recursos Humanos',
  'Financeiro',
  'Tecnologia',
  'Vendas',
  'Marketing',
  'Operações',
  'Jurídico',
  'Compliance',
  'Outros',
];

const PRIORITIES = [
  { value: 'LOW', label: 'Baixa', color: 'text-green-600 bg-green-50' },
  { value: 'MEDIUM', label: 'Média', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'HIGH', label: 'Alta', color: 'text-orange-600 bg-orange-50' },
  { value: 'CRITICAL', label: 'Crítica', color: 'text-red-600 bg-red-50' },
];

export default function NovaDenunciaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: '',
    department: '',
    involvedPeople: '',
    incidentDate: '',
    location: '',
    isAnonymous: false,
    priority: 'MEDIUM',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    accusedPerson: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.title.trim()) {
      toast.error('Por favor, informe o título da denúncia');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Por favor, descreva os fatos ocorridos');
      return;
    }

    if (!formData.type) {
      toast.error('Por favor, selecione uma categoria');
      return;
    }

    if (!formData.accusedPerson.trim()) {
      toast.error('Por favor, informe o nome do delato/acusado');
      return;
    }

    // Validar informações do denunciante se não for anônimo
    if (!formData.isAnonymous && formData.reporterEmail && !formData.reporterEmail.includes('@')) {
      toast.error('Por favor, informe um e-mail válido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para envio
      const complaintData: CreateComplaintRequest = {
        isAnonymous: formData.isAnonymous,
        type: formData.type as CreateComplaintRequest['type'],
        priority: formData.priority,
        title: formData.title,
        description: formData.description,
        department: formData.department || undefined,
        location: formData.location || undefined,
        incidentDate: formData.incidentDate
          ? new Date(formData.incidentDate).toISOString()
          : undefined,
        involvedPeople: formData.accusedPerson ? [formData.accusedPerson.trim()] : undefined,
        witnesses: formData.involvedPeople
          ? formData.involvedPeople
              .split('\n')
              .filter((p) => p.trim())
              .map((p) => p.trim())
          : undefined,
        metadata: {
          ...(formData.reporterName && { reporterName: formData.reporterName }),
        },
        reporterEmail: formData.reporterEmail || undefined,
        reporterPhone: formData.reporterPhone || undefined,
      };

      // Criar denúncia
      const complaint = await complaintsService.create(complaintData);
      console.log('Denúncia criada:', complaint);
      console.log('Protocol:', complaint.protocol);
      console.log('ID:', complaint.id);

      // Upload de anexos (se houver)
      if (attachments.length > 0) {
        try {
          await complaintsService.uploadAttachments(complaint.id, attachments);
          toast.success(`${attachments.length} arquivo(s) anexado(s) com sucesso`);
        } catch (uploadError) {
          console.error('Erro ao fazer upload dos anexos:', uploadError);
          toast.warning('Denúncia criada, mas houve erro ao anexar alguns arquivos');
        }
      }

      // Mostrar mensagem de sucesso
      toast.success('Denúncia registrada com sucesso!');

      // Redirecionar para página de confirmação com protocolo
      const protocolValue = complaint.protocol || complaint.id;
      const redirectUrl = `/denuncia-confirmada?protocol=${protocolValue}`;
      console.log('Redirecionando para:', redirectUrl);

      // Usar window.location para garantir compatibilidade com todos navegadores
      await new Promise((resolve) => setTimeout(resolve, 800));
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error('Erro ao criar denúncia:', error);
      const errorMessage =
        error.response?.data?.message || 'Erro ao registrar denúncia. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header showAdminButton={false} />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Nova Denúncia</h1>
              <p className="text-slate-600">Registre sua denúncia de forma segura e confidencial</p>
            </div>
          </div>
        </div>

        {/* Alert de Anonimato */}
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Sua identidade está protegida</h3>
              <p className="text-sm text-blue-700">
                Você pode escolher se deseja se identificar ou permanecer anônimo. Todas as
                denúncias são tratadas com máxima confidencialidade e investigadas com seriedade.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-6">
            {/* Anonimato */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isAnonymous" className="font-medium text-slate-700 cursor-pointer">
                Desejo fazer uma denúncia anônima
              </label>
            </div>

            {/* Informações do Denunciante (se não anônimo) */}
            {!formData.isAnonymous && (
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Suas Informações (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="reporterName"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      id="reporterName"
                      name="reporterName"
                      value={formData.reporterName}
                      onChange={handleInputChange}
                      placeholder="Nome completo"
                      className="input-field bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reporterEmail"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Seu E-mail
                    </label>
                    <input
                      type="email"
                      id="reporterEmail"
                      name="reporterEmail"
                      value={formData.reporterEmail}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="input-field bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reporterPhone"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Seu Telefone
                    </label>
                    <input
                      type="tel"
                      id="reporterPhone"
                      name="reporterPhone"
                      value={formData.reporterPhone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                      className="input-field bg-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  💡 Estas informações ajudam na investigação e permitem que entremos em contato se
                  necessário.
                </p>
              </div>
            )}

            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                Título da Denúncia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Assédio moral no departamento de vendas"
                className="input-field"
                required
              />
            </div>

            {/* Categoria e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Selecione...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Prioridade
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {PRIORITIES.map((pri) => (
                    <option key={pri.value} value={pri.value}>
                      {pri.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Departamento */}
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                <Building2 className="w-4 h-4 inline mr-1" />
                Departamento Envolvido
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Selecione...</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Descrição dos Fatos <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva detalhadamente o ocorrido, incluindo datas, locais e pessoas envolvidas..."
                rows={6}
                className="input-field resize-none"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Seja o mais específico possível. Quanto mais detalhes, melhor será a investigação.
              </p>
            </div>

            {/* Nome do Delato/Acusado */}
            <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50">
              <label
                htmlFor="accusedPerson"
                className="block text-sm font-semibold text-slate-800 mb-2"
              >
                <AlertCircle className="w-5 h-5 inline mr-1 text-red-600" />
                Nome do Delato/Acusado (Pessoa denunciada) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="accusedPerson"
                name="accusedPerson"
                value={formData.accusedPerson}
                onChange={handleInputChange}
                placeholder="Ex: João Silva - Gerente de Vendas"
                className="input-field bg-white"
                required
              />
              <p className="text-xs text-slate-600 mt-2">
                💡 Informe o nome completo e cargo da pessoa acusada. Se não souber o nome, descreva
                características que ajudem a identificá-la.
              </p>
            </div>

            {/* Pessoas Envolvidas (Testemunhas) */}
            <div>
              <label
                htmlFor="involvedPeople"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                <Users className="w-4 h-4 inline mr-1" />
                Testemunhas ou Outras Pessoas Envolvidas
              </label>
              <textarea
                id="involvedPeople"
                name="involvedPeople"
                value={formData.involvedPeople}
                onChange={handleInputChange}
                placeholder="Liste testemunhas ou outras pessoas que presenciaram os fatos (uma por linha)..."
                rows={3}
                className="input-field resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                Opcional: Nomes de testemunhas que possam confirmar os fatos relatados.
              </p>
            </div>

            {/* Data e Local */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="incidentDate"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data do Ocorrido
                </label>
                <input
                  type="date"
                  id="incidentDate"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Local do Ocorrido
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: Escritório central, Sala de reuniões..."
                  className="input-field"
                />
              </div>
            </div>

            {/* Anexos - PROVAS */}
            <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
              <label className="block text-lg font-semibold text-slate-800 mb-3">
                <Paperclip className="w-5 h-5 inline mr-2 text-green-600" />
                📎 Anexar Provas/Evidências
              </label>

              <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-slate-700 font-medium mb-2">
                  ✅ Tipos de provas aceitas:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 ml-4">
                  <li>
                    • <strong>E-mails</strong> - Conversas, mensagens ofensivas
                  </li>
                  <li>
                    • <strong>Screenshots</strong> - Capturas de tela de WhatsApp, Teams, Slack
                  </li>
                  <li>
                    • <strong>Documentos</strong> - Contratos, relatórios, planilhas
                  </li>
                  <li>
                    • <strong>Fotos/Vídeos</strong> - Registros visuais do ocorrido
                  </li>
                  <li>
                    • <strong>Áudios</strong> - Gravações de conversas (se legal)
                  </li>
                  <li>
                    • <strong>PDFs</strong> - Notas fiscais, recibos, comprovantes
                  </li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-white transition-all cursor-pointer bg-white">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls,.mp3,.mp4,.wav"
                />
                <label
                  htmlFor="attachments"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Paperclip className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <span className="text-base font-semibold text-slate-700 block">
                      Clique aqui para adicionar arquivos
                    </span>
                    <span className="text-sm text-slate-500 mt-1 block">
                      ou arraste e solte seus arquivos
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    <span className="px-3 py-1 bg-slate-100 text-xs rounded-full text-slate-600">
                      PDF
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-xs rounded-full text-slate-600">
                      Word
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-xs rounded-full text-slate-600">
                      Excel
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-xs rounded-full text-slate-600">
                      Imagens
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-xs rounded-full text-slate-600">
                      Áudio/Vídeo
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-2">
                    Máximo 10MB por arquivo • Múltiplos arquivos permitidos
                  </span>
                </label>
              </div>

              {/* Lista de anexos */}
              {attachments.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                      📎 Arquivos Anexados ({attachments.length})
                    </h4>
                    <span className="text-xs text-slate-500">
                      {(
                        attachments.reduce((acc, file) => acc + file.size, 0) /
                        1024 /
                        1024
                      ).toFixed(2)}{' '}
                      MB total
                    </span>
                  </div>
                  <div className="space-y-2">
                    {attachments.map((file, index) => {
                      const fileExtension = file.name.split('.').pop()?.toLowerCase();
                      const getFileIcon = () => {
                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || ''))
                          return '🖼️';
                        if (['pdf'].includes(fileExtension || '')) return '📄';
                        if (['doc', 'docx'].includes(fileExtension || '')) return '📝';
                        if (['xls', 'xlsx'].includes(fileExtension || '')) return '📊';
                        if (['mp3', 'wav'].includes(fileExtension || '')) return '🎵';
                        if (['mp4', 'avi'].includes(fileExtension || '')) return '🎬';
                        return '📎';
                      };

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{getFileIcon()}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">
                                {file.name}
                              </p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-slate-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <span className="text-xs text-green-600 font-medium">
                                  ✓ Pronto para envio
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-3 p-2 hover:bg-red-100 rounded-lg transition-colors group"
                            title="Remover arquivo"
                          >
                            <X className="w-5 h-5 text-slate-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Denúncia
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Informações de Segurança */}
        <div className="mt-6 card bg-slate-50">
          <h3 className="font-semibold text-slate-800 mb-3">🔒 Garantias de Segurança</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Todas as denúncias são criptografadas e armazenadas com segurança</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Apenas a equipe de compliance tem acesso às investigações</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Você receberá atualizações sobre o andamento da investigação</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Política de não retaliação contra denunciantes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
