-- Fix 1: Remove public access to roles table and restrict to authenticated users
DROP POLICY IF EXISTS "Public roles are viewable" ON public.roles;

-- Create new policy that only allows authenticated users to view roles
CREATE POLICY "Authenticated users can view roles"
ON public.roles
FOR SELECT
TO authenticated
USING (true);

-- Fix 3: Add validation constraints to applications table
-- Add CHECK constraint for valid application types
ALTER TABLE public.applications
ADD CONSTRAINT applications_type_check
CHECK (type IN ('lspd-akademi', 'sirket', 'taksici', 'hastane'));

-- Add CHECK constraint for valid status values
ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add CHECK constraint for content size (prevent extremely large payloads)
ALTER TABLE public.applications
ADD CONSTRAINT applications_content_size_check
CHECK (pg_column_size(content) <= 50000);