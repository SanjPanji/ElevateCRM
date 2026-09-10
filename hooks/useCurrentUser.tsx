'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types';

interface CurrentUser {
  id: string;
  email: string;
  profile: Profile | null;
}

interface UserContextValue {
  user: CurrentUser | null;
  loading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

let cachedUser: CurrentUser | null = null;
let loadingPromise: Promise<CurrentUser | null> | null = null;

const fetchUser = async (): Promise<CurrentUser | null> => {
  if (cachedUser) return cachedUser;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        cachedUser = null;
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      cachedUser = {
        id: authUser.id,
        email: authUser.email || '',
        profile: profile as Profile | null,
      };

      return cachedUser;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const u = await fetchUser();
        if (!mounted) return;
        setUser(u);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        cachedUser = {
          id: session.user.id,
          email: session.user.email || '',
          profile: profile as Profile | null,
        };
        setUser(cachedUser);
      } else {
        cachedUser = null;
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within UserProvider');
  }
  return context;
};
