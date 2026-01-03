-- =============================================
-- KAZE AI SİSTEMİ - RLS DÜZELTME SQL
-- Tüm AI tablolarının RLS'ini kapatır
-- Bu SQL'i Supabase SQL Editor'da çalıştır
-- =============================================

-- 1. ai_settings - RLS KAPAT
ALTER TABLE public.ai_settings DISABLE ROW LEVEL SECURITY;

-- 2. ai_reports - RLS KAPAT (veya yoksa oluştur)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_reports') THEN
        ALTER TABLE public.ai_reports DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 3. ai_daily_stats - RLS KAPAT
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_daily_stats') THEN
        ALTER TABLE public.ai_daily_stats DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. applications tablosu için AI kolonlarını kontrol et
DO $$
BEGIN
    -- is_locked kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'is_locked') THEN
        ALTER TABLE public.applications ADD COLUMN is_locked BOOLEAN DEFAULT false;
    END IF;
    
    -- locked_by kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'locked_by') THEN
        ALTER TABLE public.applications ADD COLUMN locked_by TEXT;
    END IF;
    
    -- locked_at kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'locked_at') THEN
        ALTER TABLE public.applications ADD COLUMN locked_at TIMESTAMPTZ;
    END IF;
    
    -- processed_by_ai kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'processed_by_ai') THEN
        ALTER TABLE public.applications ADD COLUMN processed_by_ai BOOLEAN DEFAULT false;
    END IF;
    
    -- ai_evaluation kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'ai_evaluation') THEN
        ALTER TABLE public.applications ADD COLUMN ai_evaluation JSONB;
    END IF;
END $$;

-- 5. ai_reports tablosu yoksa oluştur
CREATE TABLE IF NOT EXISTS public.ai_reports (
    id SERIAL PRIMARY KEY,
    application_id INT,
    mode TEXT,
    deepseek_analysis JSONB,
    claude_analysis JSONB,
    arbiter_analysis JSONB,
    final_decision TEXT,
    confidence_score INT,
    processing_time_ms INT,
    action_taken TEXT,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Doğrulama
SELECT 'ai_settings RLS: ' || CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_class WHERE relname = 'ai_settings'
UNION ALL
SELECT 'ai_reports RLS: ' || CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END
FROM pg_class WHERE relname = 'ai_reports'
UNION ALL
SELECT 'ai_daily_stats RLS: ' || CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END
FROM pg_class WHERE relname = 'ai_daily_stats';
