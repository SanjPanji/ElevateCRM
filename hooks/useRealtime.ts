import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

/**
 * Subscribe to real-time updates on leads table
 */
export const useRealtimeLeads = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to leads changes
    const subscription = supabase
      .channel(`public:leads:assigned_to=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `assigned_to=eq.${userId}`,
        },
        (payload) => {
          // Invalidate leads query to refetch
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
};

/**
 * Subscribe to real-time updates on appointments table
 */
export const useRealtimeAppointments = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`public:appointments:employee_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `employee_id=eq.${userId}`,
        },
        (payload) => {
          // Invalidate appointments queries
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'appointments'] });
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);
};

/**
 * Subscribe to real-time updates on notes table for a specific lead
 */
export const useRealtimeNotes = (leadId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) return;

    const subscription = supabase
      .channel(`public:notes:lead_id=eq.${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          // Invalidate notes query
          queryClient.invalidateQueries({ queryKey: ['notes', leadId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [leadId, queryClient]);
};

/**
 * Subscribe to real-time updates on a specific lead
 */
export const useRealtimeLead = (leadId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!leadId) return;

    const subscription = supabase
      .channel(`public:leads:id=eq.${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`,
        },
        (payload) => {
          // Invalidate specific lead query
          queryClient.invalidateQueries({ queryKey: ['leads', leadId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [leadId, queryClient]);
};
