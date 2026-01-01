-- 1. Mevcut tehlikeli RLS politikasını kaldır
DROP POLICY IF EXISTS "Admins can view 2fa for provisioning" ON admin_2fa_settings;

-- 2. Kullanıcılar sadece kendi 2FA ayarlarını görebilir
CREATE POLICY "Users can view own 2fa settings"
ON admin_2fa_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Mevcut view'ı güvenli versiyonla değiştir (totp_secret hariç)
DROP VIEW IF EXISTS admin_2fa_status;

CREATE VIEW admin_2fa_status 
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