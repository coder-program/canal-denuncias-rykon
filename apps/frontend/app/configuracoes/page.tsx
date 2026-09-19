'use client';

import { useState, useEffect } from 'react';
import PrivateLayout from '@/components/layouts/PrivateLayout';
import {
  Settings as SettingsIcon,
  Palette,
  FileText,
  Zap,
  Upload,
  Save,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface SettingsData {
  companyName?: string;
  companyLogo?: string;
  footerLogo?: string;
  companyPhone?: string;
  companyEmail?: string;
  primaryColor?: string;
  secondaryColor?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  docCodigoEtica?: string;
  docPoliticaFornecedores?: string;
  docPoliticaAnticorrupcao?: string;
  docPoliticaLicitacoes?: string;
  docPoliticaPldFtp?: string;
  docPoliticaAssedio?: string;
  allowAnonymousComplaints?: boolean;
  maintenanceMode?: boolean;
  emailNotifications?: boolean;
  systemAlerts?: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'legal' | 'advanced'>(
    'general',
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    companyName: '',
    companyLogo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#f97316',
    privacyPolicy: '',
    termsOfService: '',
    allowAnonymousComplaints: true,
    maintenanceMode: false,
    emailNotifications: true,
    systemAlerts: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings');

      // Filtrar apenas campos válidos que existem no DTO
      const validData: Partial<SettingsData> = {};
      const validFields: (keyof SettingsData)[] = [
        'companyName',
        'companyLogo',
        'footerLogo',
        'companyPhone',
        'companyEmail',
        'primaryColor',
        'secondaryColor',
        'privacyPolicy',
        'termsOfService',
        'docCodigoEtica',
        'docPoliticaFornecedores',
        'docPoliticaAnticorrupcao',
        'docPoliticaLicitacoes',
        'docPoliticaPldFtp',
        'docPoliticaAssedio',
        'allowAnonymousComplaints',
        'maintenanceMode',
        'emailNotifications',
        'systemAlerts',
      ];

      validFields.forEach((field) => {
        if (response.data[field] !== undefined) {
          validData[field] = response.data[field];
        }
      });

      setSettings((prev) => ({ ...prev, ...validData }));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Lista de campos válidos no DTO do backend
      const validFields = [
        'companyName',
        'companyLogo',
        'footerLogo',
        'companyPhone',
        'companyEmail',
        'primaryColor',
        'secondaryColor',
        'privacyPolicy',
        'termsOfService',
        'docCodigoEtica',
        'docPoliticaFornecedores',
        'docPoliticaAnticorrupcao',
        'docPoliticaLicitacoes',
        'docPoliticaPldFtp',
        'docPoliticaAssedio',
        'allowAnonymousComplaints',
        'maintenanceMode',
        'emailNotifications',
        'systemAlerts',
      ];

      // Filtrar apenas campos válidos e não vazios
      const dataToSend: Record<string, any> = {};
      Object.entries(settings).forEach(([key, value]) => {
        if (validFields.includes(key) && value !== undefined && value !== null && value !== '') {
          dataToSend[key] = value;
        }
      });

      console.log('📤 Dados que serão enviados:', dataToSend);
      console.log('📤 Chaves:', Object.keys(dataToSend));

      await apiClient.patch('/settings', dataToSend);
      toast.success('Configurações salvas com sucesso!');

      // Disparar evento para atualizar o tema globalmente
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('theme-updated'));
      }
    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Resposta do servidor:', error.response?.data);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, companyLogo: reader.result as string });
        toast.success('Logo carregado com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, footerLogo: reader.result as string });
        toast.success('Logo do rodapé carregado com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (
    field: keyof SettingsData,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (file.type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são permitidos!');
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande! Máximo 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
        toast.success(`Documento "${file.name}" carregado com sucesso!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key: keyof SettingsData, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const tabs = [
    { id: 'general' as const, label: 'Geral', icon: SettingsIcon },
    { id: 'appearance' as const, label: 'Aparência', icon: Palette },
    { id: 'legal' as const, label: 'Legal', icon: FileText },
    { id: 'advanced' as const, label: 'Avançado', icon: Zap },
  ];

  return (
    <PrivateLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurações do Sistema</h1>
            <p className="text-slate-600">
              Personalize e configure o sistema conforme suas necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="card p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-slate-100'
                      }
                    `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="card">
                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Configurações Gerais
                      </h2>
                      <p className="text-slate-600">Informações básicas da empresa e do sistema</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        value={settings.companyName || ''}
                        onChange={(e) => updateSetting('companyName', e.target.value)}
                        placeholder="Nome da sua empresa"
                        className="input-field"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={settings.companyPhone || ''}
                          onChange={(e) => updateSetting('companyPhone', e.target.value)}
                          placeholder="0800 123 4567"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={settings.companyEmail || ''}
                          onChange={(e) => updateSetting('companyEmail', e.target.value)}
                          placeholder="compliance@empresa.com"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-4">
                        Logo da Empresa
                      </label>
                      <div className="flex items-center gap-4">
                        {settings.companyLogo ? (
                          <img
                            src={settings.companyLogo}
                            alt="Logo"
                            className="w-32 h-32 object-contain rounded-xl border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                            <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div className="space-y-3">
                          <label className="btn-secondary cursor-pointer inline-block">
                            <Upload className="w-5 h-5 mr-2 inline-block" />
                            Fazer Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">
                              PNG ou SVG recomendado. Máximo 2MB.
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              💡 Dica: Use PNG/SVG com fundo transparente e proporção 2:1 (ex:
                              360×180px, 400×200px).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-4">
                        Logo do Rodapé
                      </label>
                      <div className="flex items-center gap-4">
                        {settings.footerLogo ? (
                          <img
                            src={settings.footerLogo}
                            alt="Logo Rodapé"
                            className="w-32 h-32 object-contain rounded-xl border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                            <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div className="space-y-3">
                          <label className="btn-secondary cursor-pointer inline-block">
                            <Upload className="w-5 h-5 mr-2 inline-block" />
                            Fazer Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFooterLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">
                              PNG ou SVG recomendado. Máximo 2MB.
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              💡 Dica: Logo específico para o rodapé da página (aparece no final).
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Notificações</h3>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications || false}
                            onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">
                              Notificações por E-mail
                            </div>
                            <div className="text-sm text-slate-600">
                              Receber alertas de novas denúncias por e-mail
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.systemAlerts || false}
                            onChange={(e) => updateSetting('systemAlerts', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">Alertas do Sistema</div>
                            <div className="text-sm text-slate-600">
                              Notificações internas sobre atualizações
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Personalização Visual
                      </h2>
                      <p className="text-slate-600">Customize as cores do sistema (White Label)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Cor Primária (Azul)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settings.primaryColor || '#3b82f6'}
                            onChange={(e) => updateSetting('primaryColor', e.target.value)}
                            className="w-16 h-16 rounded-xl cursor-pointer border-2 border-slate-200"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={settings.primaryColor || '#3b82f6'}
                              onChange={(e) => updateSetting('primaryColor', e.target.value)}
                              className="input-field font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Cor Secundária (Laranja)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settings.secondaryColor || '#f97316'}
                            onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                            className="w-16 h-16 rounded-xl cursor-pointer border-2 border-slate-200"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={settings.secondaryColor || '#f97316'}
                              onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                              className="input-field font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-gradient-to-br from-slate-50 to-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Prévia</h3>
                      <div className="space-y-3">
                        <button
                          style={{
                            background: `linear-gradient(to right, ${settings.primaryColor || '#3b82f6'}, ${settings.secondaryColor || '#f97316'})`,
                          }}
                          className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg"
                        >
                          Botão Primário
                        </button>
                        <div
                          style={{
                            borderColor: settings.primaryColor || '#3b82f6',
                            color: settings.primaryColor || '#3b82f6',
                          }}
                          className="inline-flex px-4 py-2 rounded-full text-sm font-semibold border-2"
                        >
                          Badge de Exemplo
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSettings({
                            ...settings,
                            primaryColor: '#3b82f6',
                            secondaryColor: '#f97316',
                          });
                          toast.success('Cores restauradas ao padrão');
                        }}
                        className="btn-secondary"
                      >
                        Restaurar Padrão
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                      >
                        {saving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {saving ? 'Salvando...' : 'Salvar Cores'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Legal Tab */}
                {activeTab === 'legal' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">Documentos Legais</h2>
                      <p className="text-slate-600">
                        Políticas de privacidade, termos de uso e documentos normativos
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Política de Privacidade
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Insira a política de privacidade da empresa..."
                        className="input-field resize-none"
                        value={settings.privacyPolicy || ''}
                        onChange={(e) => updateSetting('privacyPolicy', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Termos de Uso
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Insira os termos de uso do sistema..."
                        className="input-field resize-none"
                        value={settings.termsOfService || ''}
                        onChange={(e) => updateSetting('termsOfService', e.target.value)}
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">
                        Documentos Normativos
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        Configure os documentos PDF que serão exibidos na página inicial. Você pode:
                      </p>
                      <ul className="text-sm text-slate-600 mb-6 ml-4 space-y-1">
                        <li>
                          ✏️ <strong>Inserir URL:</strong> Cole o link direto do documento hospedado
                          online
                        </li>
                        <li>
                          📤 <strong>Fazer Upload:</strong> Clique em &quot;Upload PDF&quot; para
                          carregar arquivo do seu computador (máx. 10MB)
                        </li>
                      </ul>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Código de Ética */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            📘 Código de Ética
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://exemplo.com/codigo-etica.pdf ou faça upload"
                              className="input-field flex-1"
                              value={settings.docCodigoEtica || ''}
                              onChange={(e) => updateSetting('docCodigoEtica', e.target.value)}
                            />
                            <label className="btn-secondary cursor-pointer flex items-center gap-2 px-4 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              <span className="hidden sm:inline">Upload PDF</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) => handleDocumentUpload('docCodigoEtica', e)}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Diretrizes e princípios éticos da empresa
                          </p>
                        </div>

                        {/* Política de Fornecedores */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            🏢 Política de Relacionamento com Fornecedores
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://exemplo.com/politica-fornecedores.pdf ou faça upload"
                              className="input-field flex-1"
                              value={settings.docPoliticaFornecedores || ''}
                              onChange={(e) =>
                                updateSetting('docPoliticaFornecedores', e.target.value)
                              }
                            />
                            <label className="btn-secondary cursor-pointer flex items-center gap-2 px-4 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              <span className="hidden sm:inline">Upload PDF</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) => handleDocumentUpload('docPoliticaFornecedores', e)}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Normas para relacionamento com parceiros comerciais
                          </p>
                        </div>

                        {/* Política Anticorrupção */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            🛡️ Política Anticorrupção e Antissuborno
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://exemplo.com/politica-anticorrupcao.pdf ou faça upload"
                              className="input-field flex-1"
                              value={settings.docPoliticaAnticorrupcao || ''}
                              onChange={(e) =>
                                updateSetting('docPoliticaAnticorrupcao', e.target.value)
                              }
                            />
                            <label className="btn-secondary cursor-pointer flex items-center gap-2 px-4 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              <span className="hidden sm:inline">Upload PDF</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) =>
                                  handleDocumentUpload('docPoliticaAnticorrupcao', e)
                                }
                              />
                            </label>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Diretrizes de combate à corrupção
                          </p>
                        </div>

                        {/* Política de Licitações */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            📄 Política de Participação em Licitações
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://exemplo.com/politica-licitacoes.pdf ou faça upload"
                              className="input-field flex-1"
                              value={settings.docPoliticaLicitacoes || ''}
                              onChange={(e) =>
                                updateSetting('docPoliticaLicitacoes', e.target.value)
                              }
                            />
                            <label className="btn-secondary cursor-pointer flex items-center gap-2 px-4 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              <span className="hidden sm:inline">Upload PDF</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) => handleDocumentUpload('docPoliticaLicitacoes', e)}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Normas para processos licitatórios
                          </p>
                        </div>

                        {/* Política PLD/FTP */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            ⚠️ Política PLD/FTP
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://exemplo.com/politica-pld-ftp.pdf ou faça upload"
                              className="input-field flex-1"
                              value={settings.docPoliticaPldFtp || ''}
                              onChange={(e) => updateSetting('docPoliticaPldFtp', e.target.value)}
                            />
                            <label className="btn-secondary cursor-pointer flex items-center gap-2 px-4 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              <span className="hidden sm:inline">Upload PDF</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) => handleDocumentUpload('docPoliticaPldFtp', e)}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo
                          </p>
                        </div>

                        {/* Política de Combate ao Assédio */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            🔒 Política de Combate ao Assédio
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="https://exemplo.com/politica-assedio.pdf ou faça upload"
                              className="input-field flex-1"
                              value={settings.docPoliticaAssedio || ''}
                              onChange={(e) => updateSetting('docPoliticaAssedio', e.target.value)}
                            />
                            <label className="btn-secondary cursor-pointer flex items-center gap-2 px-4 whitespace-nowrap">
                              <Upload className="w-4 h-4" />
                              <span className="hidden sm:inline">Upload PDF</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) => handleDocumentUpload('docPoliticaAssedio', e)}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Combate ao Assédio Moral e Sexual
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {saving ? 'Salvando...' : 'Salvar Documentos'}
                    </button>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Configurações Avançadas
                      </h2>
                      <p className="text-slate-600">Opções técnicas e de segurança do sistema</p>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.allowAnonymousComplaints || false}
                          onChange={(e) =>
                            updateSetting('allowAnonymousComplaints', e.target.checked)
                          }
                          className="w-5 h-5 rounded border-slate-300"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            Permitir Denúncias Anônimas
                          </div>
                          <div className="text-sm text-slate-600">
                            Usuários podem enviar denúncias sem identificação
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode || false}
                          onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">Modo de Manutenção</div>
                          <div className="text-sm text-slate-600">
                            Bloquear acesso ao sistema para manutenção
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="card bg-yellow-50 border-2 border-yellow-200">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-yellow-900 mb-1">Atenção!</h4>
                          <p className="text-sm text-yellow-800">
                            Ativar o modo de manutenção bloqueará o acesso de todos os usuários,
                            exceto administradores.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PrivateLayout>
  );
}
