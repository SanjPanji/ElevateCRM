import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types';

/**
 * Get current authenticated user with profile
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile: profile as Profile | null,
  };
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  return supabase.auth.signOut();
};

/**
 * Sign up new user (for admin only in production)
 */
export const signUpUser = async (email: string, password: string, name: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: any | null, profile: Profile | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      callback(session.user, profile as Profile | null);
    } else {
      callback(null, null);
    }
  });
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};
