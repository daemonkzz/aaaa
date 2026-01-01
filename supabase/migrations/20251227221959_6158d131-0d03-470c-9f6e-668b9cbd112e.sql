-- 1. log_table_changes fonksiyonunu güncelle - hassas alanları filtrele
CREATE OR REPLACE FUNCTION public.log_table_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  old_data jsonb := NULL;
  new_data jsonb := NULL;
  record_id text;
  changed text[] := ARRAY[]::text[];
  col text;
  -- Hassas alanlar listesi
  sensitive_fields text[] := ARRAY['totp_secret', 'password', 'password_hash', 'secret', 'token', 'api_key'];
BEGIN
  -- Record ID belirleme
  IF TG_OP = 'DELETE' THEN
    record_id := OLD.id::text;
    old_data := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    record_id := NEW.id::text;
    new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    record_id := NEW.id::text;
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Değişen alanları bul
    FOR col IN SELECT jsonb_object_keys(new_data)
    LOOP
      IF old_data->col IS DISTINCT FROM new_data->col THEN
        changed := array_append(changed, col);
      END IF;
    END LOOP;
  END IF;
  
  -- Hassas alanları redact et
  IF old_data IS NOT NULL THEN
    FOR col IN SELECT unnest(sensitive_fields)
    LOOP
      IF old_data ? col THEN
        old_data := old_data || jsonb_build_object(col, '[REDACTED]');
      END IF;
    END LOOP;
  END IF;
  
  IF new_data IS NOT NULL THEN
    FOR col IN SELECT unnest(sensitive_fields)
    LOOP
      IF new_data ? col THEN
        new_data := new_data || jsonb_build_object(col, '[REDACTED]');
      END IF;
    END LOOP;
  END IF;
  
  -- Log kaydı oluştur
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    record_id,
    TG_OP,
    old_data,
    new_data,
    NULLIF(changed, ARRAY[]::text[]),
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2. Adminlerin sadece safe view'ı kullanmasını sağla
-- Önce mevcut policy'yi kaldır
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- 3. audit_logs_safe view'ına RLS policy ekle (view zaten var)
-- View'lar için RLS doğrudan çalışmaz, bu yüzden farklı bir yaklaşım kullanıyoruz
-- Adminlerin güvenli view üzerinden erişimini sağlayalım

-- audit_logs tablosuna yeni güvenli policy ekle
CREATE POLICY "Admins can view audit logs via safe view only"
ON public.audit_logs FOR SELECT
USING (false); -- Doğrudan erişimi engelle

-- audit_logs_safe view'ını yeniden oluştur (security_invoker ile)
DROP VIEW IF EXISTS public.audit_logs_safe;

CREATE VIEW public.audit_logs_safe 
WITH (security_invoker = false)
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

-- 4. Eski logları temizlemek için fonksiyon (90 gün retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;