'use client';

import { Card } from '@/components/ui/card';
import { useLeadPipeline } from '@/hooks/useDashboard';
import Link from 'next/link';

const statusConfig = {
  not_scheduled: { label: 'Not Scheduled', color: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-l-gray-400' },
  scheduled: { label: 'Scheduled', color: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-l-orange-400' },
  completed: { label: 'Completed', color: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-l-green-400' },
};

const pipelineColumns = [
  'not_scheduled',
  'scheduled',
  'completed',
] as const;

interface LeadPipelineProps {
  userId: string | undefined;
}

export function LeadPipeline({ userId }: LeadPipelineProps) {
  const { data: pipeline, isLoading } = useLeadPipeline(userId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!pipeline) {
    return (
      <Card className="p-6">
        <p className="text-slate-600">Unable to load pipeline data</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Lead Pipeline</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pipelineColumns.map((status) => {
          const leads = pipeline?.[status] || [];
          const config = statusConfig[status];

          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{config.label}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color} ${config.textColor}`}>
                  {leads.length}
                </span>
              </div>

              <div className="space-y-2">
                {leads.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No leads</p>
                ) : (
                  leads.slice(0, 5).map((lead: any) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className={`block p-3 rounded-lg border-l-4 hover:shadow-md transition-shadow ${config.color} ${config.borderColor} cursor-pointer`}
                    >
                      <p className="font-medium text-sm text-slate-900 line-clamp-1">
                        {lead.name || 'Unnamed Lead'}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-1">{lead.phone || 'No phone'}</p>
                    </Link>
                  ))
                )}

                {leads.length > 5 && (
                  <p className="text-xs text-slate-500 text-center py-2">
                    +{leads.length - 5} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
