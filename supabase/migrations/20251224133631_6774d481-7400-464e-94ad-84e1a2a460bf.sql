-- Trigger fonksiyonunu güncelle: reddedildiğinde is_whitelist_approved = false yapılsın
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
  
  -- Eğer whitelist form ise
  IF form_type = 'whitelist' THEN
    -- Onaylandıysa true yap
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
      UPDATE public.profiles
      SET is_whitelist_approved = true
      WHERE id = NEW.user_id;
    -- Reddedildiyse false yap
    ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
      UPDATE public.profiles
      SET is_whitelist_approved = false
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;