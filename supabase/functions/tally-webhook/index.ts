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
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const payload = await req.json();

    // Validate Tally webhook has required fields
    if (!payload.data?.responseId) {
      return new Response(
        JSON.stringify({ error: 'Missing responseId in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseId = payload.data.responseId;

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check if webhook event already exists (idempotency)
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id, status')
      .eq('provider', 'tally')
      .eq('event_id', responseId)
      .single();

    if (existingEvent && existingEvent.status === 'processed') {
      // Already processed, return success
      return new Response(
        JSON.stringify({ success: true, message: 'Event already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract lead information from Tally response
    const tallyData = payload.data;
    const leadName = tallyData.fields?.find((f: any) => f.key === 'name')?.value || 'Unknown';
    const leadEmail = tallyData.email || '';
    const leadPhone = tallyData.fields?.find((f: any) => f.key === 'phone')?.value || '';

    // Create lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        status: 'new',
        source: 'tally',
        source_form_id: payload.data.formId || null,
        source_response_id: responseId,
        raw_payload: payload,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);

      // Record webhook as failed
      await supabase
        .from('webhook_events')
        .upsert(
          {
            provider: 'tally',
            event_id: responseId,
            payload: payload,
            status: 'failed',
            error_message: leadError.message,
          },
          { onConflict: 'provider,event_id' }
        );

      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: leadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract form answers
    const answers = tallyData.fields?.map((field: any) => ({
      lead_id: leadData.id,
      field_id: field.key,
      field_name: field.label || field.key,
      field_value: field.value,
    })) || [];

    // Insert answers
    if (answers.length > 0) {
      const { error: answersError } = await supabase
        .from('lead_answers')
        .insert(answers);

      if (answersError) {
        console.error('Error creating lead answers:', answersError);
      }
    }

    // Record webhook as processed
    const { error: webhookError } = await supabase
      .from('webhook_events')
      .upsert(
        {
          provider: 'tally',
          event_id: responseId,
          payload: payload,
          status: 'processed',
          processed_at: new Date().toISOString(),
        },
        { onConflict: 'provider,event_id' }
      );

    if (webhookError) {
      console.error('Error recording webhook event:', webhookError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        leadId: leadData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
