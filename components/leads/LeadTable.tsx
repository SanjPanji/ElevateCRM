'use client';

import { Card } from '@/components/ui/card';
import { LeadStatusBadge } from './LeadStatusBadge';
import Link from 'next/link';
import { format } from 'date-fns';
import type { LeadWithDetails } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, University, Calendar } from 'lucide-react';

interface LeadTableProps {
  leads: LeadWithDetails[];
  isLoading?: boolean;
}

export function LeadTable({ leads, isLoading }: LeadTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  University
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Meeting Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Meeting
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-600">No leads found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                University
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Meeting Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Meeting
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Created
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {lead.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {lead.university || '-'}
                </td>
                <td className="px-6 py-4">
                  <LeadStatusBadge status={lead.meeting_status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {lead.meeting_start ? (
                    format(new Date(lead.meeting_start), 'MMM dd, HH:mm')
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
