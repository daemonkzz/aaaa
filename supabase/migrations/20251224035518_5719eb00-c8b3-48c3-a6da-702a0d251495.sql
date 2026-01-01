-- Rules table for storing the complete rules structure
CREATE TABLE public.rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view rules"
ON public.rules
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert rules"
ON public.rules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update rules"
ON public.rules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete rules"
ON public.rules
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_rules_updated_at
BEFORE UPDATE ON public.rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial empty rules record
INSERT INTO public.rules (data) VALUES ('[]'::jsonb);