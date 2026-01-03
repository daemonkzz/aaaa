-- Fix 2FA Policies (Fixes 500 Error)

-- Drop existing failing policies
DROP POLICY IF EXISTS "Super admins can read all 2fa settings" ON public.admin_2fa_settings;
DROP POLICY IF EXISTS "Super admins can insert 2fa settings" ON public.admin_2fa_settings;
DROP POLICY IF EXISTS "Super admins can update 2fa settings" ON public.admin_2fa_settings;
DROP POLICY IF EXISTS "Super admins can delete 2fa settings" ON public.admin_2fa_settings;

-- Re-create policies with correct permissions
CREATE POLICY "Super admins can read all 2fa settings" ON public.admin_2fa_settings
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can insert 2fa settings" ON public.admin_2fa_settings
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can update 2fa settings" ON public.admin_2fa_settings
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can delete 2fa settings" ON public.admin_2fa_settings
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'
    )
);
