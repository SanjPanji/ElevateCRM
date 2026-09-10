'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Calendar, DollarSign } from 'lucide-react';

const statuses = [
  { value: 'not_scheduled', label: 'Не назначена' },
  { value: 'scheduled', label: 'Назначена' },
  { value: 'completed', label: 'Завершена' },
];

const budgetRanges = [
  { value: 'any', label: 'Любой бюджет', shortLabel: 'Любой' },
  { value: '0-50000', label: 'До 50 000 ₸', shortLabel: 'До 50 000 ₸' },
  { value: '50000-100000', label: '50 000 – 100 000 ₸', shortLabel: '50 000 – 100 000 ₸' },
  { value: '100000-300000', label: '100 000 – 300 000 ₸', shortLabel: '100 000 – 300 000 ₸' },
  { value: '300000-1000000', label: '300 000 – 1 000 000 ₸', shortLabel: '300 000 – 1 000 000 ₸' },
  { value: '1000000+', label: 'Более 1 000 000 ₸', shortLabel: 'Более 1 000 000 ₸' },
];

const dateRanges = [
  { value: 'any', label: 'Любая дата', shortLabel: 'Любая дата' },
  { value: 'today', label: 'Сегодня', shortLabel: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра', shortLabel: 'Завтра' },
  { value: 'week', label: 'На этой неделе', shortLabel: 'Эта неделя' },
  { value: 'next_week', label: 'На следующей неделе', shortLabel: 'След. неделя' },
  { value: 'past', label: 'Прошедшие', shortLabel: 'Прошедшие' },
];

interface LeadFiltersProps {
  search: string;
  status: string;
  budget: string;
  dateRange: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onClear: () => void;
}

export function LeadFilters({
  search,
  status,
  budget,
  dateRange,
  onSearchChange,
  onStatusChange,
  onBudgetChange,
  onDateRangeChange,
  onClear,
}: LeadFiltersProps) {
  const hasFilters = search || status || (budget && budget !== 'any') || (dateRange && dateRange !== 'any');

  // Get labels for current selections
  const budgetLabel = budgetRanges.find(b => b.value === (budget || 'any'))?.shortLabel || 'Любой';
  const statusLabel = status
    ? statuses.find(s => s.value === status)?.label || 'Статус'
    : 'Статус';
  const dateLabel = dateRanges.find(d => d.value === (dateRange || 'any'))?.shortLabel || 'Любая дата';

  return (
    <div className="space-y-4">
      {/* Search - full width */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Поиск по имени, телефону..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 text-base rounded-xl"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{budgetLabel}</label>
          <Select value={budget || 'any'} onValueChange={(value) => onBudgetChange(value || 'any')}>
            <SelectTrigger className="h-12 text-base rounded-xl">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Meeting Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{statusLabel}</label>
          <Select value={status || 'any'} onValueChange={(value) => onStatusChange(value || '')}>
            <SelectTrigger className="h-12 text-base rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Любой статус</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{dateLabel}</label>
          <Select value={dateRange || 'any'} onValueChange={(value) => onDateRangeChange(value || 'any')}>
            <SelectTrigger className="h-12 text-base rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            onClick={onClear}
            className="text-slate-600"
          >
            <X className="w-4 h-4 mr-2" />
            Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  );
}
