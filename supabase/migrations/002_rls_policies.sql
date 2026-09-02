-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Allow users to view all profiles (needed for team visibility)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only admins can insert new profiles (via Auth triggers)
DROP POLICY IF EXISTS "Only admins can create profiles" ON public.profiles;
CREATE POLICY "Only admins can create profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete profiles
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;
CREATE POLICY "Only admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- LEADS TABLE POLICIES
-- ============================================================================

-- Employees can only view leads assigned to them
-- Managers and admins can view all leads
DROP POLICY IF EXISTS "Users can view assigned or manageable leads" ON public.leads;
CREATE POLICY "Users can view assigned or manageable leads"
ON public.leads FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- Employees can update their assigned leads
-- Managers and admins can update any lead
DROP POLICY IF EXISTS "Users can update assigned or manageable leads" ON public.leads;
CREATE POLICY "Users can update assigned or manageable leads"
ON public.leads FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
)
WITH CHECK (
  assigned_to = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- Only managers and admins can create leads (webhooks create via service role)
DROP POLICY IF EXISTS "Managers and admins can create leads" ON public.leads;
CREATE POLICY "Managers and admins can create leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- Only managers and admins can delete leads
DROP POLICY IF EXISTS "Only managers and admins can delete leads" ON public.leads;
CREATE POLICY "Only managers and admins can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- ============================================================================
-- NOTES TABLE POLICIES
-- ============================================================================

-- Allow users to view notes on leads they have access to
DROP POLICY IF EXISTS "Users can view notes on accessible leads" ON public.notes;
CREATE POLICY "Users can view notes on accessible leads"
ON public.notes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = notes.lead_id
    AND (
      leads.assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
      )
    )
  )
);

-- Allow users to create notes on accessible leads
DROP POLICY IF EXISTS "Users can create notes on accessible leads" ON public.notes;
CREATE POLICY "Users can create notes on accessible leads"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = notes.lead_id
    AND (
      leads.assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
      )
    )
  )
  AND employee_id = auth.uid()
);

-- Allow users to update their own notes or any note (for managers/admins)
DROP POLICY IF EXISTS "Users can update accessible notes" ON public.notes;
CREATE POLICY "Users can update accessible notes"
ON public.notes FOR UPDATE
TO authenticated
USING (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
)
WITH CHECK (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- Allow users to delete their own notes or any note (for managers/admins)
DROP POLICY IF EXISTS "Users can delete accessible notes" ON public.notes;
CREATE POLICY "Users can delete accessible notes"
ON public.notes FOR DELETE
TO authenticated
USING (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- ============================================================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================================================

-- Employees can view their appointments and appointments with assigned leads
DROP POLICY IF EXISTS "Users can view accessible appointments" ON public.appointments;
CREATE POLICY "Users can view accessible appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.id = appointments.lead_id
    AND (
      leads.assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
      )
    )
  )
);

-- Employees can create appointments for themselves
DROP POLICY IF EXISTS "Users can create accessible appointments" ON public.appointments;
CREATE POLICY "Users can create accessible appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (
  (
    employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = appointments.lead_id
      AND leads.assigned_to = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- Employees can update their own appointments
DROP POLICY IF EXISTS "Users can update accessible appointments" ON public.appointments;
CREATE POLICY "Users can update accessible appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
)
WITH CHECK (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- ============================================================================
-- GOOGLE_CONNECTIONS TABLE POLICIES
-- ============================================================================

-- Users can only see their own Google connection
DROP POLICY IF EXISTS "Users can view their own Google connection" ON public.google_connections;
CREATE POLICY "Users can view their own Google connection"
ON public.google_connections FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

-- Users can only update their own Google connection
DROP POLICY IF EXISTS "Users can update their own Google connection" ON public.google_connections;
CREATE POLICY "Users can update their own Google connection"
ON public.google_connections FOR UPDATE
TO authenticated
USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- Users can only insert their own Google connection
DROP POLICY IF EXISTS "Users can create their own Google connection" ON public.google_connections;
CREATE POLICY "Users can create their own Google connection"
ON public.google_connections FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

-- Users can delete their own Google connection
DROP POLICY IF EXISTS "Users can delete their own Google connection" ON public.google_connections;
CREATE POLICY "Users can delete their own Google connection"
ON public.google_connections FOR DELETE
TO authenticated
USING (employee_id = auth.uid());

-- ============================================================================
-- WEBHOOK_EVENTS TABLE POLICIES
-- ============================================================================

-- Only service role (Edge Functions) can access webhook events
-- Never expose to authenticated users
DROP POLICY IF EXISTS "Webhook events are only accessible via service role" ON public.webhook_events;
CREATE POLICY "Webhook events are only accessible via service role"
ON public.webhook_events FOR ALL
TO authenticated
USING (false);

-- ============================================================================
-- SAFE VIEW FOR GOOGLE CONNECTIONS (excludes refresh token)
-- ============================================================================
DROP VIEW IF EXISTS public.google_connections_safe;
CREATE OR REPLACE VIEW public.google_connections_safe AS
SELECT
  id,
  employee_id,
  google_email,
  google_calendar_id,
  token_expires_at,
  created_at,
  updated_at
FROM public.google_connections;

ALTER VIEW public.google_connections_safe OWNER TO postgres;
GRANT SELECT ON public.google_connections_safe TO authenticated;
