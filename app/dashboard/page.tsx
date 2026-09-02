'use client';

import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { LeadPipeline } from '@/components/dashboard/LeadPipeline';
import { TodayAppointments } from '@/components/dashboard/TodayAppointments';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRealtimeLeads, useRealtimeAppointments } from '@/hooks/useRealtime';
import { Users, Zap, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats(user?.id);

  // Set up realtime subscriptions
  useRealtimeLeads(user?.id);
  useRealtimeAppointments(user?.id);

  if (userLoading) {
    return (
      <AppShell>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Total Leads"
              value={stats?.total_leads ?? 0}
            />
            <StatCard
              icon={Zap}
              label="New Leads"
              value={stats?.new_leads ?? 0}
            />
            <StatCard
              icon={Clock}
              label="Today's Calls"
              value={stats?.todays_calls ?? 0}
            />
            <StatCard
              icon={CheckCircle}
              label="Completed Calls"
              value={stats?.completed_calls ?? 0}
            />
          </div>

          {/* Pipeline and Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LeadPipeline userId={user?.id} />
            </div>
            <div>
              <TodayAppointments userId={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
