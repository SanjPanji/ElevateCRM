'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, Zap, Activity } from 'lucide-react';
import Link from 'next/link';

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  not_scheduled: {
    label: 'New Lead',
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  scheduled: {
    label: 'Meeting Scheduled',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  completed: {
    label: 'Meeting Completed',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
};

interface ActivityItem {
  id: string;
  name: string | null;
  meeting_status: string;
  updated_at: string;
  assigned_employee?: { name: string; username: string } | null;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading?: boolean;
}

export function ActivityFeed({ items, isLoading }: ActivityFeedProps) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Activity className="w-4 h-4 text-slate-500" />
        <h3 className="font-semibold text-slate-900">Recent Activity</h3>
      </div>

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No recent activity</p>
          </div>
        ) : (
          items.map((item) => {
            const meta = STATUS_META[item.meeting_status] || STATUS_META.not_scheduled;
            const Icon = meta.icon;

            return (
              <div key={item.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/leads/${item.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-blue-600 truncate"
                    >
                      {item.name || 'Unnamed Lead'}
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {meta.label} ·{' '}
                    {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
