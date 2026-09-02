'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';

export default function EmployeesPage() {
  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-600 mt-2">Manage your team members</p>
          <Card className="mt-8 p-6 text-center">
            <p className="text-slate-500">Employee management will be available soon</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
