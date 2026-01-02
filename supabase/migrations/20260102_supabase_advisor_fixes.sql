-- ============================================
-- Supabase Advisor Düzeltmeleri Migration
-- Tarih: 2026-01-02
-- Güvenlik + Performans Fixes
-- ============================================

-- ============================================
-- 1. Security Definer View → Security Invoker
-- ============================================
DROP VIEW IF EXISTS public.ai_daily_stats;

CREATE VIEW public.ai_daily_stats
WITH (security_invoker = true)
AS
SELECT 
    DATE(created_at) as report_date,
    COUNT(*) as total_processed,
    COUNT(*) FILTER (WHERE final_decision = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE final_decision = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE final_decision = 'interview') as interview_count,
    COUNT(*) FILTER (WHERE final_decision = 'revision') as revision_count,
    AVG(confidence_score) as avg_confidence,
    AVG(processing_time_ms) as avg_processing_time_ms
FROM public.ai_reports
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY report_date DESC;

GRANT SELECT ON public.ai_daily_stats TO authenticated;

-- ============================================
-- 2. Function Search Path Fix
-- ============================================
CREATE OR REPLACE FUNCTION log_ai_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.ai_audit_log (action, user_id, details)
    VALUES (
        TG_OP,
        auth.uid(),
        jsonb_build_object(
            'old', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
            'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 3. RLS Policies Optimization
-- auth.uid() -> (SELECT auth.uid())
-- ============================================

-- profiles table
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
CREATE POLICY "Users can see own profile" ON public.profiles
FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view all profiles" ON public.profiles
FOR SELECT USING (public.has_any_admin_permission((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can update profiles" ON public.profiles;
CREATE POLICY "Staff can update profiles" ON public.profiles
FOR UPDATE USING (public.can_manage((SELECT auth.uid()), 'users'));

-- applications table
DROP POLICY IF EXISTS "Users can see own applications" ON public.applications;
CREATE POLICY "Users can see own applications" ON public.applications
FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create applications" ON public.applications;
CREATE POLICY "Users can create applications" ON public.applications
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own revision_requested applications" ON public.applications;
CREATE POLICY "Users can update own revision_requested applications" ON public.applications
FOR UPDATE USING (
    user_id = (SELECT auth.uid()) 
    AND status = 'revision_requested'
);

DROP POLICY IF EXISTS "Staff can view all applications" ON public.applications;
CREATE POLICY "Staff can view all applications" ON public.applications
FOR SELECT USING (public.has_any_admin_permission((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can update applications" ON public.applications;
CREATE POLICY "Staff can update applications" ON public.applications
FOR UPDATE USING (public.can_manage((SELECT auth.uid()), 'applications'));

-- user_roles table
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
CREATE POLICY "Super admins can view all roles" ON public.user_roles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
CREATE POLICY "Super admins can insert roles" ON public.user_roles
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
CREATE POLICY "Super admins can delete roles" ON public.user_roles
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- admin_2fa_settings table
DROP POLICY IF EXISTS "Users can view own 2fa settings" ON public.admin_2fa_settings;
CREATE POLICY "Users can view own 2fa settings" ON public.admin_2fa_settings
FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own 2fa attempts" ON public.admin_2fa_settings;
CREATE POLICY "Users can update own 2fa attempts" ON public.admin_2fa_settings
FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Super admins can read all 2fa settings" ON public.admin_2fa_settings;
CREATE POLICY "Super admins can read all 2fa settings" ON public.admin_2fa_settings
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "Super admins can insert 2fa settings" ON public.admin_2fa_settings;
CREATE POLICY "Super admins can insert 2fa settings" ON public.admin_2fa_settings
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "Super admins can update 2fa settings" ON public.admin_2fa_settings;
CREATE POLICY "Super admins can update 2fa settings" ON public.admin_2fa_settings
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "Super admins can delete 2fa settings" ON public.admin_2fa_settings;
CREATE POLICY "Super admins can delete 2fa settings" ON public.admin_2fa_settings
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- notification_recipients table
DROP POLICY IF EXISTS "Users can view own notification status" ON public.notification_recipients;
CREATE POLICY "Users can view own notification status" ON public.notification_recipients
FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can mark own notifications as read" ON public.notification_recipients;
CREATE POLICY "Users can mark own notifications as read" ON public.notification_recipients
FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Staff can manage notification recipients" ON public.notification_recipients;
CREATE POLICY "Staff can manage notification recipients" ON public.notification_recipients
FOR ALL USING (public.can_manage((SELECT auth.uid()), 'notifications'));

-- user_global_notification_reads table
DROP POLICY IF EXISTS "Users can manage own global notification reads" ON public.user_global_notification_reads;
CREATE POLICY "Users can manage own global notification reads" ON public.user_global_notification_reads
FOR ALL USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can view global notification reads" ON public.user_global_notification_reads;
CREATE POLICY "Admins can view global notification reads" ON public.user_global_notification_reads
FOR SELECT USING (public.has_any_admin_permission((SELECT auth.uid())));

-- form_templates table
DROP POLICY IF EXISTS "Users can view active form templates via view" ON public.form_templates;
CREATE POLICY "Users can view active form templates via view" ON public.form_templates
FOR SELECT USING (is_active = true OR public.has_any_admin_permission((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can view form templates" ON public.form_templates;
CREATE POLICY "Staff can view form templates" ON public.form_templates
FOR SELECT USING (public.has_any_admin_permission((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can manage form templates" ON public.form_templates;
CREATE POLICY "Staff can manage form templates" ON public.form_templates
FOR ALL USING (public.can_manage((SELECT auth.uid()), 'forms'));

-- audit_logs table
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Super admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- notifications table
DROP POLICY IF EXISTS "Authenticated users can view their notifications" ON public.notifications;
CREATE POLICY "Authenticated users can view their notifications" ON public.notifications
FOR SELECT USING (
    is_global = true 
    OR EXISTS (
        SELECT 1 FROM public.notification_recipients nr
        WHERE nr.notification_id = id AND nr.user_id = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Staff can manage notifications" ON public.notifications;
CREATE POLICY "Staff can manage notifications" ON public.notifications
FOR ALL USING (public.can_manage((SELECT auth.uid()), 'notifications'));

-- admin_permissions table
DROP POLICY IF EXISTS "Staff can view permissions" ON public.admin_permissions;
CREATE POLICY "Staff can view permissions" ON public.admin_permissions
FOR SELECT USING (public.has_any_admin_permission((SELECT auth.uid())));

DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;
CREATE POLICY "Super admins can manage permissions" ON public.admin_permissions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- user_admin_permissions table
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_admin_permissions;
CREATE POLICY "Users can view own permissions" ON public.user_admin_permissions
FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Staff can view user permissions" ON public.user_admin_permissions;
CREATE POLICY "Staff can view user permissions" ON public.user_admin_permissions
FOR SELECT USING (public.has_any_admin_permission((SELECT auth.uid())));

DROP POLICY IF EXISTS "Super admins can manage user permissions" ON public.user_admin_permissions;
CREATE POLICY "Super admins can manage user permissions" ON public.user_admin_permissions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- updates table
DROP POLICY IF EXISTS "Staff can view all updates" ON public.updates;
CREATE POLICY "Staff can view all updates" ON public.updates
FOR SELECT USING (public.has_any_admin_permission((SELECT auth.uid())));

DROP POLICY IF EXISTS "Staff can insert updates" ON public.updates;
CREATE POLICY "Staff can insert updates" ON public.updates
FOR INSERT WITH CHECK (public.can_manage((SELECT auth.uid()), 'updates'));

DROP POLICY IF EXISTS "Staff can update updates" ON public.updates;
CREATE POLICY "Staff can update updates" ON public.updates
FOR UPDATE USING (public.can_manage((SELECT auth.uid()), 'updates'));

DROP POLICY IF EXISTS "Staff can delete updates" ON public.updates;
CREATE POLICY "Staff can delete updates" ON public.updates
FOR DELETE USING (public.can_manage((SELECT auth.uid()), 'updates'));

-- rules table
DROP POLICY IF EXISTS "Staff can insert rules" ON public.rules;
CREATE POLICY "Staff can insert rules" ON public.rules
FOR INSERT WITH CHECK (public.can_manage((SELECT auth.uid()), 'rules'));

DROP POLICY IF EXISTS "Staff can update rules" ON public.rules;
CREATE POLICY "Staff can update rules" ON public.rules
FOR UPDATE USING (public.can_manage((SELECT auth.uid()), 'rules'));

DROP POLICY IF EXISTS "Staff can delete rules" ON public.rules;
CREATE POLICY "Staff can delete rules" ON public.rules
FOR DELETE USING (public.can_manage((SELECT auth.uid()), 'rules'));

-- announcements table
DROP POLICY IF EXISTS "Staff can insert announcements" ON public.announcements;
CREATE POLICY "Staff can insert announcements" ON public.announcements
FOR INSERT WITH CHECK (public.can_manage((SELECT auth.uid()), 'announcements'));

DROP POLICY IF EXISTS "Staff can update announcements" ON public.announcements;
CREATE POLICY "Staff can update announcements" ON public.announcements
FOR UPDATE USING (public.can_manage((SELECT auth.uid()), 'announcements'));

DROP POLICY IF EXISTS "Staff can delete announcements" ON public.announcements;
CREATE POLICY "Staff can delete announcements" ON public.announcements
FOR DELETE USING (public.can_manage((SELECT auth.uid()), 'announcements'));

-- application_stats table
DROP POLICY IF EXISTS "Staff can manage application stats" ON public.application_stats;
CREATE POLICY "Staff can manage application stats" ON public.application_stats
FOR ALL USING (public.has_any_admin_permission((SELECT auth.uid())));

-- gallery_images table
DROP POLICY IF EXISTS "Staff can manage gallery images" ON public.gallery_images;
CREATE POLICY "Staff can manage gallery images" ON public.gallery_images
FOR ALL USING (public.can_manage((SELECT auth.uid()), 'gallery'));

-- glossary_terms table
DROP POLICY IF EXISTS "Staff can manage glossary terms" ON public.glossary_terms;
CREATE POLICY "Staff can manage glossary terms" ON public.glossary_terms
FOR ALL USING (public.can_manage((SELECT auth.uid()), 'glossary'));

-- whiteboards table
DROP POLICY IF EXISTS "Staff can manage whiteboards" ON public.whiteboards;
CREATE POLICY "Staff can manage whiteboards" ON public.whiteboards
FOR ALL USING (public.can_manage((SELECT auth.uid()), 'whiteboards'));

-- ai_settings table
DROP POLICY IF EXISTS "Super admins can manage ai_settings" ON public.ai_settings;
CREATE POLICY "Super admins can manage ai_settings" ON public.ai_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- ai_reports table
DROP POLICY IF EXISTS "Super admins can view ai_reports" ON public.ai_reports;
CREATE POLICY "Super admins can view ai_reports" ON public.ai_reports
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- ai_audit_log table
DROP POLICY IF EXISTS "Super admins can view ai_audit_log" ON public.ai_audit_log;
CREATE POLICY "Super admins can view ai_audit_log" ON public.ai_audit_log
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

-- ============================================
-- TAMAMLANDI
-- ============================================
