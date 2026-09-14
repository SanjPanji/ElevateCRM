import { supabase } from '@/lib/supabase/client';
import type { Lead, LeadWithDetails, MeetingStatus } from '@/types';

interface GetLeadsOptions {
  meetingStatus?: MeetingStatus;
  assignedTo?: string;
  search?: string;
  budget?: string;
  dateRange?: string;
  page?: number;
  pageSize?: number;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface GetLeadsResult {
  data: LeadWithDetails[];
  pagination: Pagination;
}

/**
 * Get leads with filters and pagination
 */
export const getLeads = async (options: GetLeadsOptions = {}): Promise<GetLeadsResult> => {
  const {
    meetingStatus,
    assignedTo,
    search,
    budget,
    dateRange,
    page = 1,
    pageSize = 25,
  } = options;

  try {
    // Build base query with count
    let query = supabase
      .from('leads')
      .select(
        `
        *,
        assigned_employee:profiles!left(id, name, username, role),
        appointments:appointments(id, start_time, end_time, status, google_meet_url, google_event_id)
      `
      )
      .order('created_at', { ascending: false });

    if (meetingStatus) {
      query = query.eq('meeting_status', meetingStatus);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${options.search}%,university.ilike.%${options.search}%`
      );
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to fetch leads:', error);
      throw error;
    }

    // Get the next upcoming appointment for each lead
    const leadsWithMeetings = (data || []).map((lead: any) => {
      const appointments = lead.appointments || [];
      const upcomingAppointment = appointments
        .filter((apt: any) => apt.status === 'scheduled' && new Date(apt.start_time) >= new Date())
        .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

      return {
        ...lead,
        nextAppointment: upcomingAppointment || null,
      };
    });

    const total = count || leadsWithMeetings.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: leadsWithMeetings as LeadWithDetails[],
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, totalPages),
      },
    };
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    throw error;
  }
};

/**
 * Get single lead with all details
 */
export const getLead = async (leadId: string) => {
  try {
    // First get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(
        `
        *,
        assigned_employee:profiles(id, name, username, role, is_active)
      `
      )
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Lead query error:', leadError);
      throw leadError;
    }

    if (!lead) {
      return null;
    }

    // Then get notes separately with LEFT JOIN
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select(`
        *,
        author:profiles(id, name, username)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('Notes query error:', notesError);
      // Continue without notes
    }

    return {
      ...lead,
      notes: notes || []
    } as LeadWithDetails;
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

/**
 * Create a new lead
 */
export const createLead = async (leadData: Partial<Lead>) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        meeting_status: 'not_scheduled',
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data as Lead;
  } catch (error) {
    console.error('Failed to create lead:', error);
    throw error;
  }
};
