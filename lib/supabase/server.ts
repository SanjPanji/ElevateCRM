import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role key
 * ONLY use this in Edge Functions, never expose to frontend
 */
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing server-side Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
};
