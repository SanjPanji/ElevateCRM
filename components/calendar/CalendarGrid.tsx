'use client';

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import type { Appointment } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-400',
  no_show: 'bg-amber-400',
  rescheduled: 'bg-purple-400',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  currentMonth: Date;
  appointmentsByDate: Record<string, Appointment[]>;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function CalendarGrid({
  currentMonth,
  appointmentsByDate,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAY_NAMES.map((day) => (
          <div key={day} className="py-3 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayAppointments = appointmentsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isLastRow = idx >= days.length - 7;
          const isRightEdge = (idx + 1) % 7 === 0;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(day)}
              className={`min-h-24 p-2 text-left transition-colors relative ${
                !isLastRow ? 'border-b border-slate-100' : ''
              } ${
                !isRightEdge ? 'border-r border-slate-100' : ''
              } ${
                isSelected
                  ? 'bg-blue-50'
                  : isCurrentMonth
                  ? 'hover:bg-slate-50'
                  : 'bg-slate-50/50'
              }`}
            >
              {/* Day number */}
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium ${
                    isDayToday
                      ? 'bg-blue-600 text-white'
                      : isCurrentMonth
                      ? isSelected
                        ? 'text-blue-700 font-bold'
                        : 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Appointment dots/pills */}
              <div className="space-y-0.5">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`w-full text-left px-1.5 py-0.5 rounded text-xs font-medium text-white truncate ${
                      STATUS_COLORS[apt.status] || 'bg-slate-400'
                    }`}
                    title={(apt as any).lead?.name || 'Appointment'}
                  >
                    {format(new Date(apt.start_time), 'HH:mm')}{' '}
                    {(apt as any).lead?.name || 'Lead'}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-slate-400 pl-1">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
