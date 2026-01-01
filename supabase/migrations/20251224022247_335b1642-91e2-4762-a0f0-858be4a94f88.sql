-- ===========================================
-- ADIM 1: app_role enum'unu genişlet
-- ===========================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';

-- ===========================================
-- ADIM 2: Mevcut verileri user_roles'a migrate et
-- ===========================================
-- Admin rolü olanları ekle (role_id = 1)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE p.role_id = 1
ON CONFLICT (user_id, role) DO NOTHING;

-- Moderator rolü olanları ekle (role_id = 2)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'moderator'::app_role
FROM public.profiles p
WHERE p.role_id = 2
ON CONFLICT (user_id, role) DO NOTHING;

-- Diğer tüm kullanıcılara 'user' rolü ver (role_id 1,2 dışındakiler veya NULL olanlar)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'user'::app_role
FROM public.profiles p
WHERE p.role_id IS NULL OR p.role_id NOT IN (1, 2)
ON CONFLICT (user_id, role) DO NOTHING;

-- ===========================================
-- ADIM 3: Foreign Key ilişkilerini ekle
-- ===========================================
-- user_roles.user_id -> auth.users.id (zaten var olabilir, kontrol et)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey' 
    AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- applications.user_id -> auth.users.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_user_id_fkey' 
    AND table_name = 'applications'
  ) THEN
    ALTER TABLE public.applications 
    ADD CONSTRAINT applications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- announcements.author_id -> auth.users.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'announcements_author_id_fkey' 
    AND table_name = 'announcements'
  ) THEN
    ALTER TABLE public.announcements 
    ADD CONSTRAINT announcements_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ===========================================
-- ADIM 4: applications tablosu RLS politikalarını güncelle
-- ===========================================
-- Eski politikaları kaldır
DROP POLICY IF EXISTS "Staff can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Staff can update applications" ON public.applications;

-- Yeni has_role() kullanan politikalar
CREATE POLICY "Staff can view all applications" 
ON public.applications 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Staff can update applications" 
ON public.applications 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- ===========================================
-- ADIM 5: announcements tablosu RLS politikalarını ekle
-- ===========================================
-- Admin'ler duyuru oluşturabilir
CREATE POLICY "Admins can insert announcements" 
ON public.announcements 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin'ler duyuru güncelleyebilir
CREATE POLICY "Admins can update announcements" 
ON public.announcements 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Admin'ler duyuru silebilir
CREATE POLICY "Admins can delete announcements" 
ON public.announcements 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- ADIM 6: handle_new_user trigger'ını güncelle
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Profil oluştur (role_id olmadan)
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- user_roles tablosuna 'user' rolü ekle
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- ===========================================
-- ADIM 7: profiles.role_id kolonunu kaldır
-- ===========================================
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role_id;

-- ===========================================
-- ADIM 8: roles tablosunu sil
-- ===========================================
DROP TABLE IF EXISTS public.roles CASCADE;