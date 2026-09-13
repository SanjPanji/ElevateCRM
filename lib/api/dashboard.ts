import { supabase } from '@/lib/supabase/client';
import type { DashboardStats, Lead } from '@/types';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    // Get total leads count
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId);

    // Get new leads (not_scheduled status)
    const { count: newLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('meeting_status', 'not_scheduled');

    // Get today's meetings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: todaysCalls } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .gte('meeting_start', today.toISOString())
      .lt('meeting_start', tomorrow.toISOString())
      .eq('meeting_status', 'scheduled');

    // Get completed meetings
    const { count: completedCalls } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('meeting_status', 'completed');

    return {
      total_leads: totalLeads || 0,
      new_leads: newLeads || 0,
      todays_calls: todaysCalls || 0,
      completed_calls: completedCalls || 0,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return {
      total_leads: 0,
      new_leads: 0,
      todays_calls: 0,
      completed_calls: 0,
    };
  }
};

/**
 * Get lead pipeline data grouped by meeting_status
 */
export const getLeadPipeline = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, meeting_status, assigned_to')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by meeting_status
    const pipeline = {
      not_scheduled: [] as Lead[],
      scheduled: [] as Lead[],
      completed: [] as Lead[],
    };

    (data as Lead[]).forEach((lead) => {
      if (lead.meeting_status in pipeline) {
        pipeline[lead.meeting_status as keyof typeof pipeline].push(lead);
      }
    });

    return pipeline;
  } catch (error) {
    console.error('Failed to fetch lead pipeline:', error);
    return null;
  }
};

/**
 * Get today's meetings from leads table
 */
export const getTodaysAppointments = async (userId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('leads')
      .select(
        `
        id,
        name,
        phone,
        meeting_status,
        meeting_start,
        meeting_end
      `
      )
      .eq('assigned_to', userId)
      .eq('meeting_status', 'scheduled')
      .gte('meeting_start', today.toISOString())
      .lt('meeting_start', tomorrow.toISOString())
      .order('meeting_start', { ascending: true });

    if (error) throw error;

    return (data as any[]) || [];
  } catch (error) {
    console.error('Failed to fetch todays appointments:', error);
    return [];
  }
};

/**
 * Get recent activity: latest leads ordered by updated_at
 */
export const getRecentActivity = async (userId: string, limit = 8) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(
        `
        id,
        name,
        phone,
        meeting_status,
        created_at,
        updated_at,
        assigned_employee:profiles!left(id, name, username)
      `
      )
      .eq('assigned_to', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data as any[]) || [];
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return [];
  }
};
