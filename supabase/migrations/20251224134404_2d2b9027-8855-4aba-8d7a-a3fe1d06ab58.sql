-- applications tablosuna revizyon için gerekli alanları ekle
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS revision_requested_fields jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS revision_notes jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS content_history jsonb DEFAULT '[]'::jsonb;