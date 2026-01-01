-- 1. Güvenli şifre doğrulama fonksiyonu oluştur
CREATE OR REPLACE FUNCTION public.verify_form_access_code(
  p_form_id uuid,
  p_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_codes text[];
  v_is_protected boolean;
BEGIN
  -- Form settings'ten şifreleri ve koruma durumunu al
  SELECT 
    COALESCE((settings->>'isPasswordProtected')::boolean, false),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(settings->'accessCodes', '[]'::jsonb)))
  INTO v_is_protected, v_codes
  FROM form_templates
  WHERE id = p_form_id AND is_active = true;
  
  -- Form bulunamadı
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Şifre koruması yoksa true dön
  IF NOT v_is_protected THEN
    RETURN true;
  END IF;
  
  -- Kod doğru mu kontrol et
  RETURN p_code = ANY(v_codes);
END;
$$;

-- 2. Güvenli view oluştur (accessCodes ve discordWebhookUrl gizli)
CREATE OR REPLACE VIEW public.form_templates_public AS
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

-- 3. View için RLS benzeri güvenlik: authenticated users sadece view'a erişebilir
GRANT SELECT ON public.form_templates_public TO authenticated;

-- 4. Mevcut kullanıcı politikasını kaldır (artık view kullanılacak)
DROP POLICY IF EXISTS "Users can view active form templates" ON public.form_templates;

-- 5. Fonksiyona execute izni ver
GRANT EXECUTE ON FUNCTION public.verify_form_access_code(uuid, text) TO authenticated;