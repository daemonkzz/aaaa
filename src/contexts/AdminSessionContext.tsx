import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Admin2FASettings } from '@/types/admin2fa';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const SESSION_KEY = 'admin_2fa_session';
const SESSION_EXPIRY_KEY = 'admin_2fa_session_expiry';

interface AdminSessionContextType {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  lockSession: () => void;
  remainingTime: number | null;
  admin2FASettings: Admin2FASettings | null;
  refetch2FASettings: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(undefined);

export const useAdminSession = () => {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error('useAdminSession must be used within an AdminSessionProvider');
  }
  return context;
};

// Get stored session expiry (ms) for this user, if valid
const getStoredSessionExpiry = (userId: string): number | null => {
  try {
    const storedUserId = sessionStorage.getItem(SESSION_KEY);
    const expiryStr = sessionStorage.getItem(SESSION_EXPIRY_KEY);

    if (!storedUserId || !expiryStr || storedUserId !== userId) {
      return null;
    }

    const expiry = parseInt(expiryStr, 10);
    if (!Number.isFinite(expiry) || Date.now() > expiry) {
      // Session expired, clear it
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      return null;
    }

    return expiry;
  } catch {
    return null;
  }
};

// Save/extend session in storage and return expiry (ms)
const saveSession = (userId: string): number | null => {
  try {
    const expiry = Date.now() + IDLE_TIMEOUT;
    sessionStorage.setItem(SESSION_KEY, userId);
    sessionStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
    return expiry;
  } catch {
    return null;
  }
};

// Clear session from storage
const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const AdminSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin2FASettings, setAdmin2FASettings] = useState<Admin2FASettings | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Check stored session when auth state settles (avoid clearing on initial refresh)
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      const expiry = getStoredSessionExpiry(user.id);
      const hasValidSession = !!expiry;

      setIsAdminAuthenticated(hasValidSession);
      setRemainingTime(null);

      if (!hasValidSession) {
        // Expired/wrong user session, keep storage clean
        clearSession();
      }
    } else {
      setIsAdminAuthenticated(false);
      setRemainingTime(null);
      clearSession();
    }
  }, [user, authLoading]);

  // Fetch user's 2FA settings from the secure view (excludes totp_secret)
  const fetch2FASettings = useCallback(async () => {
    // Wait until auth state is resolved; otherwise refresh (F5) briefly looks like "no user"
    if (authLoading) return;

    if (!user) {
      setAdmin2FASettings(null);
      setIsLoading(false);
      return;
    }

    try {
      // Use the secure view that doesn't expose totp_secret
      const { data, error } = await supabase
        .from('admin_2fa_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching 2FA settings:', error);
      }

      // Map the view data to the Admin2FASettings type (without totp_secret)
      if (data) {
        setAdmin2FASettings({
          ...data,
          totp_secret: null, // Never exposed from view
        } as Admin2FASettings);
      } else {
        setAdmin2FASettings(null);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching 2FA settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetch2FASettings();
  }, [fetch2FASettings]);

  const isInAdminArea = location.pathname.startsWith('/admin') && location.pathname !== '/admin/locked';

  const createOrExtendSession = useCallback(
    (uid?: string | null) => {
      if (!uid) return null;
      const expiry = saveSession(uid);
      return expiry;
    },
    []
  );

  // Lock session and redirect to lock screen
  const lockSession = useCallback(() => {
    if (location.pathname !== '/admin/locked' && location.pathname.startsWith('/admin')) {
      setIsAdminAuthenticated(false);
      setRemainingTime(null);
      clearSession();
      navigate('/admin/locked', { state: { from: location.pathname } });
    }
  }, [navigate, location.pathname]);

  // Handle idle timeout
  const onIdle = useCallback(
    () => {
      if (isAdminAuthenticated && isInAdminArea) {
        lockSession();
      }
    },
    [isAdminAuthenticated, isInAdminArea, lockSession]
  );

  const onAction = useCallback(
    () => {
      if (!user?.id || !isAdminAuthenticated || !isInAdminArea) return;
      createOrExtendSession(user.id);
    },
    [user?.id, isAdminAuthenticated, isInAdminArea, createOrExtendSession]
  );

  const onActive = useCallback(
    () => {
      if (!user?.id || !isAdminAuthenticated || !isInAdminArea) return;
      createOrExtendSession(user.id);
    },
    [user?.id, isAdminAuthenticated, isInAdminArea, createOrExtendSession]
  );

  // Idle timer
  useIdleTimer({
    timeout: IDLE_TIMEOUT,
    onIdle,
    onAction,
    onActive,
    debounce: 500,
    disabled: !isAdminAuthenticated || !isInAdminArea,
  });

  // Update remaining time from session expiry in storage (stable + always decrements)
  useEffect(() => {
    if (!isAdminAuthenticated || !user?.id || !isInAdminArea) {
      setRemainingTime(null);
      return;
    }

    // Treat entering the admin area as activity: start a fresh 10:00 window.
    createOrExtendSession(user.id);

    const tick = () => {
      const expiry = getStoredSessionExpiry(user.id);
      if (!expiry) {
        lockSession();
        return;
      }

      const remainingSec = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      setRemainingTime(remainingSec);

      if (remainingSec <= 0) {
        lockSession();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isAdminAuthenticated, user?.id, isInAdminArea, createOrExtendSession, lockSession]);

  // Verify 2FA code via secure Edge Function
  const verify2FA = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !admin2FASettings) {
      return { success: false, error: '2FA ayarları bulunamadı' };
    }

    if (admin2FASettings.is_blocked) {
      return { success: false, error: 'Hesabınız bloklanmış. Yönetici ile iletişime geçin.' };
    }

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'Oturum bulunamadı' };
      }

      // Call the secure Edge Function for TOTP verification
      const response = await fetch(
        'https://bbuatycybtwblwyychag.supabase.co/functions/v1/verify-totp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsAdminAuthenticated(true);
        setRemainingTime(null);
        createOrExtendSession(user.id);
        return { success: true };
      } else {
        // Refresh settings to get updated failed_attempts
        await fetch2FASettings();
        return { success: false, error: result.error || 'Doğrulama başarısız' };
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('2FA verification error:', error);
      return { success: false, error: 'Doğrulama sırasında hata oluştu' };
    }
  }, [user, admin2FASettings, fetch2FASettings, createOrExtendSession]);

  return (
    <AdminSessionContext.Provider
      value={{
        isAdminAuthenticated,
        isLoading,
        verify2FA,
        lockSession,
        remainingTime,
        admin2FASettings,
        refetch2FASettings: fetch2FASettings,
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
};
