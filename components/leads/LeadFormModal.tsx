'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, User, Phone, GraduationCap, Target, Wallet, History, CheckCircle, Save } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const leadFormSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  age: z.string().optional(),
  university: z.string().optional(),
  education_course: z.string().optional(),
  specialty: z.string().optional(),
  current_activity: z.string().optional(),
  current_job: z.string().optional(),
  monthly_income: z.string().optional(),
  income_currency: z.string().default('KZT'),
  main_goal: z.string().optional(),
  main_obstacle: z.string().optional(),
  why_now: z.string().optional(),
  purchased_courses: z.string().optional(),
  liked_and_missing: z.string().optional(),
  ready_to_start: z.string().optional(),
  payment_decision_maker: z.string().optional(),
  development_budget: z.string().optional(),
  success_result: z.string().optional(),
  consultant_notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeadFormModal({ isOpen, onClose, onSuccess }: LeadFormModalProps) {
  const { user } = useCurrentUser();
  const { mutate: createLead, isPending: isCreating } = useCreateLead();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      income_currency: 'KZT',
    },
  });

  const incomeCurrency = watch('income_currency');

  const handleSubmitForm = async (data: LeadFormData) => {
    if (!user?.id) return;

    const leadData = {
      name: data.name,
      phone: data.phone,
      age: data.age ? parseInt(data.age, 10) : null,
      university: data.university || null,
      education_course: data.education_course || null,
      specialty: data.specialty || null,
      current_activity: data.current_activity || null,
      current_job: data.current_job || null,
      monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
      income_currency: data.income_currency || 'KZT',
      main_goal: data.main_goal || null,
      main_obstacle: data.main_obstacle || null,
      why_now: data.why_now || null,
      purchased_courses: data.purchased_courses || null,
      liked_and_missing: data.liked_and_missing || null,
      ready_to_start: data.ready_to_start || null,
      payment_decision_maker: data.payment_decision_maker || null,
      development_budget: data.development_budget || null,
      success_result: data.success_result || null,
      consultant_notes: data.consultant_notes || null,
      assigned_to: user.id,
      source: 'manual',
      meeting_status: 'not_scheduled',
    };

    createLead(leadData, {
      onSuccess: () => {
        onClose();
        onSuccess?.();
      },
      onError: (error) => {
        console.error('Failed to create lead:', error);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
        <div className="bg-background border rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Новый лид</h2>
              <p className="text-sm text-muted-foreground">Заполните информацию о клиенте</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Основное
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'advanced'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Дополнительно
              </button>
            </div>

            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Имя *
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="Иван Иванов"
                      className="h-10"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Телефон *
                    </label>
                    <Input
                      {...register('phone')}
                      type="tel"
                      placeholder="+7 (999) 999-99-99"
                      className="h-10"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Возраст</label>
                    <Input
                      {...register('age')}
                      type="number"
                      placeholder="25"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Учебное заведение
                    </label>
                    <Input
                      {...register('university')}
                      placeholder="КазНУ, МГУ и т.д."
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Курс / Направление</label>
                    <Input
                      {...register('education_course')}
                      placeholder="Программирование, Маркетинг..."
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Специальность</label>
                    <Input
                      {...register('specialty')}
                      placeholder="Frontend разработчик, SMM..."
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Current Situation */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Текущая ситуация
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Текущая деятельность</label>
                      <Input
                        {...register('current_activity')}
                        placeholder="Учусь / Работаю / В поиске работы"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Текущая работа</label>
                      <Input
                        {...register('current_job')}
                        placeholder="Название компании / должность"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Ежемесячный доход
                      </label>
                      <div className="flex gap-2">
                        <Input
                          {...register('monthly_income')}
                          type="number"
                          placeholder="150000"
                          className="h-10 flex-1"
                        />
                        <Select
                          value={incomeCurrency}
                          onValueChange={(v) => v && setValue('income_currency', v)}
                        >
                          <SelectTrigger className="h-10 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KZT">KZT</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Цели и мотивация
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Главная цель</label>
                      <Textarea
                        {...register('main_goal')}
                        placeholder="Хочу стать разработчиком / Сменить профессию / Заработать больше..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Главное препятствие</label>
                      <Textarea
                        {...register('main_obstacle')}
                        placeholder="Недостаточно времени / Нет денег / Страх неудачи..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Почему сейчас?</label>
                      <Textarea
                        {...register('why_now')}
                        placeholder="Потерял работу / Родился ребенок / Хочу смену..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                {/* Readiness */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Готовность к покупке
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Когда готов начать</label>
                      <Textarea
                        {...register('ready_to_start')}
                        placeholder="Сразу / Через месяц / Нужно подумать..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Кто принимает решение</label>
                      <Input
                        {...register('payment_decision_maker')}
                        placeholder="Сам / Родители / Муж/Жена / Работодатель"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Бюджет на обучение</label>
                      <Input
                        {...register('development_budget')}
                        placeholder="100 000 - 300 000 KZT"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Previous Experience */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Предыдущий опыт
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Купленные курсы</label>
                      <Textarea
                        {...register('purchased_courses')}
                        placeholder="Названия курсов, платформы..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Что понравилось / чего не хватало</label>
                      <Textarea
                        {...register('liked_and_missing')}
                        placeholder="Понравилось: практика. Не хватало: поддержки..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Expected Result & Notes */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Ожидаемый результат и заметки
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ожидаемый результат</label>
                      <Textarea
                        {...register('success_result')}
                        placeholder="Найти работу за 3 месяца / Получить повышение / Освоить новый стек..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Заметки консультанта</label>
                      <Textarea
                        {...register('consultant_notes')}
                        placeholder="Дополнительные заметки..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Создание...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Создать лид
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}