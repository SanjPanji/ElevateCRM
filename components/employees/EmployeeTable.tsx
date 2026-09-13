'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown,
  Users,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  User,
} from 'lucide-react';
import type { Profile, UserRole } from '@/types';

interface EmployeeTableProps {
  employees: Profile[];
  leadCounts: Record<string, number>;
  isLoading?: boolean;
  currentUserRole?: UserRole;
  onRoleChange?: (id: string, role: UserRole) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}

const roleMeta: Record<UserRole, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Shield },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700', icon: Briefcase },
  employee: { label: 'Employee', color: 'bg-slate-100 text-slate-600', icon: User },
};

const roles: UserRole[] = ['admin', 'manager', 'employee'];

function RoleDropdown({
  currentRole,
  onSelect,
  disabled,
}: {
  currentRole: UserRole;
  onSelect: (role: UserRole) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = roleMeta[currentRole];
  const Icon = meta.icon;

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${meta.color} ${!disabled ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      >
        <Icon className="w-3 h-3" />
        {meta.label}
        {!disabled && <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 min-w-36">
            {roles.map((role) => {
              const m = roleMeta[role];
              const RoleIcon = m.icon;
              return (
                <button
                  key={role}
                  onClick={() => {
                    onSelect(role);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    role === currentRole ? 'font-medium text-blue-600' : 'text-slate-700'
                  }`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function EmployeeTable({
  employees,
  leadCounts,
  isLoading,
  currentUserRole,
  onRoleChange,
  onToggleActive,
}: EmployeeTableProps) {
  const isAdmin = currentUserRole === 'admin';

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Employee', 'Username', 'Role', 'Leads', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array(5).fill(0).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-4"><Skeleton className="h-8 w-40" /></td>
                <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-4"><Skeleton className="h-6 w-20" /></td>
                <td className="px-4 py-4"><Skeleton className="h-4 w-10" /></td>
                <td className="px-4 py-4"><Skeleton className="h-6 w-16" /></td>
                <td className="px-4 py-4"><Skeleton className="h-8 w-20" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No employees found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Username</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Leads</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
            </th>
            <th className="px-4 py-3 text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((emp) => {
            const initials = emp.name
              ? emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : emp.username?.[0]?.toUpperCase() || '?';
            const leadCount = leadCounts[emp.id] || 0;
            const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500'];
            const colorIndex = emp.id.charCodeAt(0) % avatarColors.length;
            const avatarColor = avatarColors[colorIndex];

            return (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                {/* Employee */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-bold text-white">{initials}</span>
                    </div>
                    <span className="font-medium text-slate-900">{emp.name || emp.username}</span>
                  </div>
                </td>

                {/* Username */}
                <td className="px-4 py-4 text-sm text-slate-500">
                  @{emp.username}
                </td>

                {/* Role */}
                <td className="px-4 py-4">
                  <RoleDropdown
                    currentRole={emp.role as UserRole}
                    onSelect={(role) => onRoleChange?.(emp.id, role)}
                    disabled={!isAdmin}
                  />
                </td>

                {/* Leads */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{leadCount}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  {emp.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5" />
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleActive?.(emp.id, !emp.is_active)}
                      className="text-xs"
                    >
                      {emp.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
