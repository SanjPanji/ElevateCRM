import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmployees,
  getEmployee,
  updateEmployeeRole,
  toggleEmployeeActive,
  getEmployeeLeadCounts,
} from '@/lib/api/employees';
import type { UserRole } from '@/types';

/**
 * Hook to fetch all employees
 */
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single employee
 */
export const useEmployee = (id: string | undefined) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch lead counts per employee
 */
export const useEmployeeLeadCounts = () => {
  return useQuery({
    queryKey: ['employee-lead-counts'],
    queryFn: getEmployeeLeadCounts,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Mutation to update employee role
 */
export const useUpdateEmployeeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateEmployeeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Mutation to toggle employee active status
 */
export const useToggleEmployeeActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleEmployeeActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
