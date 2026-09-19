import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, Shield, FileText, Bell, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { loginSchema } from '@/utils/validations';
import { Button, Input, Alert } from '@/components/ui';
import type { LoginRequest } from '@/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      setError('');
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha inválidos. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-yellow-50">
      {/* BANNER DE TESTE - VERSÃO NOVA */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2 font-bold text-sm z-50">
        ✅ LOGINPAGE ATUALIZADA! Novo design carregado com sucesso!
      </div>
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 mb-6 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
              Bem-vindo
            </h1>
            <p className="text-lg text-gray-600">Acesse sua conta para gerenciar denúncias</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8">
            {error && (
              <Alert variant="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <Input
                  {...register('email')}
                  type="email"
                  label="Email"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-5 w-5" />}
                  autoComplete="email"
                  required
                />

                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Senha"
                  placeholder=""
                  error={errors.password?.message}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none hover:text-primary-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Credenciais de Teste
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Admin:</span>
                <span className="text-blue-900 font-mono">admin@empresa.com / Admin@123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Investigador:</span>
                <span className="text-blue-900 font-mono text-xs">
                  investigador@empresa.com / Invest@123
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <h2 className="text-6xl font-black mb-6 leading-tight">
            Sistema de
            <br />
            <span className="text-accent-300">Denúncias</span>
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed mb-8">
            Plataforma segura e confidencial para reportar irregularidades. Sua identidade está
            protegida.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">100% Confidencial</h3>
                <p className="text-sm text-blue-100">Suas informações protegidas</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Rastreamento em Tempo Real</h3>
                <p className="text-sm text-blue-100">Acompanhe sua denúncia</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Fácil e Rápido</h3>
                <p className="text-sm text-blue-100">Interface intuitiva</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
