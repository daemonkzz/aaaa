-- devrimcii#0 kullanıcısına admin rolü ekle
INSERT INTO public.user_roles (user_id, role)
VALUES ('33c5e994-3e1a-457c-9578-4cb141e47a6c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;