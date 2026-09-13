'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useLeads } from '@/hooks/useLeads';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRealtimeLeads } from '@/hooks/useRealtime';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadFormModal } from '@/components/leads/LeadFormModal';
import { Toast, useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { MeetingStatus } from '@/types';

const PAGE_SIZES = [10, 25, 50];

export default function LeadsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [filters, setFilters] = useState<{
    search: string;
    status: MeetingStatus | '';
    budget: string;
    dateRange: string;
  }>({
    search: '',
    status: '',
    budget: '',
    dateRange: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, showSuccess, showError, dismissToast } = useToast();

  const userRole = user?.profile?.role;
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

  // Fetch leads with pagination
  const { data: leadsData, isLoading, error } = useLeads({
    assignedTo: isManagerOrAdmin ? undefined : user?.id,
    search: filters.search,
    meetingStatus: filters.status || undefined,
    budget: filters.budget || undefined,
    dateRange: filters.dateRange || undefined,
    page,
    pageSize,
  });

  const pagination = leadsData?.pagination;
  useRealtimeLeads(user?.id);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to first page when filters change
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', budget: '', dateRange: '' });
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleSuccess = () => {
    showSuccess('Лид успешно создан');
  };

  const handleError = () => {
    showError('Не удалось создать лид');
  };

  const leads = leadsData?.data || [];
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

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
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-4xl font-bold text-slate-900">{total}</p>
                <p className="text-base text-slate-500">Всего лидов</p>
              </div>
              <Button onClick={() => setIsModalOpen(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Добавить лид
              </Button>
            </div>
          </div>

          {/* Filters */}
          <LeadFilters
            search={filters.search}
            status={filters.status}
            budget={filters.budget}
            dateRange={filters.dateRange}
            onSearchChange={(v) => handleFilterChange('search', v)}
            onStatusChange={(v) => handleFilterChange('status', v)}
            onBudgetChange={(v) => handleFilterChange('budget', v)}
            onDateRangeChange={(v) => handleFilterChange('dateRange', v)}
            onClear={handleClearFilters}
          />

          {/* Table with filters in headers */}
          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <p className="text-red-600 text-sm font-medium">
                Ошибка загрузки: {String(error)}
              </p>
            </Card>
          )}
          <LeadTable
            leads={leads}
            isLoading={isLoading || userLoading}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizes={PAGE_SIZES}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />

          {/* Create Lead Modal */}
          <LeadFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
          />

          {/* Toast notifications */}
          <Toast toasts={toasts} onDismiss={dismissToast} />
        </div>
      </div>
    </AppShell>
  );
}
