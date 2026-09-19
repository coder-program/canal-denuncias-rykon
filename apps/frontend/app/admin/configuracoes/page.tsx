'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../layout-admin';
import {
  Settings,
  Save,
  Globe,
  Shield,
  Clock,
  Database,
  Mail,
  CreditCard,
  AlertCircle,
  Check,
  Server,
  Users,
  FileText,
  DollarSign,
  Lock,
  Bell,
  Zap,
  Key,
} from 'lucide-react';

type TabType = 'general' | 'security' | 'trial' | 'limits' | 'email' | 'payment';

interface PlatformSettings {
  // General
  platformName: string;
  platformUrl: string;
  platformDescription: string;
  timezone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;

  // Security
  minPasswordLength: number;
  requireSpecialChar: boolean;
  require2FA: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelistEnabled: boolean;

  // Trial
  trialDays: number;
  trialMaxUsers: number;
  trialMaxComplaints: number;
  trialFeaturesEnabled: string[];

  // Limits
  maxUsersPerTenant: number;
  maxComplaintsPerMonth: number;
  maxStoragePerTenantGB: number;
  maxUploadSizeMB: number;
  apiRateLimitPerMinute: number;

  // Email
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;

  // Payment
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  defaultCurrency: string;
  taxEnabled: boolean;
  taxPercentage: number;
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock settings data
  const [settings, setSettings] = useState<PlatformSettings>({
    // General
    platformName: 'OuviON',
    platformUrl: 'https://ouvion.com.br',
    platformDescription: 'Plataforma de Canal de Denúncias para empresas',
    timezone: 'America/Sao_Paulo',
    defaultLanguage: 'pt-BR',
    maintenanceMode: false,

    // Security
    minPasswordLength: 8,
    requireSpecialChar: true,
    require2FA: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    ipWhitelistEnabled: false,

    // Trial
    trialDays: 14,
    trialMaxUsers: 5,
    trialMaxComplaints: 50,
    trialFeaturesEnabled: ['complaints', 'dashboard', 'reports', 'notifications'],

    // Limits
    maxUsersPerTenant: 100,
    maxComplaintsPerMonth: 1000,
    maxStoragePerTenantGB: 50,
    maxUploadSizeMB: 10,
    apiRateLimitPerMinute: 100,

    // Email
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey',
    smtpPassword: '••••••••••••••••',
    fromEmail: 'noreply@ouvion.com.br',
    fromName: 'OuviON - Canal de Denúncias',
    enableEmailNotifications: true,

    // Payment
    stripePublicKey: 'pk_test_••••••••••••••••',
    stripeSecretKey: 'sk_test_••••••••••••••••',
    stripeWebhookSecret: 'whsec_••••••••••••••••',
    defaultCurrency: 'BRL',
    taxEnabled: false,
    taxPercentage: 0,
  });

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

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
  }: {
    enabled: boolean;
    onChange: (val: boolean) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

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

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'general', label: 'Geral', icon: Globe },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'trial', label: 'Trial/Avaliação', icon: Clock },
    { id: 'limits', label: 'Limites & Quotas', icon: Database },
    { id: 'email', label: 'Email/SMTP', icon: Mail },
    { id: 'payment', label: 'Pagamento', icon: CreditCard },
  ];

  return (
    <AdminLayout user={user}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações Globais</h1>
          <p className="text-gray-600 mt-1">Gerenciar parâmetros e configurações da plataforma</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="font-medium">Salvando...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span className="font-medium">Salvo!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span className="font-medium">Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Status da Plataforma</p>
              <p className="text-2xl font-bold mt-1">
                {settings.maintenanceMode ? 'Manutenção' : 'Operacional'}
              </p>
            </div>
            <Server className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Período Trial</p>
              <p className="text-2xl font-bold mt-1">{settings.trialDays} dias</p>
            </div>
            <Clock className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Limite Rate API</p>
              <p className="text-2xl font-bold mt-1">{settings.apiRateLimitPerMinute}/min</p>
            </div>
            <Zap className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Segurança 2FA</p>
              <p className="text-2xl font-bold mt-1">
                {settings.require2FA ? 'Ativado' : 'Desativado'}
              </p>
            </div>
            <Lock className="w-12 h-12 text-orange-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-800">Atenção: Configurações Críticas</p>
          <p className="text-sm text-yellow-700 mt-1">
            Alterações nestas configurações afetam toda a plataforma e todos os tenants.
            Certifique-se antes de salvar.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Configurações Gerais</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Plataforma
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => updateSetting('platformName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Plataforma
                    </label>
                    <input
                      type="url"
                      value={settings.platformUrl}
                      onChange={(e) => updateSetting('platformUrl', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição da Plataforma
                    </label>
                    <textarea
                      value={settings.platformDescription}
                      onChange={(e) => updateSetting('platformDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/Manaus">Manaus (GMT-4)</option>
                      <option value="America/Recife">Recife (GMT-3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma Padrão
                    </label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <ToggleSwitch
                    enabled={settings.maintenanceMode}
                    onChange={(val) => updateSetting('maintenanceMode', val)}
                    label="Modo de Manutenção (bloqueia acesso de todos os usuários)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Políticas de Segurança</span>
                </h3>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Políticas de Senha</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comprimento Mínimo
                        </label>
                        <input
                          type="number"
                          value={settings.minPasswordLength}
                          onChange={(e) =>
                            updateSetting('minPasswordLength', parseInt(e.target.value))
                          }
                          min="6"
                          max="32"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeout de Sessão (minutos)
                        </label>
                        <input
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) =>
                            updateSetting('sessionTimeout', parseInt(e.target.value))
                          }
                          min="10"
                          max="1440"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <ToggleSwitch
                      enabled={settings.requireSpecialChar}
                      onChange={(val) => updateSetting('requireSpecialChar', val)}
                      label="Exigir caracteres especiais (@, #, $, etc.)"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Autenticação & Acesso</h4>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máximo de Tentativas de Login
                      </label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) =>
                          updateSetting('maxLoginAttempts', parseInt(e.target.value))
                        }
                        min="3"
                        max="10"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Conta será bloqueada após este número de tentativas falhas
                      </p>
                    </div>

                    <ToggleSwitch
                      enabled={settings.require2FA}
                      onChange={(val) => updateSetting('require2FA', val)}
                      label="Exigir autenticação em dois fatores (2FA) para todos os usuários"
                    />

                    <ToggleSwitch
                      enabled={settings.ipWhitelistEnabled}
                      onChange={(val) => updateSetting('ipWhitelistEnabled', val)}
                      label="Habilitar whitelist de IPs para Super Admins"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRIAL TAB */}
          {activeTab === 'trial' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Configurações de Trial/Avaliação</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração do Trial (dias)
                    </label>
                    <input
                      type="number"
                      value={settings.trialDays}
                      onChange={(e) => updateSetting('trialDays', parseInt(e.target.value))}
                      min="7"
                      max="90"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Usuários no Trial
                    </label>
                    <input
                      type="number"
                      value={settings.trialMaxUsers}
                      onChange={(e) => updateSetting('trialMaxUsers', parseInt(e.target.value))}
                      min="1"
                      max="50"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Denúncias no Trial
                    </label>
                    <input
                      type="number"
                      value={settings.trialMaxComplaints}
                      onChange={(e) =>
                        updateSetting('trialMaxComplaints', parseInt(e.target.value))
                      }
                      min="10"
                      max="500"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Features Disponíveis no Trial</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Selecione quais funcionalidades estarão disponíveis durante o período de
                    avaliação
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 'complaints', label: 'Receber e Gerenciar Denúncias' },
                      { id: 'dashboard', label: 'Dashboard e Relatórios' },
                      { id: 'reports', label: 'Exportação de Relatórios' },
                      { id: 'notifications', label: 'Notificações por Email' },
                      { id: 'assignments', label: 'Atribuir Denúncias a Usuários' },
                      { id: 'file-upload', label: 'Upload de Arquivos' },
                    ].map((feature) => (
                      <label
                        key={feature.id}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={settings.trialFeaturesEnabled.includes(feature.id)}
                          onChange={(e) => {
                            const newFeatures = e.target.checked
                              ? [...settings.trialFeaturesEnabled, feature.id]
                              : settings.trialFeaturesEnabled.filter((f) => f !== feature.id);
                            updateSetting('trialFeaturesEnabled', newFeatures);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{feature.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIMITS TAB */}
          {activeTab === 'limits' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Limites e Quotas por Tenant</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Usuários</h4>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Usuários por Tenant
                    </label>
                    <input
                      type="number"
                      value={settings.maxUsersPerTenant}
                      onChange={(e) => updateSetting('maxUsersPerTenant', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Denúncias</h4>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Denúncias por Mês
                    </label>
                    <input
                      type="number"
                      value={settings.maxComplaintsPerMonth}
                      onChange={(e) =>
                        updateSetting('maxComplaintsPerMonth', parseInt(e.target.value))
                      }
                      min="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Database className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium text-gray-900">Armazenamento</h4>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Armazenamento (GB)
                    </label>
                    <input
                      type="number"
                      value={settings.maxStoragePerTenantGB}
                      onChange={(e) =>
                        updateSetting('maxStoragePerTenantGB', parseInt(e.target.value))
                      }
                      min="1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium text-gray-900">Tamanho do Upload</h4>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo por Arquivo (MB)
                    </label>
                    <input
                      type="number"
                      value={settings.maxUploadSizeMB}
                      onChange={(e) => updateSetting('maxUploadSizeMB', parseInt(e.target.value))}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Rate Limiting da API</h4>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisições por Minuto (por tenant)
                  </label>
                  <input
                    type="number"
                    value={settings.apiRateLimitPerMinute}
                    onChange={(e) =>
                      updateSetting('apiRateLimitPerMinute', parseInt(e.target.value))
                    }
                    min="10"
                    max="1000"
                    className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Limite de requisições à API para evitar abuso e garantir performance
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Configurações de Email e SMTP</span>
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <ToggleSwitch
                    enabled={settings.enableEmailNotifications}
                    onChange={(val) => updateSetting('enableEmailNotifications', val)}
                    label="Habilitar notificações por email"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servidor SMTP
                    </label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) => updateSetting('smtpHost', e.target.value)}
                      placeholder="smtp.sendgrid.net"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porta SMTP
                    </label>
                    <input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuário SMTP
                    </label>
                    <input
                      type="text"
                      value={settings.smtpUser}
                      onChange={(e) => updateSetting('smtpUser', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha SMTP
                    </label>
                    <input
                      type="password"
                      value={settings.smtpPassword}
                      onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Informações do Remetente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email do Remetente
                      </label>
                      <input
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => updateSetting('fromEmail', e.target.value)}
                        placeholder="noreply@ouvion.com.br"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Remetente
                      </label>
                      <input
                        type="text"
                        value={settings.fromName}
                        onChange={(e) => updateSetting('fromName', e.target.value)}
                        placeholder="OuviON"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Configurações de Pagamento</span>
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                  <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Integração com Stripe</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Configure as chaves da API Stripe para processar pagamentos. Mantenha suas
                      chaves secretas em segurança.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chave Pública Stripe (Publishable Key)
                    </label>
                    <input
                      type="text"
                      value={settings.stripePublicKey}
                      onChange={(e) => updateSetting('stripePublicKey', e.target.value)}
                      placeholder="pk_test_..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chave Secreta Stripe (Secret Key)
                    </label>
                    <input
                      type="password"
                      value={settings.stripeSecretKey}
                      onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                      placeholder="sk_test_..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook Secret
                    </label>
                    <input
                      type="password"
                      value={settings.stripeWebhookSecret}
                      onChange={(e) => updateSetting('stripeWebhookSecret', e.target.value)}
                      placeholder="whsec_..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Usado para validar eventos do webhook do Stripe
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Configurações Fiscais</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moeda Padrão
                        </label>
                        <select
                          value={settings.defaultCurrency}
                          onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="BRL">BRL - Real Brasileiro</option>
                          <option value="USD">USD - Dólar Americano</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Percentual de Taxa (%)
                        </label>
                        <input
                          type="number"
                          value={settings.taxPercentage}
                          onChange={(e) =>
                            updateSetting('taxPercentage', parseFloat(e.target.value))
                          }
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={!settings.taxEnabled}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <ToggleSwitch
                      enabled={settings.taxEnabled}
                      onChange={(val) => updateSetting('taxEnabled', val)}
                      label="Aplicar taxa/imposto nos pagamentos"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
