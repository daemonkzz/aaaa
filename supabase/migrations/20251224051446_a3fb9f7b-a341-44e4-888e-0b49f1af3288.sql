-- Add daemonkz as first admin in admin_2fa_settings table
INSERT INTO public.admin_2fa_settings (user_id, is_provisioned, is_blocked, failed_attempts)
VALUES ('4760c02a-30a7-4677-9474-812f36ad77d6', false, false, 0)
ON CONFLICT (user_id) DO NOTHING;