'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  Lock,
  Eye,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Search,
  Download,
  ChevronRight,
  Building2,
  Phone,
  Mail,
  FileCheck,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { apiClient } from '@/lib/api';

export default function Home() {
  const [protocolSearch, setProtocolSearch] = useState('');
  const [contactInfo, setContactInfo] = useState({
    phone: '0800 123 4567 (24h)',
    email: 'compliance@empresa.com',
  });
  const [companyName, setCompanyName] = useState('OuviOn');
  const [companyLogo, setCompanyLogo] = useState('');
  const [footerLogo, setFooterLogo] = useState('');

  // Template dos documentos (será populado com dados do backend)
  const documentTemplates = [
    {
      title: 'Código de Ética',
      description: 'Diretrizes e princípios éticos da empresa',
      icon: FileCheck,
      color: 'blue',
    },
    {
      title: 'Política de Relacionamento com Fornecedores',
      description: 'Normas para relacionamento com parceiros comerciais',
      icon: Building2,
      color: 'green',
    },
    {
      title: 'Política Anticorrupção e Antissuborno',
      description: 'Diretrizes de combate à corrupção',
      icon: Shield,
      color: 'red',
    },
    {
      title: 'Política de Participação em Licitações',
      description: 'Normas para processos licitatórios',
      icon: FileText,
      color: 'purple',
    },
    {
      title: 'Política PLD/FTP',
      description: 'Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo',
      icon: AlertCircle,
      color: 'orange',
    },
    {
      title: 'Política de Combate ao Assédio',
      description: 'Combate ao Assédio Moral e Sexual',
      icon: Lock,
      color: 'pink',
    },
  ];

  const [documents, setDocuments] = useState<
    Array<(typeof documentTemplates)[number] & { file: string }>
  >([]);

  useEffect(() => {
    loadSettings();

    // Recarregar quando as configurações forem atualizadas
    const handleThemeUpdate = () => {
      loadSettings();
    };

    window.addEventListener('theme-updated', handleThemeUpdate);
    return () => window.removeEventListener('theme-updated', handleThemeUpdate);
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/settings');

      // Atualizar informações de contato
      setContactInfo({
        phone: response.data.companyPhone || '0800 123 4567 (24h)',
        email: response.data.companyEmail || 'compliance@empresa.com',
      });
      // Atualizar nome e logo da empresa
      if (response.data.companyName) {
        setCompanyName(response.data.companyName);
      }
      if (response.data.companyLogo) {
        setCompanyLogo(response.data.companyLogo);
      }
      if (response.data.footerLogo) {
        setFooterLogo(response.data.footerLogo);
      }
      // Mapear documentos do backend com os templates
      const allDocuments = [
        { ...documentTemplates[0], file: response.data.docCodigoEtica },
        { ...documentTemplates[1], file: response.data.docPoliticaFornecedores },
        { ...documentTemplates[2], file: response.data.docPoliticaAnticorrupcao },
        { ...documentTemplates[3], file: response.data.docPoliticaLicitacoes },
        { ...documentTemplates[4], file: response.data.docPoliticaPldFtp },
        { ...documentTemplates[5], file: response.data.docPoliticaAssedio },
      ];

      // Mostrar apenas documentos que foram carregados (não vazios e não URLs de fallback)
      const uploadedDocs = allDocuments.filter(
        (doc) => doc.file && doc.file.trim() !== '' && !doc.file.startsWith('/docs/'), // Remover URLs de fallback locais
      );

      setDocuments(uploadedDocs);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Em caso de erro, não mostrar documentos
      setDocuments([]);
    }
  };

  const handleProtocolSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocolSearch.trim()) {
      window.location.href = `/acompanhar?protocol=${protocolSearch}`;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100' },
      red: { bg: 'bg-red-50', text: 'text-red-600', hover: 'hover:bg-red-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'hover:bg-pink-100' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* HEADER */}
      <Header showAdminButton={true} />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Sua Voz é
            <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Importante
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Canal seguro e confidencial para denúncias de irregularidades, assédio, fraudes e
            violações ao código de ética.
          </p>
        </div>

        {/* AÇÕES PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {/* FAZER DENÚNCIA */}
          <Link href="/nova-denuncia">
            <div className="card group cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">Fazer uma Denúncia</h3>
                  <p className="text-slate-600">Relate irregularidades de forma segura</p>
                </div>
                <ChevronRight className="w-6 h-6 text-primary-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-600">
                <CheckCircle className="w-4 h-4" />
                <span>100% Confidencial</span>
                <CheckCircle className="w-4 h-4" />
                <span>Anônima (opcional)</span>
              </div>
            </div>
          </Link>

          {/* ACOMPANHAR DENÚNCIA */}
          <div className="card bg-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900">Acompanhar Denúncia</h3>
                <p className="text-slate-600">Consulte o status pelo protocolo</p>
              </div>
            </div>
            <form onSubmit={handleProtocolSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Digite o número do protocolo"
                value={protocolSearch}
                onChange={(e) => setProtocolSearch(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">
                Buscar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* DOCUMENTOS NORMATIVOS */}
      {documents.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16 bg-white/50 backdrop-blur-sm rounded-3xl my-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Documentos Normativos</h2>
            <p className="text-lg text-slate-600">Conheça as políticas e diretrizes da empresa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => {
              const colors = getColorClasses(doc.color);
              const Icon = doc.icon;

              const handleDocumentClick = (e: React.MouseEvent) => {
                e.preventDefault();

                // Se for URL externa, abre em nova aba
                if (doc.file.startsWith('http://') || doc.file.startsWith('https://')) {
                  window.open(doc.file, '_blank', 'noopener,noreferrer');
                }
                // Se for base64, converte para blob e abre no navegador
                else if (doc.file.startsWith('data:application/pdf')) {
                  // Extrai o base64 do data URL
                  const base64 = doc.file.split(',')[1];
                  const binaryString = atob(base64);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }

                  // Cria blob e URL temporária
                  const blob = new Blob([bytes], { type: 'application/pdf' });
                  const blobUrl = URL.createObjectURL(blob);

                  // Abre em nova aba
                  window.open(blobUrl, '_blank', 'noopener,noreferrer');

                  // Libera memória após 1 minuto
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                }
              };

              return (
                <div
                  key={index}
                  onClick={handleDocumentClick}
                  className={`card group cursor-pointer hover:scale-105 transition-all duration-300 ${colors.hover}`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{doc.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{doc.description}</p>
                  <div className={`flex items-center gap-2 ${colors.text} font-semibold`}>
                    <Download className="w-4 h-4" />
                    <span>Baixar PDF</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* GARANTIAS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Por que denunciar?</h2>
          <p className="text-lg text-slate-600">
            Seu relato é fundamental para manter a integridade da organização
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4 mx-auto">
              <Lock className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Confidencialidade</h3>
            <p className="text-slate-600">Seus dados são protegidos com criptografia de ponta</p>
          </div>

          <div className="card text-center">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Proteção ao Denunciante</h3>
            <p className="text-slate-600">Proibida qualquer retaliação ou represália</p>
          </div>

          <div className="card text-center">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mb-4 mx-auto">
              <Eye className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Acompanhamento</h3>
            <p className="text-slate-600">Consulte o status da denúncia a qualquer momento</p>
          </div>

          <div className="card text-center">
            <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Investigação Imparcial</h3>
            <p className="text-slate-600">Todas as denúncias são analisadas com seriedade</p>
          </div>
        </div>
      </section>

      {/* CONTATO E INFORMAÇÕES */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-slate-900 rounded-3xl my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Dúvidas sobre o Canal?</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Nossa equipe de Compliance está à disposição para esclarecer qualquer questão sobre o
              processo de denúncia.
            </p>
            <div className="space-y-4">
              <a
                href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                className="flex items-start gap-4 hover:bg-white/5 p-3 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/30 transition-colors">
                  <Phone className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Telefone</p>
                  <p className="text-slate-300 group-hover:text-white transition-colors">
                    {contactInfo.phone}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-start gap-4 hover:bg-white/5 p-3 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/30 transition-colors">
                  <Mail className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">E-mail</p>
                  <p className="text-slate-300 group-hover:text-white transition-colors">
                    {contactInfo.email}
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">O que você pode denunciar?</h3>
            <ul className="space-y-3">
              {[
                'Assédio moral ou sexual',
                'Discriminação e preconceito',
                'Fraudes e desvios de recursos',
                'Corrupção e suborno',
                'Violações de segurança',
                'Conflito de interesses',
                'Descumprimento de políticas internas',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Pronto para fazer sua denúncia?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            O processo é simples, rápido e totalmente seguro. Sua contribuição ajuda a manter um
            ambiente ético e íntegro.
          </p>
          <Link href="/nova-denuncia">
            <button className="btn-primary text-lg px-10 py-4 flex items-center gap-3 mx-auto">
              <MessageSquare className="w-5 h-5" />
              Iniciar Denúncia Agora
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {footerLogo ? (
                <img
                  src={footerLogo}
                  alt={`${companyName} Logo Rodapé`}
                  className="h-12 w-auto object-contain"
                />
              ) : companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} Logo`}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{companyName}</p>
                <p className="text-xs text-slate-600">Canal de Denúncia</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-600">© 2026 Todos os direitos reservados a OuviOn</p>
              <p className="text-xs text-slate-500">Desenvolvido com segurança e conformidade</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
