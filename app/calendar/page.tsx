'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <AppShell>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">Calendar implementation coming soon...</p>
          <Card className="mt-8 p-6 text-center">
            <p className="text-slate-500">Calendar view will be available soon</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
