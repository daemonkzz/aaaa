-- Security Definer View sorununu düzelt
-- View'ı security_invoker = true olarak yeniden oluştur

DROP VIEW IF EXISTS public.audit_logs_safe;

-- Önce audit_logs tablosuna admin erişimi geri ver (view RLS bypass için gerekli)
DROP POLICY IF EXISTS "Admins can view audit logs via safe view only" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- View'ı security_invoker = true ile oluştur (güvenli)
CREATE VIEW public.audit_logs_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  table_name,
  record_id,
  action,
  -- IP adresini maskele (son 2 oktet)
  CASE 
    WHEN ip_address IS NOT NULL THEN
      regexp_replace(ip_address::text, '\d+\.\d+$', 'xxx.xxx')
    ELSE NULL
  END as ip_address_masked,
  -- User agent'ı kısalt
  CASE 
    WHEN user_agent IS NOT NULL THEN
      left(user_agent, 50)
    ELSE NULL
  END as user_agent_short,
  old_data,
  new_data,
  changed_fields,
  user_id,
  created_at
FROM public.audit_logs;

-- View'a erişim izni ver
GRANT SELECT ON public.audit_logs_safe TO authenticated;