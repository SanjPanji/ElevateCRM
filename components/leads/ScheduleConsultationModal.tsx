'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateLeadMeeting } from '@/hooks/useLeads';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Calendar, Clock, User, Loader2, X } from 'lucide-react';

interface ScheduleConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
}

export function ScheduleConsultationModal({
  isOpen,
  onClose,
  leadId,
  leadName,
}: ScheduleConsultationModalProps) {
  const { user } = useCurrentUser();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<'15' | '30' | '45' | '60'>('30');

  const { mutate: updateLeadMeeting, isPending: isUpdating } = useUpdateLeadMeeting();

  // Generate time options (9AM to 6PM, 30 min increments)
  const timeOptions = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9; // Start at 9AM
    const minute = i % 2 === 0 ? 0 : 30;
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  });

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    // Parse time string like "2:30 PM"
    const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return;

    let [, hours, minutes, ampm] = timeMatch;
    let hour = parseInt(hours);
    const minute = parseInt(minutes);

    // Convert to 24-hour format
    if (ampm.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }

    // Parse date
    const [year, month, day] = selectedDate.split('-').map(Number);

    // Create start time
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + parseInt(duration));

    updateLeadMeeting(
      {
        leadId,
        meetingStart: startDate.toISOString(),
        meetingEnd: endDate.toISOString(),
        status: 'scheduled',
      },
      {
        onSuccess: () => {
          onClose();
          setSelectedDate('');
          setSelectedTime('');
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
        <div className="bg-background border rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Schedule Meeting
              </h2>
              <p className="text-sm text-muted-foreground">
                Schedule a meeting with {leadName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Client</span>
                </div>
                <Input value={leadName} disabled className="bg-muted" />
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isUpdating || !selectedDate || !selectedTime}
                className="flex-1"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? 'Scheduling...' : 'Schedule'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
