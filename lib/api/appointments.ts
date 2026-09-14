import { supabase } from '@/lib/supabase/client';
import type { Appointment } from '@/types';

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

interface CreateAppointmentParams {
  leadId: string;
  employeeId: string;
  createdBy: string;
  startTime: string;
  endTime: string;
  summary?: string;
  description?: string;
  idempotencyKey?: string;
}

interface CreateAppointmentResponse {
  success: boolean;
  appointment: Appointment;
  googleMeetUrl: string | null;
  conference_status?: string;
}

/**
 * Create a new appointment via Edge Function (with Google Calendar integration)
 */
export const createAppointment = async (
  params: CreateAppointmentParams
): Promise<CreateAppointmentResponse> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${FUNCTIONS_URL}/create-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create appointment');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create appointment:', error);
    throw error;
  }
};

/**
 * Get appointment details (includes refreshing pending Google Meet URL)
 */
export const getAppointment = async (appointmentId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${FUNCTIONS_URL}/get-appointment?id=${appointmentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch appointment');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch appointment:', error);
    throw error;
  }
};

/**
 * Get appointments for a lead
 */
export const getAppointmentsByLead = async (leadId: string): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        employee:profiles(id, name, username)
      `
      )
      .eq('lead_id', leadId)
      .order('start_time', { ascending: true });

    if (error) throw error;

    return (data || []) as Appointment[];
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
};

/**
 * Get appointments for an employee
 */
export const getAppointmentsByEmployee = async (
  employeeId: string,
  startDate?: string,
  endDate?: string
): Promise<Appointment[]> => {
  try {
    let query = supabase
      .from('appointments')
      .select(
        `
        *,
        lead:leads(id, name, phone),
        employee:profiles(id, name, username)
      `
      )
      .eq('employee_id', employeeId)
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as Appointment[];
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: string
): Promise<Appointment> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    return data as Appointment;
  } catch (error) {
    console.error('Failed to update appointment status:', error);
    throw error;
  }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId: string): Promise<Appointment> => {
  return updateAppointmentStatus(appointmentId, 'cancelled');
};

/**
 * Reschedule an appointment
 */
export const rescheduleAppointment = async (
  appointmentId: string,
  newStartTime: string,
  newEndTime: string
): Promise<Appointment> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        start_time: newStartTime,
        end_time: newEndTime,
        status: 'scheduled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    return data as Appointment;
  } catch (error) {
    console.error('Failed to reschedule appointment:', error);
    throw error;
  }
};
