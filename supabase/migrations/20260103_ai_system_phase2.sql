-- =============================================
-- KAZE AI SİSTEMİ - FAZ 1: VERİTABANI GÜNCELLEMELERİ
-- Bu SQL'i Supabase SQL Editor'da çalıştır
-- =============================================

-- 1. AI_SETTINGS TABLOSU - YENİ KOLONLAR
ALTER TABLE public.ai_settings 
ADD COLUMN IF NOT EXISTS opus_arbiter_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS batch_interval TEXT DEFAULT '30m',
ADD COLUMN IF NOT EXISTS daily_batch_hour SMALLINT DEFAULT 3,
ADD COLUMN IF NOT EXISTS cost_alert_threshold DECIMAL(10,2) DEFAULT 5.00;

-- 2. APPLICATIONS TABLOSU - YENİ KOLONLAR
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS ai_conflict_status TEXT,
ADD COLUMN IF NOT EXISTS ai_dry_run BOOLEAN DEFAULT false;

-- 3. ADMIN_PERMISSIONS TABLOSU - YENİ KOLON
ALTER TABLE public.admin_permissions 
ADD COLUMN IF NOT EXISTS can_view_ai_conflicts BOOLEAN DEFAULT false;

-- 4. İSTATİSTİKLER TABLOSU
DROP VIEW IF EXISTS public.ai_daily_stats;

CREATE TABLE IF NOT EXISTS public.ai_daily_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_forms_processed INT DEFAULT 0,
    approved_count INT DEFAULT 0,
    rejected_count INT DEFAULT 0,
    revision_count INT DEFAULT 0,
    conflict_count INT DEFAULT 0,
    avg_confidence_score DECIMAL(5,2) DEFAULT 0,
    estimated_cost_usd DECIMAL(10,4) DEFAULT 0,
    deepseek_tokens_used INT DEFAULT 0,
    opus_tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stat_date)
);

-- RLS for ai_daily_stats
ALTER TABLE public.ai_daily_stats ENABLE ROW LEVEL SECURITY;

-- Sadece admin_2fa_settings'te kaydı olan kullanıcılar okuyabilir
DROP POLICY IF EXISTS "admin_stats_select" ON public.ai_daily_stats;
CREATE POLICY "admin_stats_select" ON public.ai_daily_stats
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.admin_2fa_settings a2fa
        WHERE a2fa.user_id = auth.uid()
    )
);

-- Service role full access
DROP POLICY IF EXISTS "service_role_stats" ON public.ai_daily_stats;
CREATE POLICY "service_role_stats" ON public.ai_daily_stats
FOR ALL USING (auth.role() = 'service_role');

-- 5. KONTROL
SELECT 
    'ai_settings' as table_name,
    column_name 
FROM information_schema.columns 
WHERE table_name = 'ai_settings' 
AND column_name IN ('opus_arbiter_enabled', 'batch_interval', 'daily_batch_hour', 'cost_alert_threshold')

UNION ALL

SELECT 
    'applications' as table_name,
    column_name 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('ai_conflict_status', 'ai_dry_run')

UNION ALL

SELECT 
    'admin_permissions' as table_name,
    column_name 
FROM information_schema.columns 
WHERE table_name = 'admin_permissions' 
AND column_name = 'can_view_ai_conflicts';
