import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote, deleteNote } from '@/lib/api/notes';

/**
 * Fetch notes for a lead
 */
export const useNotes = (leadId: string | undefined) => {
  return useQuery({
    queryKey: ['notes', leadId],
    queryFn: () => getNotes(leadId!),
    enabled: !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Create note mutation
 */
export const useCreateNote = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, text }: { employeeId: string; text: string }) =>
      createNote(leadId, employeeId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', leadId] });
    },
  });
};

/**
 * Delete note mutation
 */
export const useDeleteNote = (leadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', leadId] });
    },
  });
};
