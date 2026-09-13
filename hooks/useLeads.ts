import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeads,
  getLead,
  updateLeadMeetingStatus,
  updateLeadMeeting,
  assignLead,
  updateConsultantNotes,
  createLead,
} from '@/lib/api/leads';
import {
  createAppointment,
  getAppointmentsByLead,
  getAppointmentsByEmployee,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
} from '@/lib/api/appointments';
import type { MeetingStatus, Lead } from '@/types';

interface UseLeadsOptions {
  meetingStatus?: MeetingStatus;
  assignedTo?: string;
  search?: string;
  budget?: string;
  dateRange?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fetch multiple leads with pagination
 */
export const useLeads = (options: UseLeadsOptions = {}) => {
  return useQuery({
    queryKey: ['leads', options],
    queryFn: () => getLeads(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Create lead mutation
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadData: Partial<Lead>) => createLead(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

/**
 * Fetch single lead
 */
export const useLead = (leadId: string | undefined) => {
  return useQuery({
    queryKey: ['leads', leadId],
    queryFn: () => getLead(leadId!),
    enabled: !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Update lead meeting status mutation
 */
export const useUpdateLeadMeetingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: MeetingStatus }) =>
      updateLeadMeetingStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

/**
 * Update lead meeting times
 */
export const useUpdateLeadMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      meetingStart,
      meetingEnd,
      status,
    }: {
      leadId: string;
      meetingStart: string;
      meetingEnd: string;
      status?: MeetingStatus;
    }) => updateLeadMeeting(leadId, meetingStart, meetingEnd, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

/**
 * Assign lead to employee mutation
 */
export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, employeeId }: { leadId: string; employeeId: string }) =>
      assignLead(leadId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

/**
 * Update consultant notes
 */
export const useUpdateConsultantNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, notes }: { leadId: string; notes: string }) =>
      updateConsultantNotes(leadId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

/**
 * Hook for creating appointments (with Google Calendar integration)
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      employeeId,
      createdBy,
      startTime,
      endTime,
      summary,
      description,
    }: {
      leadId: string;
      employeeId: string;
      createdBy: string;
      startTime: string;
      endTime: string;
      summary?: string;
      description?: string;
    }) =>
      createAppointment({
        leadId,
        employeeId,
        createdBy,
        startTime,
        endTime,
        summary,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

/**
 * Hook for fetching appointments by lead
 */
export const useAppointmentsByLead = (leadId: string | undefined) => {
  return useQuery({
    queryKey: ['appointments', leadId],
    queryFn: () => getAppointmentsByLead(leadId!),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching appointments by employee
 */
export const useAppointmentsByEmployee = (
  employeeId: string | undefined,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['appointments', employeeId, startDate, endDate],
    queryFn: () => getAppointmentsByEmployee(employeeId!, startDate, endDate),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for updating appointment status
 */
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
    }: {
      appointmentId: string;
      status: string;
    }) => updateAppointmentStatus(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

/**
 * Hook for cancelling an appointment
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

/**
 * Hook for rescheduling an appointment
 */
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      newStartTime,
      newEndTime,
    }: {
      appointmentId: string;
      newStartTime: string;
      newEndTime: string;
    }) => rescheduleAppointment(appointmentId, newStartTime, newEndTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
