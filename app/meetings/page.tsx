'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAppointments, useRefreshAppointment } from '@/hooks/useAppointments';
import { Video, RefreshCw, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';

function MeetButton({ appointment }: { appointment: any }) {
  const { mutate: refreshAppointment, isPending } = useRefreshAppointment();
  
  if (appointment.google_meet_url) {
    return (
      <a
        href={appointment.google_meet_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        <Video className="w-4 h-4" />
        Join Google Meet
      </a>
    );
  }

  if (appointment.google_event_id && appointment.created_by) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => refreshAppointment(appointment.id)}
        className="inline-flex items-center gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {isPending ? 'Creating Meet...' : 'Refresh Meet URL'}
      </Button>
    );
  }

  return (
    <span className="text-sm text-slate-400 italic">No Meet link</span>
  );
}

export default function MeetingsPage() {
  const { data: appointments, isLoading } = useAppointments();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meetings</h1>
          <p className="text-sm text-slate-500 mt-1">
            View and join your scheduled consultations
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Date & Time</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Client</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Consultant</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Created By</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-32 rounded-md" /></td>
                  </tr>
                ))
              ) : appointments?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No meetings found
                  </td>
                </tr>
              ) : (
                appointments?.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {format(new Date(apt.start_time), 'dd MMM yyyy')}
                          </div>
                          <div className="text-slate-500">
                            {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {apt.lead ? (
                        <Link href={`/leads/${apt.lead_id}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                          {apt.lead.name || 'Unknown Client'}
                        </Link>
                      ) : (
                        <span className="text-slate-500">Deleted Lead</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {apt.employee?.name || apt.employee?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {apt.creator?.name || apt.creator?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <MeetButton appointment={apt} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
