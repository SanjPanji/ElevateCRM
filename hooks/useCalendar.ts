import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import {
  getCalendarAppointments,
  getAllCalendarAppointments,
  groupAppointmentsByDate,
} from '@/lib/api/calendar';

/**
 * Hook to fetch appointments for a specific employee for a given month
 */
export const useCalendarAppointments = (
  employeeId: string | undefined,
  currentMonth: Date
) => {
  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd'T'00:00:00'Z'");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd'T'23:59:59'Z'");

  return useQuery({
    queryKey: ['calendar', employeeId, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const appointments = await getCalendarAppointments(employeeId!, startDate, endDate);
      return {
        appointments,
        byDate: groupAppointmentsByDate(appointments),
      };
    },
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch all appointments for a given month (admin/manager)
 */
export const useAllCalendarAppointments = (currentMonth: Date) => {
  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd'T'00:00:00'Z'");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd'T'23:59:59'Z'");

  return useQuery({
    queryKey: ['calendar-all', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const appointments = await getAllCalendarAppointments(startDate, endDate);
      return {
        appointments,
        byDate: groupAppointmentsByDate(appointments),
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};
