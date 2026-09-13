'use client';

import { AppShell } from '@/components/layout/AppShell';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { useEmployees, useEmployeeLeadCounts, useUpdateEmployeeRole, useToggleEmployeeActive } from '@/hooks/useEmployees';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, Shield } from 'lucide-react';
import type { UserRole } from '@/types';

function StatPill({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${color}`}>
      <div className="p-2 rounded-lg bg-white/60">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium opacity-70">{label}</p>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: leadCounts = {} } = useEmployeeLeadCounts();
  const updateRole = useUpdateEmployeeRole();
  const toggleActive = useToggleEmployeeActive();

  const isLoading = userLoading || empLoading;
  const userRole = user?.profile?.role as UserRole | undefined;
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.is_active).length;
  const adminCount = employees.filter((e) => e.role === 'admin').length;

  const handleRoleChange = (id: string, role: UserRole) => {
    updateRole.mutate({ id, role });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActive.mutate({ id, isActive });
  };

  if (userLoading) {
    return (
      <AppShell>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Employees</h1>
              <p className="text-lg text-slate-500 mt-1">Manage your team members and their roles</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : (
              <>
                <StatPill
                  label="Total Employees"
                  value={totalEmployees}
                  icon={Users}
                  color="border-slate-200 text-slate-700 bg-slate-50"
                />
                <StatPill
                  label="Active"
                  value={activeEmployees}
                  icon={UserCheck}
                  color="border-emerald-200 text-emerald-700 bg-emerald-50"
                />
                <StatPill
                  label="Admins"
                  value={adminCount}
                  icon={Shield}
                  color="border-purple-200 text-purple-700 bg-purple-50"
                />
              </>
            )}
          </div>

          {/* Table */}
          <EmployeeTable
            employees={employees}
            leadCounts={leadCounts}
            isLoading={isLoading}
            currentUserRole={userRole}
            onRoleChange={handleRoleChange}
            onToggleActive={handleToggleActive}
          />
        </div>
      </div>
    </AppShell>
  );
}
