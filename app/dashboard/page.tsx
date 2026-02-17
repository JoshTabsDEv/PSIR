'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ReportsList } from '@/components/dashboard/ReportsList';
import type { DashboardStats, PSIRReport } from '@/types/psir';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    draftReports: 0,
    completedReports: 0,
    recentReports: [],
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Welcome to the PSIR Management System
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/search">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </Link>
          <Link href="/dashboard/reports/new">
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        totalReports={stats.totalReports}
        draftReports={stats.draftReports}
        completedReports={stats.completedReports}
      />

      {/* Recent Reports */}
      <ReportsList
        reports={stats.recentReports as PSIRReport[]}
        title="Recent Reports"
        showActions={true}
      />

      {/* Quick Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold mb-2">About PSIR</h3>
          <p className="text-sm text-gray-600">
            The Post-Sentence Investigation Report (PSIR) is a comprehensive
            document used by the Bureau of Corrections to assess offenders
            for rehabilitation and eventual reintegration into society.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold mb-2">Quick Tips</h3>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Auto-save is enabled for all reports</li>
            <li>Save drafts to continue later</li>
            <li>Export completed reports as PDF or DOCX</li>
            <li>Use search to find existing reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
