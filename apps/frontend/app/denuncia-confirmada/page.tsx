'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  FileText,
  Copy,
  Home,
  Eye,
  Calendar,
  Shield,
  AlertCircle,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

function DenunciaConfirmadaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const protocol = searchParams?.get('protocol') || null;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('[DenunciaConfirmada] Protocol recebido:', protocol);
    console.log('[DenunciaConfirmada] SearchParams:', searchParams?.toString());
    // Se não tiver protocolo, redirecionar
    if (!protocol) {
      console.log('[DenunciaConfirmada] Protocolo não encontrado, redirecionando...');
      router.push('/nova-denuncia');
    }
  }, [protocol, router, searchParams]);

  const copyProtocol = () => {
    if (protocol) {
      navigator.clipboard.writeText(protocol);
      setCopied(true);
      toast.success('Protocolo copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const printPage = () => {
    window.print();
  };

  if (!protocol) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Animação de Sucesso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Denúncia Enviada com Sucesso!</h1>
          <p className="text-lg text-slate-600">
            Sua denúncia foi registrada e será analisada pela nossa equipe
          </p>
        </div>

        {/* Card Principal - Protocolo */}
        <div className="card mb-6">
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <div className="flex items-center justify-center gap-2 text-slate-600 mb-3">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Número de Protocolo</span>
            </div>
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-4">
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 tracking-wider print:text-primary-700 print:bg-clip-border">
                {protocol}
              </p>
            </div>
            <button onClick={copyProtocol} className="btn-secondary inline-flex items-center gap-2">
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar Protocolo
                </>
              )}
            </button>
          </div>

          {/* Informações Importantes */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Guarde este número de protocolo!
                </h3>
                <p className="text-sm text-blue-700">
                  Use este protocolo para consultar o andamento da sua denúncia a qualquer momento.
                  Recomendamos que você o anote ou tire uma foto desta tela.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Confidencialidade Garantida</h3>
                <p className="text-sm text-green-700">
                  Todas as informações fornecidas são tratadas com máxima confidencialidade. Apenas
                  a equipe de compliance terá acesso aos detalhes da denúncia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <Calendar className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Prazo de Análise</h3>
                <p className="text-sm text-amber-700">
                  Nossa equipe iniciará a análise da denúncia em até <strong>2 dias úteis</strong>.
                  Você receberá atualizações sobre o andamento através do sistema.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            Próximos Passos
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Análise Inicial</h3>
                <p className="text-sm text-slate-600">
                  A equipe de compliance fará uma análise preliminar da denúncia.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Investigação</h3>
                <p className="text-sm text-slate-600">
                  Se procedente, será iniciada uma investigação detalhada dos fatos relatados.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Resolução</h3>
                <p className="text-sm text-slate-600">
                  Medidas apropriadas serão tomadas e você será informado sobre a conclusão.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Como Consultar */}
        <div className="card mb-6 bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-600" />
            Como Consultar o Status da Denúncia
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                1
              </div>
              <p className="text-slate-700">
                Acesse a página de <strong>Consulta de Denúncias</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                2
              </div>
              <p className="text-slate-700">
                Informe o número de protocolo:{' '}
                <code className="px-2 py-1 bg-white rounded text-primary-600 font-mono text-sm">
                  {protocol}
                </code>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                3
              </div>
              <p className="text-slate-700">
                Veja o status atual e o histórico de atualizações da sua denúncia
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/denuncias')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Ver Minhas Denúncias
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </button>
          <button
            onClick={printPage}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Imprimir Comprovante
          </button>
        </div>

        {/* Informações de Contato */}
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-3 text-center">Precisa de Ajuda?</h3>
          <p className="text-sm text-slate-600 text-center mb-4">
            Se você tiver dúvidas ou precisar de suporte, entre em contato com nossa equipe:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-slate-500">📧 Email:</span>
              <a
                href="mailto:compliance@empresa.com"
                className="text-primary-600 font-medium hover:underline"
              >
                compliance@empresa.com
              </a>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-slate-500">📞 Telefone:</span>
              <a href="tel:0800123456" className="text-primary-600 font-medium hover:underline">
                0800 123 456
              </a>
            </div>
          </div>
        </div>

        {/* Footer com Data */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Denúncia registrada em{' '}
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* CSS para Impressão */}
      <style jsx global>{`
        @media print {
          .gradient-bg {
            background: white !important;
          }
          button {
            display: none !important;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          /* Garantir que o protocolo seja visível na impressão */
          .text-transparent {
            color: #4f46e5 !important;
            -webkit-text-fill-color: #4f46e5 !important;
            background-clip: border-box !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DenunciaConfirmadaPage() {
  return (
    <Suspense fallback={null}>
      <DenunciaConfirmadaContent />
    </Suspense>
  );
}
