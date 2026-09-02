'use client';

import { Card } from '@/components/ui/card';
import type { LeadWithDetails } from '@/types';
import { FileText } from 'lucide-react';

interface LeadAnswersProps {
  lead: LeadWithDetails;
}

export function LeadAnswers({ lead }: LeadAnswersProps) {
  const rawData = lead.raw_tally_data;

  if (!rawData || Object.keys(rawData).length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Form Data
        </h3>
        <p className="text-slate-600">No form data available</p>
      </Card>
    );
  }

  // Convert raw_tally_data to array of entries for display
  const entries = Object.entries(rawData).filter(([key]) => !key.startsWith('_'));

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Form Data
        </h3>
        <p className="text-slate-600">No form data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Form Data
      </h3>

      <div className="space-y-4">
        {entries.map(([key, value]) => (
          <div key={key} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
            <label className="text-sm font-medium text-slate-500">
              {/* Format key for display: convert snake_case to Title Case */}
              {key
                .replace(/_/g, ' ')
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/^\w/, (c) => c.toUpperCase())}
            </label>
            <div className="mt-2">
              {typeof value === 'string' ? (
                <p className="text-base text-slate-900">{value}</p>
              ) : Array.isArray(value) ? (
                <ul className="list-disc list-inside space-y-1">
                  {value.map((item, idx) => (
                    <li key={idx} className="text-base text-slate-900">
                      {String(item)}
                    </li>
                  ))}
                </ul>
              ) : value !== null && value !== undefined ? (
                <p className="text-base text-slate-900">{String(value)}</p>
              ) : (
                <p className="text-base text-slate-400 italic">No response</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
