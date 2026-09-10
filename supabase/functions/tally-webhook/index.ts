import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIELD_IDS = {
  name: 'question_Aqjl9N',
  age: 'question_BQ2GeY',
  university: 'question_k7kYzj',
  course: 'question_vOdNz8',
  specialty: 'question_KJaMGK',
  currentActivity: 'question_LJ6dO2',
  currentJob: 'question_p7kLzE',
  income: 'question_1JprRL',
  incomeCurrency: 'question_MJ7AV0',
  mainGoal: 'question_JJW2o7',
  mainObstacle: 'question_g7k5zK',
  whyNow: 'question_yEdl1W',
  purchasedCourses: 'question_XM2eQV',
  likedAndMissing: 'question_8PRdEo',
  readyToStart: 'question_0JDEAQ',
  paymentDecisionMaker: 'question_zr1KbE',
  developmentBudget: 'question_5GpdOb',
  successResult: 'question_dDkYRN',
  consultantNotes: 'question_YMxZq0',
  phone: 'question_DJZVWp',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  try {
    const payload = await req.json();

    if (!payload?.data?.responseId) {
      return new Response(
        JSON.stringify({
          error: 'Missing responseId in payload',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');

      return new Response(
        JSON.stringify({
          error: 'Configuration error',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    /**
     * Get the next manager to assign a lead to (round-robin among active managers/admins)
     */
    const getNextManager = async () => {
      const { data: managers, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true)
        .in('role', ['manager', 'admin'])
        .order('created_at', { ascending: true });

      if (error || !managers?.length) {
        console.error('No active managers or admins found');
        return null;
      }

      // Find manager with fewest assigned leads
      const { data: leadCounts } = await supabase
        .from('leads')
        .select('assigned_to')
        .in('assigned_to', managers.map((m: { id: string }) => m.id));

      const counts: Record<string, number> = {};
      managers.forEach((m: { id: string }) => { counts[m.id] = 0; });
      leadCounts?.forEach((l: { assigned_to: string | null }) => {
        if (l.assigned_to && counts[l.assigned_to] !== undefined) {
          counts[l.assigned_to]++;
        }
      });

      let minManager = managers[0];
      let minCount = counts[managers[0].id];

      managers.forEach((m: { id: string }) => {
        if (counts[m.id] < minCount) {
          minCount = counts[m.id];
          minManager = m;
        }
      });

      return minManager.id;
    };

    const tallyData = payload.data;
    const responseId = tallyData.responseId;

    const fields = Array.isArray(tallyData.fields)
      ? tallyData.fields
      : [];

    const getField = (key: string) => {
      return fields.find((field: any) => field.key === key);
    };

    const getValue = (key: string) => {
      return getField(key)?.value ?? null;
    };

    const getTextValue = (key: string) => {
      const field = getField(key);

      if (!field) {
        return null;
      }

      if (
        field.type === 'MULTIPLE_CHOICE' &&
        Array.isArray(field.value)
      ) {
        return field.value
          .map((value: string) => {
            const option = field.options?.find(
              (item: any) => item.id === value,
            );

            return option?.text ?? value;
          })
          .join(', ');
      }

      return field.value ?? null;
    };

    const { data: existingEvent, error: existingEventError } =
      await supabase
        .from('webhook_events')
        .select('id, status')
        .eq('provider', 'tally')
        .eq('event_id', responseId)
        .maybeSingle();

    if (existingEventError) {
      console.error(
        'Error checking webhook event:',
        existingEventError,
      );

      return new Response(
        JSON.stringify({
          error: 'Failed to check webhook event',
          details: existingEventError.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (
      existingEvent &&
      existingEvent.status === 'processed'
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Event already processed',
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const ageValue = getValue(FIELD_IDS.age);
    const incomeValue = getValue(FIELD_IDS.income);

    const age =
      ageValue !== null && ageValue !== ''
        ? Number(ageValue)
        : null;

    const income =
      incomeValue !== null && incomeValue !== ''
        ? Number(incomeValue)
        : null;

    if (age !== null && Number.isNaN(age)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid age value',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (income !== null && Number.isNaN(income)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid income value',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Get next manager to assign the lead to BEFORE inserting
    const assignedManagerId = await getNextManager();

    const { data: leadData, error: leadError } =
      await supabase
        .from('leads')
        .insert({
          name: getValue(FIELD_IDS.name),
          age,
          university: getValue(FIELD_IDS.university),
          education_course: getValue(FIELD_IDS.course),
          specialty: getValue(FIELD_IDS.specialty),

          current_activity: getValue(
            FIELD_IDS.currentActivity,
          ),
          current_job: getValue(FIELD_IDS.currentJob),

          monthly_income: income,
          income_currency: getValue(
            FIELD_IDS.incomeCurrency,
          ),

          main_goal: getValue(FIELD_IDS.mainGoal),
          main_obstacle: getValue(
            FIELD_IDS.mainObstacle,
          ),
          why_now: getValue(FIELD_IDS.whyNow),

          purchased_courses: getValue(
            FIELD_IDS.purchasedCourses,
          ),
          liked_and_missing: getValue(
            FIELD_IDS.likedAndMissing,
          ),

          ready_to_start: getTextValue(
            FIELD_IDS.readyToStart,
          ),
          payment_decision_maker: getTextValue(
            FIELD_IDS.paymentDecisionMaker,
          ),
          development_budget: getValue(
            FIELD_IDS.developmentBudget,
          ),

          success_result: getValue(
            FIELD_IDS.successResult,
          ),
          consultant_notes: getValue(
            FIELD_IDS.consultantNotes,
          ),

          phone: getValue(FIELD_IDS.phone),

          meeting_status: 'not_scheduled',
          assigned_to: assignedManagerId,

          source: 'tally',
          tally_form_id: tallyData.formId || null,
          tally_response_id: responseId,

          raw_tally_data: payload,
        })
        .select()
        .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);

      await supabase
        .from('webhook_events')
        .upsert(
          {
            provider: 'tally',
            event_id: responseId,
            payload,
            status: 'failed',
            error_message: leadError.message,
          },
          {
            onConflict: 'provider,event_id',
          },
        );

      return new Response(
        JSON.stringify({
          error: 'Failed to create lead',
          details: leadError.message,
          code: leadError.code,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const { error: webhookError } = await supabase
      .from('webhook_events')
      .upsert(
        {
          provider: 'tally',
          event_id: responseId,
          payload,
          status: 'processed',
          processed_at: new Date().toISOString(),
        },
        {
          onConflict: 'provider,event_id',
        },
      );

    if (webhookError) {
      console.error(
        'Error recording webhook event:',
        webhookError,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        leadId: leadData.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});