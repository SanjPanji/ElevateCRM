'use client';

import { useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { AppShell } from '@/components/layout/AppShell';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { AppointmentList } from '@/components/calendar/AppointmentList';
import { useCalendarAppointments, useAllCalendarAppointments } from '@/hooks/useCalendar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const userRole = user?.profile?.role;
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';

  // For admin/manager: show all appointments; for employee: show own
  const { data: myData, isLoading: myLoading } = useCalendarAppointments(
    !isManagerOrAdmin ? user?.id : undefined,
    currentMonth
  );

  const { data: allData, isLoading: allLoading } = useAllCalendarAppointments(currentMonth);

  const isLoading = userLoading || myLoading || (isManagerOrAdmin && allLoading);

  const calendarData = isManagerOrAdmin ? allData : myData;
  const appointmentsByDate = calendarData?.byDate || {};
  const allAppointments = calendarData?.appointments || [];

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedAppointments = selectedDateKey
    ? (appointmentsByDate[selectedDateKey] || [])
    : [];

  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          {userLoading ? (
            <Skeleton className="h-16 w-80" />
          ) : (
            <CalendarHeader
              currentMonth={currentMonth}
              onPrevMonth={() => setCurrentMonth((d) => subMonths(d, 1))}
              onNextMonth={() => setCurrentMonth((d) => addMonths(d, 1))}
              onToday={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
              totalAppointments={allAppointments.length}
            />
          )}

          {/* Main layout: calendar + side panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar grid */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <Skeleton className="h-[600px] rounded-2xl" />
              ) : (
                <CalendarGrid
                  currentMonth={currentMonth}
                  appointmentsByDate={appointmentsByDate}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              )}
            </div>

            {/* Day detail panel */}
            <div>
              {selectedDate && (
                isLoading ? (
                  <Skeleton className="h-64 rounded-2xl" />
                ) : (
                  <AppointmentList
                    date={selectedDate}
                    appointments={selectedAppointments}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
