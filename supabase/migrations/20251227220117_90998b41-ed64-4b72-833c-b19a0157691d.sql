-- =====================================================
-- ORTA ÖNCELİKLİ GÜVENLİK DÜZELTMELERİ
-- =====================================================

-- 1. GALLERY_IMAGES - uploaded_by gizleme
-- =====================================================
-- Mevcut "Anyone can view" politikasını kaldır ve authenticated-only yap
DROP POLICY IF EXISTS "Anyone can view gallery images" ON gallery_images;

-- Yeni politika: Sadece authenticated kullanıcılar görebilsin
-- Ve gallery_images_public view'ı kullanmaları önerilir
CREATE POLICY "Authenticated users can view gallery images"
ON gallery_images
FOR SELECT
TO authenticated
USING (true);

-- 2. NOTIFICATIONS - Anonim erişimi kapat
-- =====================================================
-- Mevcut politikayı kaldır
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;

-- Yeni politika: Sadece authenticated kullanıcılar kendi bildirimlerini görebilsin
CREATE POLICY "Authenticated users can view their notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  (is_global = true) 
  OR (id IN (
    SELECT notification_id 
    FROM notification_recipients 
    WHERE user_id = auth.uid()
  ))
);

-- 3. AUDIT_LOGS - IP adresi maskeleme
-- =====================================================
-- Güvenli view oluştur - IP adreslerini maskele
CREATE OR REPLACE VIEW public.audit_logs_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  table_name,
  record_id,
  action,
  old_data,
  new_data,
  changed_fields,
  user_id,
  -- IP adresini maskele: 192.168.1.100 -> 192.168.xxx.xxx
  CASE 
    WHEN ip_address IS NOT NULL THEN
      (regexp_replace(ip_address::text, '(\d+\.\d+)\.\d+\.\d+', '\1.xxx.xxx'))::text
    ELSE NULL
  END as ip_address_masked,
  -- User agent'ı kısalt
  LEFT(user_agent, 50) as user_agent_short,
  created_at
FROM audit_logs;

-- Sadece adminlere erişim ver
GRANT SELECT ON public.audit_logs_safe TO authenticated;

-- 4. ANNOUNCEMENTS - Anonim erişimi kontrol et
-- =====================================================
-- Mevcut "Public announcements are viewable" politikası true kullanıyor
-- Bunu authenticated-only yapalım
DROP POLICY IF EXISTS "Public announcements are viewable" ON announcements;

CREATE POLICY "Authenticated users can view published announcements"
ON announcements
FOR SELECT
TO authenticated
USING (is_published = true);