import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getLeadPipeline, getTodaysAppointments, getRecentActivity } from '@/lib/api/dashboard';

/**
 * Fetch dashboard statistics
 */
export const useDashboardStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['dashboard', 'stats', userId],
    queryFn: () => getDashboardStats(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch lead pipeline data
 */
export const useLeadPipeline = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['dashboard', 'pipeline', userId],
    queryFn: () => getLeadPipeline(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch today's appointments
 */
export const useTodaysAppointments = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['dashboard', 'appointments', 'today', userId],
    queryFn: () => getTodaysAppointments(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch recent activity (latest updated leads)
 */
export const useRecentActivity = (userId: string | undefined, limit = 8) => {
  return useQuery({
    queryKey: ['dashboard', 'activity', userId, limit],
    queryFn: () => getRecentActivity(userId!, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
