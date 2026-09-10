-- ============================================================================
-- FIX ROLES AND POLICIES
-- ============================================================================

-- Employee should see ALL leads (not just assigned)
-- Managers/Admins see all (already covered)
DROP POLICY IF EXISTS "Users can view assigned or manageable leads" ON public.leads;
CREATE POLICY "Users can view all leads"
ON public.leads FOR SELECT
TO authenticated
USING (true);

-- Employee can update only their assigned leads (meeting_status, notes, etc.)
-- Managers/Admins can update any lead including assigned_to
DROP POLICY IF EXISTS "Users can update assigned or manageable leads" ON public.leads;
CREATE POLICY "Users can update leads"
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
  -- Employee can only update their own leads
  -- Managers/Admins can update any lead including reassignment
  (assigned_to = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('manager', 'admin')
  )
);

-- ============================================================================
-- FUNCTION TO GET MANAGERS FOR ROUND-ROBIN ASSIGNMENT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_next_manager_for_assignment()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_manager_id UUID;
BEGIN
  -- Get active managers ordered by lead count (ascending)
  SELECT p.id INTO next_manager_id
  FROM public.profiles p
  LEFT JOIN (
    SELECT assigned_to, COUNT(*) as lead_count
    FROM public.leads
    WHERE assigned_to IS NOT NULL
    GROUP BY assigned_to
  ) lc ON p.id = lc.assigned_to
  WHERE p.is_active = true
  AND p.role IN ('manager', 'admin')
  ORDER BY COALESCE(lc.lead_count, 0) ASC, p.created_at ASC
  LIMIT 1;

  RETURN next_manager_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_next_manager_for_assignment() TO authenticated;