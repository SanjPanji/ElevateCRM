'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNotes, useCreateNote, useDeleteNote } from '@/hooks/useNotes';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { format } from 'date-fns';
import { Trash2, Send } from 'lucide-react';

interface LeadNotesProps {
  leadId: string;
}

export function LeadNotes({ leadId }: LeadNotesProps) {
  const [noteText, setNoteText] = useState('');
  const { user } = useCurrentUser();
  const { data: notes, isLoading } = useNotes(leadId);
  const { mutate: createNote, isPending: isCreating } = useCreateNote(leadId);
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote(leadId);

  const handleAddNote = () => {
    if (!noteText.trim() || !user?.id) return;

    createNote(
      { employeeId: user.id, text: noteText },
      {
        onSuccess: () => {
          setNoteText('');
        },
      }
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Activity & Notes</h3>

      {/* Add Note Form */}
      <div className="space-y-4 mb-8 pb-8 border-b border-slate-200">
        <Textarea
          placeholder="Add a note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={isCreating}
          className="resize-none"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAddNote}
            disabled={isCreating || !noteText.trim()}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-slate-200 rounded"></div>
              </div>
            ))}
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note: any) => (
            <div key={note.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-blue-600">
                  {note.author?.name?.charAt(0).toUpperCase() || note.author?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-900">{note.author?.name || note.author?.username}</p>
                  {user?.id === note.employee_id && (
                    <button
                      onClick={() => deleteNote(note.id)}
                      disabled={isDeleting}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  {format(new Date(note.created_at), 'PPP p')}
                </p>
                <p className="text-slate-700 whitespace-pre-wrap">{note.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-600 text-center py-8">No notes yet</p>
      )}
    </Card>
  );
}
