-- Trigger fonksiyonunu güncelle: form template'deki formType'ı kontrol etsin
CREATE OR REPLACE FUNCTION public.handle_whitelist_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  form_type text;
BEGIN
  -- Form template'den formType'ı al (type form UUID'si olduğu için)
  SELECT settings->>'formType' INTO form_type
  FROM public.form_templates
  WHERE id::text = NEW.type;
  
  -- Eğer whitelist form ise ve onaylandıysa
  IF form_type = 'whitelist' AND NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.profiles
    SET is_whitelist_approved = true
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Mevcut onaylı whitelist başvuruları için profilleri düzelt
UPDATE public.profiles p
SET is_whitelist_approved = true
FROM public.applications a
JOIN public.form_templates ft ON ft.id::text = a.type
WHERE a.user_id = p.id
  AND a.status = 'approved'
  AND ft.settings->>'formType' = 'whitelist';