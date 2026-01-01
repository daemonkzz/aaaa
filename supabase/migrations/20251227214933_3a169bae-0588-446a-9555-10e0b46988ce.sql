-- SECURITY DEFINER view'ı SECURITY INVOKER olarak değiştir (daha güvenli)
DROP VIEW IF EXISTS public.form_templates_public;

CREATE VIEW public.form_templates_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  description,
  cover_image_url,
  is_active,
  questions,
  created_at,
  updated_at,
  -- settings'i hassas veriler olmadan döndür
  jsonb_build_object(
    'formType', COALESCE(settings->>'formType', 'other'),
    'userAccessTypes', COALESCE(settings->'userAccessTypes', '["verified"]'::jsonb),
    'cooldownHours', COALESCE((settings->>'cooldownHours')::int, 0),
    'maxApplications', COALESCE((settings->>'maxApplications')::int, 0),
    'isPasswordProtected', COALESCE((settings->>'isPasswordProtected')::boolean, false)
  ) as settings
FROM form_templates
WHERE is_active = true;

-- View için izinleri yeniden ver
GRANT SELECT ON public.form_templates_public TO authenticated;

-- form_templates tablosuna kullanıcı okuma izni ver (view çalışması için gerekli)
CREATE POLICY "Users can view active form templates via view"
ON public.form_templates
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);