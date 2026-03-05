'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FilePlus, Search, Clock, X, FileDown, Loader2, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

  // Monthly summary export state
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryMonth, setSummaryMonth] = useState(() => (new Date().getMonth() + 1).toString());
  const [summaryYear, setSummaryYear] = useState(() => new Date().getFullYear().toString());
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingTev, setExportingTev] = useState(false);

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

  const handleExportMonthlySummary = useCallback(async () => {
    setExportingPdf(true);
    try {
      const url = `/api/reports/export/monthly-summary?month=${summaryMonth}&year=${summaryYear}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate summary');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Extract filename from Content-Disposition header or build one
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      link.download = filenameMatch?.[1] || `PSIR-Monthly-Summary-${summaryMonth}-${summaryYear}.docx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSummaryDialogOpen(false);
    } catch (error) {
      console.error('Monthly summary export failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to export monthly summary');
    } finally {
      setExportingPdf(false);
    }
  }, [summaryMonth, summaryYear]);

  const handleExportTEV = useCallback(async () => {
    setExportingTev(true);
    try {
      const url = `/api/reports/export/tev?month=${summaryMonth}&year=${summaryYear}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate TEV export');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      link.download = filenameMatch?.[1] || `TEV-${summaryMonth}-${summaryYear}.docx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSummaryDialogOpen(false);
    } catch (error) {
      console.error('TEV export failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to export TEV');
    } finally {
      setExportingTev(false);
    }
  }, [summaryMonth, summaryYear]);

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

        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="gap-2 shadow-sm"
            onClick={() => setSummaryDialogOpen(true)}
          >
            <FileDown className="h-4 w-4" />
            Monthly Summary
          </Button>
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

      {/* Monthly Summary Export Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent onClose={() => setSummaryDialogOpen(false)} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Reports</DialogTitle>
            <DialogDescription>
              Select a month and year to generate a DOCX export of PSIR reports.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="summary-month">Month</Label>
              <Select
                id="summary-month"
                value={summaryMonth}
                onChange={(e) => setSummaryMonth(e.target.value)}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary-year">Year</Label>
              <Select
                id="summary-year"
                value={summaryYear}
                onChange={(e) => setSummaryYear(e.target.value)}
              >
                {Array.from({ length: 25 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  );
                })}
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setSummaryDialogOpen(false)}
              disabled={exportingPdf || exportingTev}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportTEV}
              disabled={exportingPdf || exportingTev}
              variant="outline"
              className="gap-2"
            >
              {exportingTev ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Export TEV
                </>
              )}
            </Button>
            <Button
              onClick={handleExportMonthlySummary}
              disabled={exportingPdf || exportingTev}
              className="gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90"
            >
              {exportingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Monthly Summary
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
