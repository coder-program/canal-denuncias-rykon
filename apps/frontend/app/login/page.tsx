'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState('Canal de Denúncias');
  const [companyLogo, setCompanyLogo] = useState('');

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const response = await apiClient.get('/settings');
      const settings = response.data;
      if (settings.companyName) {
        setCompanyName(settings.companyName);
      }
      if (settings.companyLogo) {
        setCompanyLogo(settings.companyLogo);
      }
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Login Form */}
        <div className="card p-8 md:p-12">
          <div className="mb-8 text-center">
            {companyLogo ? (
              <Link
                href="/"
                className="inline-flex items-center justify-center mb-4 bg-transparent cursor-pointer"
              >
                <img
                  src={companyLogo}
                  alt={`${companyName} Logo`}
                  style={{ width: '180px', height: '95px' }}
                  className="object-contain hover:opacity-80 transition-opacity"
                />
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 mb-4 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Shield className="w-8 h-8 text-white" />
              </Link>
            )}
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo ao {companyName}</h1>
            <p className="text-slate-600">Faça login para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                <span className="text-sm text-slate-600">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Credenciais de Demonstração
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>
                <strong>Admin:</strong> admin@empresa.com / Admin@123
              </p>
              <p>
                <strong>Investigador:</strong> investigator@empresa.com / Inv@123
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Hero */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl transform rotate-3 opacity-20"></div>
            <div className="relative card p-12 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
              <h2 className="text-4xl font-bold mb-6">Canal de Denúncias</h2>
              <p className="text-xl text-white/90 mb-8">
                Sistema profissional de compliance e gestão de denúncias corporativas
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">100% Confidencial</h3>
                    <p className="text-sm text-white/80">
                      Denúncias protegidas com criptografia de ponta a ponta
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Rastreamento Completo</h3>
                    <p className="text-sm text-white/80">
                      Acompanhe o status de cada denúncia em tempo real
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Gestão Eficiente</h3>
                    <p className="text-sm text-white/80">
                      Dashboard intuitivo com métricas e relatórios detalhados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
