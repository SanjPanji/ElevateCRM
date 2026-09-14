import { supabase } from '@/lib/supabase/client';
import type { Note } from '@/types';

/**
 * Get notes for a lead
 */
export const getNotes = async (leadId: string) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select(
        `
        *,
        author:profiles(id, name, username)
      `
      )
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as Note[];
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return [];
  }
};

/**
 * Create a new note
 */
export const createNote = async (leadId: string, employeeId: string, text: string) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        lead_id: leadId,
        employee_id: employeeId,
        text,
      })
      .select(
        `
        *,
        author:profiles(id, name, username)
      `
      )
      .single();

    if (error) throw error;

    return data as Note;
  } catch (error) {
    console.error('Failed to create note:', error);
    throw error;
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId: string) => {
  try {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
};
