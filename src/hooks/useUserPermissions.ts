import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPermission, TabKey, ALL_TABS } from '@/types/permissions';

// Global cache - sayfa geçişlerinde permission'ları tekrar yüklememek için
let globalPermissionCache: {
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
  userId: string | null;
  fetchedAt: number;
} | null = null;

const CACHE_DURATION = 30 * 1000; // 30 saniye cache (yetki değişiklikleri için daha kısa)

// Cache temizleme fonksiyonu - yetki değişikliklerinde çağrılacak
export const clearPermissionCache = () => {
  globalPermissionCache = null;
};

interface UseUserPermissionsReturn {
  isSuperAdmin: boolean;
  isLoading: boolean;
  permissions: AdminPermission[];
  allowedTabs: TabKey[];
  canAccessTab: (tab: TabKey) => boolean;
  canManage: (feature: 'users' | 'applications' | 'forms' | 'updates' | 'rules' | 'gallery' | 'notifications' | 'whiteboard' | 'glossary') => boolean;
  // Yeni granüler yetki kontrolleri
  canBanUsers: boolean;
  canApproveApplications: boolean;
  canRejectApplications: boolean;
  canDeleteContent: boolean;
  canPublishContent: boolean;
  canUploadMedia: boolean;
  canSendGlobalNotifications: boolean;
  canSendTargetedNotifications: boolean;
  canSendDiscordDm: boolean;
  canManageWhitelist: boolean;
  canViewApplicationDetails: boolean;
  canViewAIConflicts: boolean;
  refetch: () => Promise<void>;
}

export const useUserPermissions = (): UseUserPermissionsReturn => {
  const { user } = useAuth();

  // Cache varsa ve geçerliyse, cache'den başla
  const cachedData = globalPermissionCache &&
    globalPermissionCache.userId === user?.id &&
    Date.now() - globalPermissionCache.fetchedAt < CACHE_DURATION;

  const [isSuperAdmin, setIsSuperAdmin] = useState(cachedData ? globalPermissionCache!.isSuperAdmin : false);
  const [isLoading, setIsLoading] = useState(!cachedData); // Cache varsa loading false
  const [permissions, setPermissions] = useState<AdminPermission[]>(cachedData ? globalPermissionCache!.permissions : []);

  const fetchPermissions = useCallback(async (forceRefetch = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Cache hala geçerliyse ve force değilse, skip
    if (!forceRefetch && globalPermissionCache &&
      globalPermissionCache.userId === user.id &&
      Date.now() - globalPermissionCache.fetchedAt < CACHE_DURATION) {
      setIsSuperAdmin(globalPermissionCache.isSuperAdmin);
      setPermissions(globalPermissionCache.permissions);
      setIsLoading(false);
      return;
    }

    try {
      // Check if user is super admin
      const { data: superAdminCheck, error: saError } = await supabase
        .rpc('is_super_admin', { _user_id: user.id });

      if (saError) {
        console.error('Super admin check error:', saError);
      }

      const isSA = superAdminCheck === true;
      setIsSuperAdmin(isSA);

      // Fetch user's permissions
      const { data: userPerms, error: permError } = await supabase
        .rpc('get_user_permissions', { _user_id: user.id });

      if (permError) {
        console.error('Fetch permissions error:', permError);
        setPermissions([]);
      } else {
        setPermissions(userPerms || []);
      }

      // Global cache'e kaydet
      globalPermissionCache = {
        isSuperAdmin: isSA,
        permissions: userPerms || [],
        userId: user.id,
        fetchedAt: Date.now()
      };
    } catch (error) {
      console.error('Permission check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Calculate allowed tabs
  const allowedTabs: TabKey[] = isSuperAdmin
    ? ['dashboard', 'basvurular', 'formlar', 'guncellemeler', 'bildirimler', 'kurallar', 'sozluk', 'galeri', 'canliharita', 'kullanicilar', 'yetkilendirme', '2fa']
    : (permissions.flatMap(p => p.allowed_tabs) as TabKey[]).filter((tab, idx, arr) => arr.indexOf(tab) === idx);

  const canAccessTab = useCallback((tab: TabKey): boolean => {
    if (isSuperAdmin) return true;
    return allowedTabs.includes(tab);
  }, [isSuperAdmin, allowedTabs]);

  const canManage = useCallback((feature: 'users' | 'applications' | 'forms' | 'updates' | 'rules' | 'gallery' | 'notifications' | 'whiteboard' | 'glossary'): boolean => {
    if (isSuperAdmin) return true;

    const featureMap: Record<string, keyof AdminPermission> = {
      users: 'can_manage_users',
      applications: 'can_manage_applications',
      forms: 'can_manage_forms',
      updates: 'can_manage_updates',
      rules: 'can_manage_rules',
      gallery: 'can_manage_gallery',
      notifications: 'can_manage_notifications',
      whiteboard: 'can_manage_whiteboard',
      glossary: 'can_manage_glossary',
    };

    return permissions.some(p => p[featureMap[feature]] === true);
  }, [isSuperAdmin, permissions]);

  // Yeni granüler yetki kontrolleri - super admin her şeyi yapabilir
  const hasPermission = useCallback((key: keyof AdminPermission): boolean => {
    if (isSuperAdmin) return true;
    return permissions.some(p => p[key] === true);
  }, [isSuperAdmin, permissions]);

  const canBanUsers = hasPermission('can_ban_users');
  const canApproveApplications = hasPermission('can_approve_applications');
  const canRejectApplications = hasPermission('can_reject_applications');
  const canDeleteContent = hasPermission('can_delete_content');
  const canPublishContent = hasPermission('can_publish_content');
  const canUploadMedia = hasPermission('can_upload_media');
  const canSendGlobalNotifications = hasPermission('can_send_global_notifications');
  const canSendTargetedNotifications = hasPermission('can_send_targeted_notifications');
  const canSendDiscordDm = hasPermission('can_send_discord_dm');
  const canManageWhitelist = hasPermission('can_manage_whitelist');
  const canViewApplicationDetails = hasPermission('can_view_application_details');
  const canViewAIConflicts = hasPermission('can_view_ai_conflicts');

  return {
    isSuperAdmin,
    isLoading,
    permissions,
    allowedTabs,
    canAccessTab,
    canManage,
    // Yeni granüler yetkiler
    canBanUsers,
    canApproveApplications,
    canRejectApplications,
    canDeleteContent,
    canPublishContent,
    canUploadMedia,
    canSendGlobalNotifications,
    canSendTargetedNotifications,
    canSendDiscordDm,
    canManageWhitelist,
    canViewApplicationDetails,
    canViewAIConflicts,
    refetch: () => fetchPermissions(true), // Force refetch
  };
};
