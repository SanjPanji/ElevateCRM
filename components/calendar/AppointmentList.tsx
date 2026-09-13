'use client';

import { format } from 'date-fns';
import { Video, Phone, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { Appointment } from '@/types';

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  scheduled: { label: 'Scheduled', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500 bg-red-50' },
  no_show: { label: 'No Show', icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
  rescheduled: { label: 'Rescheduled', icon: RefreshCw, color: 'text-purple-600 bg-purple-50' },
};

interface AppointmentListProps {
  date: Date;
  appointments: Appointment[];
}

export function AppointmentList({ date, appointments }: AppointmentListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="font-semibold text-slate-900">{format(date, 'EEEE, MMMM d')}</p>
        <p className="text-sm text-slate-500 mt-0.5">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {appointments.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No appointments</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const meta = STATUS_META[apt.status] || STATUS_META.scheduled;
            const StatusIcon = meta.icon;
            const lead = (apt as any).lead;
            const employee = (apt as any).employee;

            return (
              <div key={apt.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                {/* Time row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {format(new Date(apt.start_time), 'HH:mm')} –{' '}
                        {format(new Date(apt.end_time), 'HH:mm')}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </div>

                    {/* Lead name */}
                    {lead && (
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline truncate block"
                      >
                        {lead.name || 'Unnamed Lead'}
                      </Link>
                    )}

                    {/* Employee */}
                    {employee && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        with {employee.name || employee.username}
                      </p>
                    )}

                    {/* Phone */}
                    {lead?.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 mt-1"
                      >
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    )}
                  </div>

                  {/* Meet link */}
                  {apt.google_meet_url && (
                    <a
                      href={apt.google_meet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
