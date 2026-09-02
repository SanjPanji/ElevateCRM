'use client';

import { Card } from '@/components/ui/card';
import { useTodaysAppointments } from '@/hooks/useDashboard';
import { Video, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface TodayAppointmentsProps {
  userId: string | undefined;
}

export function TodayAppointments({ userId }: TodayAppointmentsProps) {
  const { data: appointments, isLoading } = useTodaysAppointments(userId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Today's Meetings</h3>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No meetings scheduled for today</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Today's Meetings</h3>

      <div className="space-y-3">
        {appointments.map((appointment: any) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {appointment.name || 'Unknown Client'}
                    </p>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                      {appointment.meeting_status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {appointment.phone || 'No phone'}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    {appointment.meeting_start && format(new Date(appointment.meeting_start), 'HH:mm')}
                    {appointment.meeting_end && ` - ${format(new Date(appointment.meeting_end), 'HH:mm')}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/leads/${appointment.id}`}>
                <button className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium">
                  View
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
