-- Create updates table for news and patch notes
CREATE TABLE public.updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL CHECK (category IN ('update', 'news')),
  version TEXT,
  cover_image_url TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view published updates
CREATE POLICY "Anyone can view published updates"
ON public.updates
FOR SELECT
USING (is_published = true);

-- Admins can view all updates (including drafts)
CREATE POLICY "Admins can view all updates"
ON public.updates
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert updates
CREATE POLICY "Admins can insert updates"
ON public.updates
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update updates
CREATE POLICY "Admins can update updates"
ON public.updates
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete updates
CREATE POLICY "Admins can delete updates"
ON public.updates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_updates_updated_at
BEFORE UPDATE ON public.updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_updates_is_published ON public.updates(is_published);
CREATE INDEX idx_updates_category ON public.updates(category);
CREATE INDEX idx_updates_published_at ON public.updates(published_at DESC);