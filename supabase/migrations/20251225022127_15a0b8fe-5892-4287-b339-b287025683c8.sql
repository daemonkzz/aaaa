-- Fix the security definer view issue by making it security invoker
-- First drop the existing view
DROP VIEW IF EXISTS public.admin_2fa_status;

-- Recreate the view with SECURITY INVOKER (default, safer)
CREATE VIEW public.admin_2fa_status 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  is_provisioned,
  is_blocked,
  failed_attempts,
  last_failed_at,
  created_at,
  updated_at
FROM admin_2fa_settings;

-- Grant access to the view
GRANT SELECT ON public.admin_2fa_status TO authenticated;

-- Enable RLS on the underlying table is already done
-- The view will respect the RLS policies of the underlying table