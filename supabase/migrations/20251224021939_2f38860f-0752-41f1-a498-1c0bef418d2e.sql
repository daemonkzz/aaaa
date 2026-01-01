-- daemonkz kullanıcısına user_roles tablosunda admin rolü ekle
INSERT INTO public.user_roles (user_id, role)
VALUES ('4760c02a-30a7-4677-9474-812f36ad77d6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;