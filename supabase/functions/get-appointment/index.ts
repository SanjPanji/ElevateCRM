import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getFreshAccessToken(
  supabase: ReturnType<typeof createClient>,
  employeeId: string,
  googleClientId: string,
  googleClientSecret: string
): Promise<string | null> {
  const { data: googleConnection, error: connError } = await supabase
    .from('google_connections')
    .select('encrypted_refresh_token')
    .eq('employee_id', employeeId)
    .single();

  if (connError || !googleConnection) {
    return null;
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: googleConnection.encrypted_refresh_token,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!tokenResponse.ok) {
    return null;
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!supabaseUrl || !supabaseServiceRoleKey || !googleClientId || !googleClientSecret) {
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get('id');

    if (!appointmentId) {
      return new Response(
        JSON.stringify({ error: 'Missing appointment ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select(`
        *,
        lead:leads(id, name, phone, email),
        employee:profiles!appointments_employee_id_fkey(id, full_name, email)
      `)
      .eq('id', appointmentId)
      .single();

    if (apptError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If meet URL already exists, just return it
    if (appointment.google_meet_url) {
      return new Response(
        JSON.stringify({
          success: true,
          appointment,
          conference_status: 'success'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no meet URL but there's a google_event_id, check Google Calendar
    if (!appointment.google_meet_url && appointment.google_event_id && appointment.created_by) {
      const accessToken = await getFreshAccessToken(supabase, appointment.created_by, googleClientId, googleClientSecret);

      if (accessToken) {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(appointment.google_calendar_id)}/events/${appointment.google_event_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const eventData = await response.json();
          const meetStatus = eventData.conferenceData?.createRequest?.status?.statusCode || 'success';
          const meetUrl = eventData.hangoutLink || eventData.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || null;

          if (meetUrl) {
            // Update the database with the new URL
            await supabase
              .from('appointments')
              .update({ google_meet_url: meetUrl })
              .eq('id', appointmentId);
            
            appointment.google_meet_url = meetUrl;

            return new Response(
              JSON.stringify({
                success: true,
                appointment,
                conference_status: meetStatus
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            return new Response(
              JSON.stringify({
                success: true,
                appointment,
                conference_status: meetStatus
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointment,
        conference_status: 'none'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
