import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!googleClientId || !googleClientSecret || !googleRedirectUri || !supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code for token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const refreshToken = tokenData.refresh_token;
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user info' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userInfo = await userInfoResponse.json();
    const googleEmail = userInfo.email;

    // Get calendar ID
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let googleCalendarId = null;
    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json();
      googleCalendarId = calendarData.id;
    }

    // Decode state to get user ID and employee profile ID
    let userId: string | null = null;
    let employeeProfileId: string | null = null;

    if (state) {
      try {
        const decodedState = JSON.parse(atob(state));
        userId = decodedState.userId;
        employeeProfileId = decodedState.profileId;
      } catch (e) {
        console.error('Error decoding state:', e);
      }
    }

    // If no userId in state, we cannot proceed
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user information in callback' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Encrypt refresh token (for now, store as-is - implement encryption as needed)
    const encryptedRefreshToken = refreshToken;

    // Get the user's employee profile (usually same as userId)
    const profileIdToUse = employeeProfileId || userId;

    // Store Google connection
    const { error: storageError } = await supabase
      .from('google_connections')
      .upsert(
        {
          employee_id: profileIdToUse,
          google_email: googleEmail,
          google_calendar_id: googleCalendarId,
          encrypted_refresh_token: encryptedRefreshToken,
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        },
        { onConflict: 'employee_id' }
      );

    if (storageError) {
      console.error('Error storing Google connection:', storageError);
      return new Response(
        JSON.stringify({ error: 'Failed to store connection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success response - redirect back to app
    const redirectUrl = new URL(Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000');
    redirectUrl.pathname = '/settings';
    redirectUrl.searchParams.set('google_connected', 'true');

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
      },
    });
  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
