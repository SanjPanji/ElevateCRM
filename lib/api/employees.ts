import { supabase } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/types';

/**
 * Get all employee profiles
 */
export const getEmployees = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []) as Profile[];
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
};

/**
 * Get a single employee profile
 */
export const getEmployee = async (id: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data as Profile;
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return null;
  }
};

/**
 * Update employee role (admin only)
 */
export const updateEmployeeRole = async (
  id: string,
  role: UserRole
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

/**
 * Toggle employee active status
 */
export const toggleEmployeeActive = async (
  id: string,
  isActive: boolean
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

/**
 * Get lead counts per employee
 */
export const getEmployeeLeadCounts = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('assigned_to');

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach((lead: any) => {
      if (lead.assigned_to) {
        counts[lead.assigned_to] = (counts[lead.assigned_to] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error('Failed to fetch lead counts:', error);
    return {};
  }
};
