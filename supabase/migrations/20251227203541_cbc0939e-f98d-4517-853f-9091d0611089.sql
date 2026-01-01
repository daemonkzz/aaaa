-- AI değerlendirme kolonları ekle
ALTER TABLE public.applications
ADD COLUMN ai_evaluation jsonb DEFAULT NULL,
ADD COLUMN ai_decision text DEFAULT NULL,
ADD COLUMN ai_confidence_score smallint DEFAULT NULL,
ADD COLUMN ai_evaluated_at timestamptz DEFAULT NULL;

-- ai_decision için check constraint
ALTER TABLE public.applications
ADD CONSTRAINT chk_ai_decision CHECK (
  ai_decision IS NULL OR ai_decision IN ('approved', 'rejected', 'interview')
);

-- ai_confidence_score için check constraint (0-100)
ALTER TABLE public.applications
ADD CONSTRAINT chk_ai_confidence_score CHECK (
  ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 100)
);

-- Performans için indeksler
CREATE INDEX idx_applications_ai_decision ON public.applications(ai_decision) WHERE ai_decision IS NOT NULL;
CREATE INDEX idx_applications_ai_confidence ON public.applications(ai_confidence_score) WHERE ai_confidence_score IS NOT NULL;
CREATE INDEX idx_applications_ai_evaluated_at ON public.applications(ai_evaluated_at) WHERE ai_evaluated_at IS NOT NULL;