'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';

export function Header() {
  const { user } = useCurrentUser();

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome, {user?.profile?.name?.split(' ')[0] || user?.profile?.username}!
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{user?.profile?.name || user?.profile?.username}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.profile?.role}</p>
        </div>
      </div>
    </div>
  );
}
