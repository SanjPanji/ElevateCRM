'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useLead } from '@/hooks/useLeads';
import { useRealtimeLead, useRealtimeNotes } from '@/hooks/useRealtime';
import { LeadDetails } from '@/components/leads/LeadDetails';
import { LeadNotes } from '@/components/leads/LeadNotes';
import { LeadAnswers } from '@/components/leads/LeadAnswers';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function LeadDetailsPage({ params }: { params: { id: string } }) {
  const { data: lead, isLoading } = useLead(params.id);

  // Set up realtime subscriptions
  useRealtimeLead(params.id);
  useRealtimeNotes(params.id);

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading lead details...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!lead) {
    return (
      <AppShell>
        <div className="p-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-slate-600 mb-4">Lead not found</p>
            <Link href="/leads">
              <Button variant="ghost">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Leads
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/leads">
                <Button variant="ghost" className="mb-4">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Leads
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">{lead.name}</h1>
              <p className="text-slate-600 mt-1">Lead details and activity</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Lead Details */}
              <LeadDetails lead={lead} />

              {/* Notes */}
              <LeadNotes leadId={lead.id} />
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6">
              {/* Form Data */}
              {lead.raw_tally_data && Object.keys(lead.raw_tally_data).length > 0 && (
                <LeadAnswers lead={lead} />
              )}

              {/* Quick Actions - Coming Soon */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
                <p className="text-sm text-slate-600">More actions coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
