-- Kilitleme Sistemi ve AI Değerlendirme Migration
-- Faz A: Yeni kolonlar

-- 1. Kilitleme kolonları
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS locked_by TEXT; -- 'staff' veya 'ai'
ALTER TABLE applications ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- 2. AI işleme bilgileri
ALTER TABLE applications ADD COLUMN IF NOT EXISTS processed_by_ai BOOLEAN DEFAULT false;

-- 3. AI değerlendirme sonucu (JSONB)
-- Yapı:
-- {
--   "deepseek_analysis": "Genel analiz metni...",
--   "opus_evaluation": "RP değerlendirme metni...",
--   "decision": "approve/reject/revision",
--   "confidence_score": 85,
--   "evaluated_at": "2026-01-03T01:00:00Z"
-- }
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ai_evaluation JSONB;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_is_locked ON applications(is_locked);
CREATE INDEX IF NOT EXISTS idx_applications_processed_by_ai ON applications(processed_by_ai);
