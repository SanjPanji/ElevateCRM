'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="bg-slate-50 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
