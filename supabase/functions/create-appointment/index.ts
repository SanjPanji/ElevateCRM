import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentRequest {
  leadId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  summary?: string;
  description?: string;
}

async function getFreshAccessToken(
  supabase: ReturnType<typeof createClient>,
  employeeId: string,
  googleClientId: string,
  googleClientSecret: string
): Promise<string | null> {
  // Get Google connection
  const { data: googleConnection, error: connError } = await supabase
    .from('google_connections')
    .select('encrypted_refresh_token')
    .eq('employee_id', employeeId)
    .single();

  if (connError || !googleConnection) {
    return null;
  }

  // Refresh the token
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

async function createGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  startTime: string,
  endTime: string,
  summary: string,
  description: string
): Promise<{ eventId: string; meetUrl: string | null } | null> {
  const eventPayload = {
    summary,
    description,
    start: {
      dateTime: startTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime,
      timeZone: 'UTC',
    },
    conferenceData: {
      createRequest: {
        requestId: `crm-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    attendees: [],
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Google Calendar API error:', error);
    return null;
  }

  const eventData = await response.json();
  return {
    eventId: eventData.id,
    meetUrl: eventData.hangoutLink || eventData.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || null,
  };
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

    // Environment variables
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

    // Verify token
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

    // Parse request body
    const body: AppointmentRequest = await req.json();
    const { leadId, employeeId, startTime, endTime, summary, description } = body;

    if (!leadId || !employeeId || !startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: leadId, employeeId, startTime, endTime' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lead info for the appointment
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('name, email, phone')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get employee profile for calendar ID
    const { data: employee, error: empError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Google connection for calendar info
    const { data: googleConn } = await supabase
      .from('google_connections')
      .select('google_calendar_id')
      .eq('employee_id', employeeId)
      .single();

    const calendarId = googleConn?.google_calendar_id || 'primary';
    const appointmentSummary = summary || `Consultation with ${lead.name}`;
    const appointmentDescription = description || `Lead: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'N/A'}\n\nScheduled via ElevateCRM`;

    let googleEventId: string | null = null;
    let googleMeetUrl: string | null = null;

    // Try to create Google Calendar event
    const accessToken = await getFreshAccessToken(supabase, employeeId, googleClientId, googleClientSecret);

    if (accessToken) {
      const eventResult = await createGoogleCalendarEvent(
        accessToken,
        calendarId,
        startTime,
        endTime,
        appointmentSummary,
        appointmentDescription
      );

      if (eventResult) {
        googleEventId = eventResult.eventId;
        googleMeetUrl = eventResult.meetUrl;
      }
    }

    // Create appointment in database
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        lead_id: leadId,
        employee_id: employeeId,
        start_time: startTime,
        end_time: endTime,
        status: 'scheduled',
        google_event_id: googleEventId,
        google_calendar_id: calendarId,
        google_meet_url: googleMeetUrl,
      })
      .select()
      .single();

    if (apptError) {
      console.error('Error creating appointment:', apptError);
      return new Response(
        JSON.stringify({ error: 'Failed to create appointment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update lead status to scheduled
    await supabase
      .from('leads')
      .update({ status: 'scheduled' })
      .eq('id', leadId);

    return new Response(
      JSON.stringify({
        success: true,
        appointment,
        googleMeetUrl,
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
