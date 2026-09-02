'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useLeads } from '@/hooks/useLeads';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRealtimeLeads } from '@/hooks/useRealtime';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { Card } from '@/components/ui/card';

export default function LeadsPage() {
  const { user } = useCurrentUser();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Fetch leads - use user's assigned leads
  const { data: allLeads, isLoading } = useLeads({
    assignedTo: user?.id,
  });

  // Set up realtime subscription
  useRealtimeLeads(user?.id);

  // Filter leads locally (search and status)
  const filteredLeads = useMemo(() => {
    if (!allLeads) return [];

    return allLeads.filter((lead) => {
      // Status filter
      if (status && lead.meeting_status !== status) return false;

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower) ||
          lead.university?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [allLeads, search, status]);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
  };

  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
              <p className="text-slate-600 mt-1">Manage your sales pipeline</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{filteredLeads.length}</p>
              <p className="text-slate-600 text-sm">Total leads</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <LeadFilters
              search={search}
              status={status}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onClear={handleClearFilters}
            />
          </Card>

          {/* Table */}
          <LeadTable leads={filteredLeads} isLoading={isLoading} />
        </div>
      </div>
    </AppShell>
  );
}
