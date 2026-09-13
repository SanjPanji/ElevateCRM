import { supabase } from '@/lib/supabase/client';
import type { Appointment } from '@/types';

/**
 * Get appointments for an employee within a date range
 */
export const getCalendarAppointments = async (
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        lead:leads(id, name, phone),
        employee:profiles(id, name, username)
      `
      )
      .eq('employee_id', employeeId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (error) throw error;

    return (data || []) as Appointment[];
  } catch (error) {
    console.error('Failed to fetch calendar appointments:', error);
    return [];
  }
};

/**
 * Get all appointments within a date range (admin/manager view)
 */
export const getAllCalendarAppointments = async (
  startDate: string,
  endDate: string
): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        lead:leads(id, name, phone),
        employee:profiles(id, name, username)
      `
      )
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (error) throw error;

    return (data || []) as Appointment[];
  } catch (error) {
    console.error('Failed to fetch all calendar appointments:', error);
    return [];
  }
};

/**
 * Group appointments by date string (YYYY-MM-DD)
 */
export const groupAppointmentsByDate = (
  appointments: Appointment[]
): Record<string, Appointment[]> => {
  const grouped: Record<string, Appointment[]> = {};

  appointments.forEach((apt) => {
    const dateKey = apt.start_time.slice(0, 10); // YYYY-MM-DD
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(apt);
  });

  return grouped;
};
