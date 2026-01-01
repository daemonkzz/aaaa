import { FileText, Check, Clock, X, Settings, Bell, Loader2, RefreshCw } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { StatsCard } from './StatsCard';
import { ApplicationChart } from './ApplicationChart';
import { CategoryPieChart } from './CategoryPieChart';
import { Button } from '@/components/ui/button';

export const DashboardStats = () => {
  const {
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    activeForms,
    totalForms,
    publishedUpdates,
    draftUpdates,
    dailyApplications,
    statusDistribution,
    isLoading,
    error,
    refetch,
  } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Genel istatistikler ve özet bilgiler</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Toplam Başvuru"
          value={totalApplications}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Bekleyen"
          value={pendingApplications}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Onaylanan"
          value={approvedApplications}
          icon={Check}
          variant="success"
        />
        <StatsCard
          title="Reddedilen"
          value={rejectedApplications}
          icon={X}
          variant="danger"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Aktif Formlar"
          value={activeForms}
          icon={Settings}
          description={`${totalForms} toplam form`}
          variant="default"
        />
        <StatsCard
          title="Yayında Güncellemeler"
          value={publishedUpdates}
          icon={Bell}
          description={`${draftUpdates} taslak`}
          variant="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationChart data={dailyApplications} />
        <CategoryPieChart data={statusDistribution} />
      </div>
    </div>
  );
};
