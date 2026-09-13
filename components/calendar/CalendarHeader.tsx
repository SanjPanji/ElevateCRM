'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  totalAppointments: number;
}

export function CalendarHeader({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  totalAppointments,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {totalAppointments} appointment{totalAppointments !== 1 ? 's' : ''} this month
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={onPrevMonth}
            className="px-3 py-2 hover:bg-slate-50 transition-colors text-slate-600"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-200" />
          <button
            onClick={onNextMonth}
            className="px-3 py-2 hover:bg-slate-50 transition-colors text-slate-600"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
