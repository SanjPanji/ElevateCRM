import { supabase } from '@/lib/supabase/client';
import type { Lead, LeadWithDetails, MeetingStatus } from '@/types';

interface GetLeadsOptions {
  meetingStatus?: MeetingStatus;
  assignedTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get leads with filters
 */
export const getLeads = async (options: GetLeadsOptions = {}) => {
  try {
    let query = supabase
      .from('leads')
      .select(
        `
        *,
        assigned_employee:profiles(id, name, username, role)
      `
      )
      .order('created_at', { ascending: false });

    if (options.meetingStatus) {
      query = query.eq('meeting_status', options.meetingStatus);
    }

    if (options.assignedTo) {
      query = query.eq('assigned_to', options.assignedTo);
    }

    if (options.search) {
      query = query.or(
        `name.ilike.%${options.search}%,phone.ilike.%${options.search}%,university.ilike.%${options.search}%`
      );
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as LeadWithDetails[];
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return [];
  }
};

/**
 * Get single lead with all details
 */
export const getLead = async (leadId: string) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(
        `
        *,
        assigned_employee:profiles(id, name, username, role, is_active),
        notes:notes(*, author:profiles(id, name, username, avatar_url))
      `
      )
      .eq('id', leadId)
      .single();

    if (error) throw error;

    return data as LeadWithDetails;
  } catch (error) {
    console.error('Failed to fetch lead:', error);
    return null;
  }
};

/**
 * Update lead meeting status
 */
export const updateLeadMeetingStatus = async (leadId: string, status: MeetingStatus) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ meeting_status: status, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return data as Lead;
  } catch (error) {
    console.error('Failed to update lead status:', error);
    throw error;
  }
};

/**
 * Update meeting times
 */
export const updateLeadMeeting = async (
  leadId: string,
  meetingStart: string,
  meetingEnd: string,
  status: MeetingStatus = 'scheduled'
) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        meeting_start: meetingStart,
        meeting_end: meetingEnd,
        meeting_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return data as Lead;
  } catch (error) {
    console.error('Failed to update meeting:', error);
    throw error;
  }
};

/**
 * Assign lead to employee
 */
export const assignLead = async (leadId: string, employeeId: string) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ assigned_to: employeeId, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return data as Lead;
  } catch (error) {
    console.error('Failed to assign lead:', error);
    throw error;
  }
};

/**
 * Update consultant notes
 */
export const updateConsultantNotes = async (leadId: string, notes: string) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ consultant_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return data as Lead;
  } catch (error) {
    console.error('Failed to update consultant notes:', error);
    throw error;
  }
};
