'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useLeads } from '@/hooks/useLeads';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRealtimeLeads } from '@/hooks/useRealtime';
import { LeadTable } from '@/components/leads/LeadTable';
import { Card } from '@/components/ui/card';

export default function LeadsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    budget: '',
    dateRange: '',
  });

  const userRole = user?.profile?.role;
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

  // Fetch leads
  const { data: allLeads, isLoading, error } = useLeads({
    assignedTo: isManagerOrAdmin ? undefined : user?.id,
  });

  // Realtime subscription
  useRealtimeLeads(user?.id);

  // Filter leads locally
  const filteredLeads = useMemo(() => {
    if (!allLeads) return [];

    return allLeads.filter((lead) => {
      // Status filter
      if (filters.status && filters.status !== 'any' && lead.meeting_status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !lead.name?.toLowerCase().includes(searchLower) &&
          !lead.phone?.toLowerCase().includes(searchLower) &&
          !lead.university?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Budget filter
      if (filters.budget && filters.budget !== 'any') {
        const budgetText = lead.development_budget || '';
        const budgetValue = parseBudgetValue(budgetText);

        switch (filters.budget) {
          case '0-50000':
            if (budgetValue > 50000) return false;
            break;
          case '50000-100000':
            if (budgetValue < 50000 || budgetValue > 100000) return false;
            break;
          case '100000-300000':
            if (budgetValue < 100000 || budgetValue > 300000) return false;
            break;
          case '300000-1000000':
            if (budgetValue < 300000 || budgetValue > 1000000) return false;
            break;
          case '1000000+':
            if (budgetValue < 1000000) return false;
            break;
        }
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'any') {
        const appointment = lead.nextAppointment;
        const meetingDate = appointment?.start_time ? new Date(appointment.start_time) : null;

        if (!meetingDate) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        const nextWeekEnd = new Date(today);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);

        switch (filters.dateRange) {
          case 'today':
            if (meetingDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'tomorrow':
            if (meetingDate.toDateString() !== tomorrow.toDateString()) return false;
            break;
          case 'week':
            if (meetingDate < today || meetingDate > weekEnd) return false;
            break;
          case 'next_week':
            if (meetingDate < nextWeekStart || meetingDate > nextWeekEnd) return false;
            break;
          case 'past':
            if (meetingDate >= today) return false;
            break;
        }
      }

      return true;
    });
  }, [allLeads, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', budget: '', dateRange: '' });
  };

  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Лиды</h1>
              <p className="text-lg text-slate-500 mt-1">Все заявки и их статусы</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-slate-900">{filteredLeads.length}</p>
              <p className="text-base text-slate-500">Всего лидов</p>
            </div>
          </div>

          {/* Table with filters in headers */}
          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <p className="text-red-600 text-sm font-medium">
                Ошибка загрузки: {String(error)}
              </p>
            </Card>
          )}
          <LeadTable
            leads={filteredLeads}
            isLoading={isLoading || userLoading}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </AppShell>
  );
}

function parseBudgetValue(budgetText: string): number {
  if (!budgetText) return 0;
  const cleaned = budgetText.replace(/[^\d\s]/g, '').trim();
  const numbers = cleaned.split(/\s+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
}
