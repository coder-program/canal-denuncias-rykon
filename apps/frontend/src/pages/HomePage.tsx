import { Link } from 'react-router-dom';
import { Shield, FileText, Lock, Eye, Bell, ArrowRight, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-yellow-50">
      {/* VERSÃO ATUALIZADA - TESTE */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 font-bold text-sm">
        ✅ NOVO DESIGN CARREGADO! Se você está vendo isto, o cache foi limpo com sucesso!
      </div>
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Canal de Denúncias
              </h1>
              <p className="text-xs text-gray-500">Seguro & Confidencial</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <button className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors">
                Entrar
              </button>
            </Link>
            <Link to="/denunciar">
              <button className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Denunciar
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full border border-primary-200 mb-8">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">100% Seguro & Anônimo</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
            <span className="block text-gray-900">Sua voz</span>
            <span className="block bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              importa
            </span>
            <span className="block text-gray-900">e é</span>
            <span className="block bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              protegida
            </span>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10">
            Sistema confidencial para denúncias de irregularidades. Sua identidade permanece 100%
            protegida.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/denunciar" className="group">
              <button className="px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl hover:shadow-primary-500/60 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2">
                <FileText className="w-6 h-6" />
                <span>Fazer Denúncia</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-10 py-5 text-lg font-bold text-primary-700 bg-white border-2 border-primary-200 rounded-2xl hover:bg-primary-50 hover:-translate-y-1 transition-all shadow-xl">
                Acessar Sistema
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-100 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Criptografia</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-100 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Anonimato</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-100 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Notificações</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-100 hover:-translate-y-2 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Resposta Rápida</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Pronto para fazer a <span className="text-accent-400">diferença</span>?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Sua denúncia pode transformar o ambiente de trabalho
          </p>
          <Link to="/denunciar" className="group inline-block">
            <button className="px-14 py-6 text-xl font-black text-primary-900 bg-gradient-to-r from-accent-400 to-accent-500 rounded-2xl shadow-2xl hover:scale-105 transition-all inline-flex items-center space-x-3">
              <span>Denunciar Agora</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </Link>
          <p className="mt-8 text-blue-200 text-sm"> Gratuito Anônimo Seguro 24/7</p>
        </div>
      </section>
    </div>
  );
}
