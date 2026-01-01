-- Mevcut constraint'i kaldır
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

-- Yeni constraint'i ekle (revision_requested dahil)
ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'revision_requested'::text]));