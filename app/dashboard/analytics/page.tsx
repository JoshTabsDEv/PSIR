'use client';

import { useEffect, useState } from 'react';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import type { DashboardStats } from '@/types/psir';
import RealTimeClock from '@/components/RealTimeClock';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    draftReports: 0,
    completedReports: 0,
    recentReports: [],
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/reports/stats');
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Analytics Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
        <RealTimeClock title="Analytics" className="space-y-1.5" />
      </div>

      {/* Charts */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">
          Performance Metrics
        </h2>
        <AnalyticsCharts
          totalReports={stats.totalReports}
          completedReports={stats.completedReports}
          draftReports={stats.draftReports}
          monthlyData={stats.monthlyData}
        />
      </div>
    </div>
  );
}
