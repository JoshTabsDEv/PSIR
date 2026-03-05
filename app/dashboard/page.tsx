'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FilePlus, Search, Clock, X } from 'lucide-react';
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
    <div className="space-y-6 pb-12">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        <Link href="/dashboard/reports/new">
          <Button
            size="lg"
            className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 shadow-sm"
          >
            <FilePlus className="h-4 w-4" />
            New Investigation
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search reports by name, report number, or case number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="pl-10 pr-10 h-11 text-sm border-border focus-visible:ring-[var(--brand-primary)]/20 focus-visible:border-[var(--brand-primary)]"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            variant="outline"
            className="h-11 px-5 text-sm font-medium"
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Search Results
              <span className="ml-1.5 text-muted-foreground">({searchResults.length})</span>
            </h2>
            <button
              onClick={clearSearch}
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Clear Search
            </button>
          </div>
          <ReportsList reports={searchResults} showActions={true} />
        </div>
      )}

      {/* Main Dashboard Content */}
      {searchResults === null && (
        <>
          {/* Statistics */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">
              Overview
            </h2>
            <StatsCards
              totalReports={stats.totalReports}
              draftReports={stats.draftReports}
              completedReports={stats.completedReports}
              monthlyData={stats.monthlyData}
            />
          </div>

          {/* Analytics */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">
              Analytics
            </h2>
            <AnalyticsCharts
              totalReports={stats.totalReports}
              completedReports={stats.completedReports}
              draftReports={stats.draftReports}
              monthlyData={stats.monthlyData}
            />
          </div>

          {/* Recent Reports */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                Recent Reports
              </h2>
              <Link
                href="/dashboard/reports"
                className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
              >
                View All
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
