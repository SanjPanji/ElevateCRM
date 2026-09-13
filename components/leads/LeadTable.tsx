'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { LeadStatusBadge } from './LeadStatusBadge';
import { format } from 'date-fns';
import type { LeadWithDetails } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Video, Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface LeadTableProps {
  leads: LeadWithDetails[];
  isLoading?: boolean;
  filters: {
    search: string;
    status: string;
    budget: string;
    dateRange: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  // Pagination props
  page?: number;
  totalPages?: number;
  pageSize?: number;
  pageSizes?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const statuses = [
  { value: 'not_scheduled', label: 'Не назначена' },
  { value: 'scheduled', label: 'Назначена' },
  { value: 'completed', label: 'Завершена' },
];

const budgetRanges = [
  { value: 'any', label: 'Любой' },
  { value: '0-50000', label: 'До 50 000' },
  { value: '50000-100000', label: '50 000 – 100 000' },
  { value: '100000-300000', label: '100 000 – 300 000' },
  { value: '300000-1000000', label: '300 000 – 1 000 000' },
  { value: '1000000+', label: 'Более 1 000 000' },
];

const dateRanges = [
  { value: 'any', label: 'Любая дата' },
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'week', label: 'Эта неделя' },
  { value: 'next_week', label: 'След. неделя' },
  { value: 'past', label: 'Прошедшие' },
];

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentOption = options.find((o) => o.value === value);
  const displayValue = currentOption?.label || options[0]?.label || 'Любой';
  const isActive = value !== 'any' && value !== '';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 font-medium'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        <span className="max-w-32 truncate">{displayValue}</span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 min-w-48">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                  (option.value === value) || (option.value === 'any' && value === '')
                    ? 'text-blue-600 font-medium'
                    : 'text-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LeadTable({
  leads,
  isLoading,
  filters,
  onFilterChange,
  onClearFilters,
  page = 1,
  totalPages = 1,
  pageSize = 25,
  pageSizes = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
}: LeadTableProps) {
  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'any') ||
    (filters.budget && filters.budget !== 'any') ||
    (filters.dateRange && filters.dateRange !== 'any');

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white border-b border-slate-200">
              <td colSpan={7} className="px-4 py-3">
                <Skeleton className="h-10 w-64" />
              </td>
            </tr>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left"><Skeleton className="h-6 w-16" /></th>
              <th className="px-4 py-3 text-left"><Skeleton className="h-6 w-12" /></th>
              <th className="px-4 py-3 text-left"><Skeleton className="h-6 w-14" /></th>
              <th className="px-4 py-3 text-left"><Skeleton className="h-9 w-36" /></th>
              <th className="px-4 py-3 text-left"><Skeleton className="h-9 w-28" /></th>
              <th className="px-4 py-3 text-left"><Skeleton className="h-9 w-28" /></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-6 w-20" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-6 ml-auto" /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead>
          {/* Search Row */}
          <tr className="bg-white border-b border-slate-200">
            <td colSpan={7} className="px-4 py-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>
            </td>
          </tr>

          {/* Headers Row */}
          <tr className="bg-slate-50 border-b border-slate-200">
            {/* Created */}
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</span>
            </th>

            {/* Имя */}
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Имя</span>
            </th>

            {/* Номер */}
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Номер</span>
            </th>

            {/* Готовы вложить */}
            <th className="px-4 py-3 text-left">
              <FilterDropdown
                label="Готовы вложить"
                value={filters.budget}
                options={budgetRanges}
                onChange={(v) => onFilterChange('budget', v)}
              />
            </th>

            {/* Meeting Status */}
            <th className="px-4 py-3 text-left">
              <FilterDropdown
                label="Статус"
                value={filters.status}
                options={statuses.map((s) => ({ value: s.value, label: s.label }))}
                onChange={(v) => onFilterChange('status', v)}
              />
            </th>

            {/* Meeting */}
            <th className="px-4 py-3 text-left">
              <FilterDropdown
                label="Meeting"
                value={filters.dateRange}
                options={dateRanges}
                onChange={(v) => onFilterChange('dateRange', v)}
              />
            </th>

            {/* Action */}
            <th className="px-4 py-3 text-right">
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Сбросить
                </button>
              )}
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {leads.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                Нет лидов
              </td>
            </tr>
          ) : (
            leads.map((lead) => {
              const appointment = lead.nextAppointment;
              const hasMeetLink = appointment?.google_meet_url;

              return (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {format(new Date(lead.created_at), 'dd MMM')}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {lead.name || 'Без имени'}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                      >
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {lead.development_budget ? (
                      <span className="text-slate-900 font-medium">{lead.development_budget}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <LeadStatusBadge status={lead.meeting_status} />
                  </td>
                  <td className="px-4 py-4">
                    {appointment?.start_time ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-700 whitespace-nowrap">
                          {format(new Date(appointment.start_time), 'dd MMM, HH:mm')}
                        </span>
                        {hasMeetLink ? (
                          <a
                            href={appointment.google_meet_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-200 text-slate-500 rounded-lg">
                            <Video className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/leads/${lead.id}`}>
                      <ChevronRight className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination footer */}
      {(totalPages > 1 || pageSize !== 25) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="border border-slate-200 rounded-md px-2 py-1 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>per page</span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`w-8 h-8 text-sm rounded-md transition-colors ${
                    pageNum === page
                      ? 'bg-blue-600 text-white font-medium'
                      : 'border border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
