import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyStats {
  date: string;
  count: number;
}

interface StatusStats {
  pending: number;
  approved: number;
  rejected: number;
  revision_requested: number;
}

interface AdminStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  activeForms: number;
  totalForms: number;
  publishedUpdates: number;
  draftUpdates: number;
  dailyApplications: DailyStats[];
  statusDistribution: StatusStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminStats = (): AdminStats => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    activeForms: 0,
    totalForms: 0,
    publishedUpdates: 0,
    draftUpdates: 0,
    dailyApplications: [] as DailyStats[],
    statusDistribution: { pending: 0, approved: 0, rejected: 0, revision_requested: 0 } as StatusStats,
  });

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [applicationsRes, formsRes, updatesRes] = await Promise.all([
        supabase.from('applications').select('id, status, created_at'),
        supabase.from('form_templates').select('id, is_active'),
        supabase.from('updates').select('id, is_published'),
      ]);

      if (applicationsRes.error) throw applicationsRes.error;
      if (formsRes.error) throw formsRes.error;
      if (updatesRes.error) throw updatesRes.error;

      const applications = applicationsRes.data || [];
      const forms = formsRes.data || [];
      const updates = updatesRes.data || [];

      // Calculate application stats
      const statusDistribution: StatusStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        revision_requested: 0,
      };

      applications.forEach((app) => {
        const status = app.status as keyof StatusStats;
        if (status in statusDistribution) {
          statusDistribution[status]++;
        }
      });

      // Calculate daily applications for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyMap = new Map<string, number>();
      
      // Initialize all dates with 0
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, 0);
      }

      // Count applications per day
      applications.forEach((app) => {
        const dateStr = new Date(app.created_at).toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
        }
      });

      const dailyApplications = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        totalApplications: applications.length,
        pendingApplications: statusDistribution.pending,
        approvedApplications: statusDistribution.approved,
        rejectedApplications: statusDistribution.rejected,
        activeForms: forms.filter((f) => f.is_active).length,
        totalForms: forms.length,
        publishedUpdates: updates.filter((u) => u.is_published).length,
        draftUpdates: updates.filter((u) => !u.is_published).length,
        dailyApplications,
        statusDistribution,
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError('İstatistikler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    ...stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
