import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types';

interface CurrentUser {
  id: string;
  email: string;
  profile: Profile | null;
}

/**
 * Hook to get current authenticated user with profile
 */
export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!mounted) return;

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          profile: profile as Profile | null,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

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

        if (!mounted) return;

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          profile: profile as Profile | null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading, error };
};
