import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Get the next manager to assign a lead to (round-robin among active managers/admins)
 */
const getNextManager = async (supabase: ReturnType<typeof createClient>) => {
  const { data: managers, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('is_active', true)
    .in('role', ['manager', 'admin'])
    .order('created_at', { ascending: true });

  if (error || !managers?.length) {
    console.error('No active managers/admins found:', error);
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

  return minManager;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { lead_id, manager_id } = await req.json();

    if (!lead_id) {
      return new Response(JSON.stringify({ error: 'lead_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify current lead data
    const { data: currentLead, error: leadError } = await supabase
      .from('leads')
      .select('id, assigned_to')
      .eq('id', lead_id)
      .single();

    if (leadError || !currentLead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let targetManagerId = manager_id;

    // Auto-assign to manager with fewest leads if no manager specified
    if (!targetManagerId) {
      const nextManager = await getNextManager(supabase);
      if (!nextManager) {
        return new Response(JSON.stringify({ error: 'No active managers found' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      targetManagerId = nextManager.id;
    }

    // Assign the lead to manager
    const { data, error } = await supabase
      .from('leads')
      .update({
        assigned_to: targetManagerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', lead_id)
      .select(`
        *,
        assigned_employee:profiles(id, name, username, role)
      `)
      .single();

    if (error) {
      console.error('Error assigning lead:', error);
      return new Response(JSON.stringify({ error: 'Failed to assign lead' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      lead: data,
      assigned_to: targetManagerId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});