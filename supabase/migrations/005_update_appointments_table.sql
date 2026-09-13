-- ============================================================================
-- 005_update_appointments_table.sql
-- Description: Adds created_by, title, and description to appointments table.
-- ============================================================================

-- Add new columns to public.appointments
ALTER TABLE public.appointments
ADD COLUMN created_by UUID REFERENCES public.profiles(id),
ADD COLUMN title TEXT,
ADD COLUMN description TEXT;

-- Update RLS policies for appointments
-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

-- 1. SELECT policy: any authenticated user can view appointments
CREATE POLICY "Appointments are viewable by everyone" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (true);

-- 2. INSERT policy: any authenticated user can insert
CREATE POLICY "Users can create appointments" 
ON public.appointments FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 3. UPDATE policy: creators or assigned employees can update
CREATE POLICY "Creators or assigned employees can update appointments" 
ON public.appointments FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by OR auth.uid() = employee_id);

-- Ensure RLS is enabled
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
