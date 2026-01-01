import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UpdateData } from '@/types/update';

interface UpdatedRule {
  id: string;
  title: string;
  categoryTitle: string;
}

interface UseDiscordNotificationReturn {
  sendUpdateNotification: (update: UpdateData) => Promise<boolean>;
  sendRulesNotification: (updatedRules: UpdatedRule[]) => Promise<boolean>;
  isSending: boolean;
}

export const useDiscordNotification = (): UseDiscordNotificationReturn => {
  const [isSending, setIsSending] = useState(false);

  const getSiteUrl = (): string => {
    // Use the current origin for the site URL
    return window.location.origin;
  };

  const sendUpdateNotification = async (update: UpdateData): Promise<boolean> => {
    if (!update.id) {
      toast.error('Güncelleme ID bulunamadı');
      return false;
    }

    if (!update.is_published) {
      toast.error('Sadece yayında olan güncellemeler Discord\'a gönderilebilir');
      return false;
    }

    setIsSending(true);
    try {
      const payload = {
        type: 'update' as const,
        title: update.title,
        subtitle: update.subtitle,
        category: update.category,
        version: update.version,
        coverImageUrl: update.cover_image_url,
        updateId: update.id,
        siteUrl: getSiteUrl(),
      };

      const { data, error } = await supabase.functions.invoke('send-to-discord', {
        body: payload,
      });

      if (error) {
        console.error('Discord notification error:', error);
        toast.error('Discord\'a gönderilirken hata oluştu');
        return false;
      }

      toast.success('Güncelleme Discord\'a gönderildi!');
      return true;
    } catch (error) {
      console.error('Discord notification error:', error);
      toast.error('Discord\'a gönderilirken hata oluştu');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const sendRulesNotification = async (updatedRules: UpdatedRule[]): Promise<boolean> => {
    if (updatedRules.length === 0) {
      toast.error('Güncellenen kural bulunamadı');
      return false;
    }

    setIsSending(true);
    try {
      const payload = {
        type: 'rules' as const,
        updatedRules,
        siteUrl: getSiteUrl(),
      };

      const { data, error } = await supabase.functions.invoke('send-to-discord', {
        body: payload,
      });

      if (error) {
        console.error('Discord notification error:', error);
        toast.error('Discord\'a gönderilirken hata oluştu');
        return false;
      }

      toast.success('Kural güncellemesi Discord\'a gönderildi!');
      return true;
    } catch (error) {
      console.error('Discord notification error:', error);
      toast.error('Discord\'a gönderilirken hata oluştu');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendUpdateNotification,
    sendRulesNotification,
    isSending,
  };
};
