import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { getAppointment } from '@/lib/api/appointments';
import type { Appointment } from '@/types';

// Fetch all appointments
const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      lead:leads(id, name, phone),
      employee:profiles!appointments_employee_id_fkey(id, name, username),
      creator:profiles!appointments_created_by_fkey(id, name, username)
    `)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data;
};

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });
};

export const useRefreshAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: getAppointment,
    onSuccess: (data) => {
      // Update the specific appointment in the cache or invalidate
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-all'] });
    }
  });
};
