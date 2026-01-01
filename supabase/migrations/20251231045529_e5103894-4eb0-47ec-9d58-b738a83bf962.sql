-- Rastgele başvuru numarası oluşturan fonksiyonu güncelle
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  form_type text;
  prefix text;
  random_num integer;
  new_app_number text;
  max_attempts integer := 100;
  attempt integer := 0;
BEGIN
  -- Form template'den formType'ı al
  SELECT settings->>'formType' INTO form_type
  FROM public.form_templates
  WHERE id::text = NEW.type;
  
  -- Prefix belirle
  CASE form_type
    WHEN 'whitelist' THEN prefix := 'WL';
    ELSE prefix := 'APP';
  END CASE;
  
  -- Benzersiz rastgele numara oluştur (10000-99999 arası)
  LOOP
    attempt := attempt + 1;
    
    -- 5 haneli rastgele numara (10000-99999)
    random_num := floor(random() * 90000 + 10000)::integer;
    new_app_number := prefix || '-' || random_num::text;
    
    -- Bu numara zaten var mı kontrol et
    IF NOT EXISTS (
      SELECT 1 FROM public.applications 
      WHERE application_number = new_app_number
    ) THEN
      -- Benzersiz numara bulundu, döngüden çık
      EXIT;
    END IF;
    
    -- Sonsuz döngüyü önle
    IF attempt >= max_attempts THEN
      -- Son çare: timestamp ekle
      new_app_number := prefix || '-' || random_num::text || '-' || (extract(epoch from now())::integer % 1000)::text;
      EXIT;
    END IF;
  END LOOP;
  
  NEW.application_number := new_app_number;
  RETURN NEW;
END;
$function$;