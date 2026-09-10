'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await signInWithEmail(data.email, data.password);

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Произошла непредвиденная ошибка');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-20">
          <div className="mb-16">
            <div className="flex items-center gap-5 mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-white tracking-wide">Elevate.Interns</span>
            </div>
            <h1 className="text-6xl font-bold text-white leading-tight mb-6">
              CRM система для<br />
              <span className="text-blue-400">управления стажёрами</span>
            </h1>
            <p className="text-2xl text-slate-400 max-w-lg leading-relaxed font-normal">
              Эффективное отслеживание лидов, расписание встреч и аналитика в одном месте
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-5">
            {[
              'Автоматическое распределение заявок',
              'Интеграция с Google Calendar',
              'Отслеживание прогресса в реальном времени'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-300 text-xl font-normal">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 bg-white">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-900">Elevate.Interns</span>
          </div>

          <div className="mb-10">
            <h2 className="text-5xl font-bold text-slate-900 mb-3">Добро пожаловать</h2>
            <p className="text-xl text-slate-500 font-normal">Войдите в свой аккаунт для продолжения</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-lg font-medium text-slate-700 mb-3">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="you@elevate.interns.com"
                  {...register('email')}
                  disabled={loading}
                  className="pl-14 h-14 text-lg rounded-xl border-slate-200"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-base mt-2">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-lg font-medium text-slate-700 mb-3">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  {...register('password')}
                  disabled={loading}
                  className="pl-14 h-14 text-lg rounded-xl border-slate-200"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-base mt-2">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-xl text-base">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-semibold mt-8 rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Вход...
                </span>
              ) : (
                'Войти'
              )}
            </Button>
          </form>

          <p className="text-lg text-center text-slate-400 mt-10">
            Нет аккаунта? Обратитесь к администратору
          </p>
        </div>
      </div>
    </div>
  );
}
