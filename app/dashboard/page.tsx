'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FilePlus, Search, LayoutDashboard, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ReportsList } from '@/components/dashboard/ReportsList';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import type { DashboardStats, PSIRReport } from '@/types/psir';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    draftReports: 0,
    completedReports: 0,
    recentReports: [],
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PSIRReport[] | null>(null);
  const [searching, setSearching] = useState(false);

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

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/reports?search=${encodeURIComponent(query)}&limit=10`);
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            <LayoutDashboard className="h-3 w-3" />
            Management Console
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/reports/new">
            <Button className="h-9 px-5 font-bold uppercase tracking-wider text-[10px] gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 shadow-md shadow-[var(--brand-primary)]/15">
              <FilePlus className="h-3.5 w-3.5" />
              New Investigation
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="relative max-w-2xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search reports by name, report number, or case number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="pl-10 pr-10 h-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            variant="outline"
            className="h-10 px-4 text-[10px] font-bold uppercase tracking-wider"
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Search Results (shown when searching) */}
      {searchResults !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-[var(--brand-primary)]/30" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Search Results ({searchResults.length})
              </h2>
            </div>
            <button
              onClick={clearSearch}
              className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] hover:underline"
            >
              Clear Search
            </button>
          </div>
          <ReportsList reports={searchResults} showActions={true} />
        </div>
      )}

      {/* Main Dashboard Content (hidden during search) */}
      {searchResults === null && (
        <>
          {/* Statistics Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-[var(--brand-primary)]/30" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                System Overview
              </h2>
            </div>
            <StatsCards
              totalReports={stats.totalReports}
              draftReports={stats.draftReports}
              completedReports={stats.completedReports}
              monthlyData={stats.monthlyData}
            />
          </div>

          {/* Analytics Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-[var(--brand-primary)]/30" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Performance Analytics
              </h2>
            </div>
            <AnalyticsCharts
              totalReports={stats.totalReports}
              completedReports={stats.completedReports}
              draftReports={stats.draftReports}
              monthlyData={stats.monthlyData}
            />
          </div>

          {/* Recent Reports */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-[var(--brand-primary)]/30" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Recent Case Files
                </h2>
              </div>
              <Link
                href="/dashboard/reports"
                className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] hover:underline"
              >
                View All Reports
              </Link>
            </div>
            <ReportsList
              reports={stats.recentReports as PSIRReport[]}
              showActions={true}
            />
          </div>
        </>
      )}
    </div>
  );
}
