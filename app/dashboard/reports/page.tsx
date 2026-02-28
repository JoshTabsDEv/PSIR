'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FilePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ReportsList } from '@/components/dashboard/ReportsList';
import { ReportsFilters } from '@/components/dashboard/ReportsFilters';
import { ReportsListSkeleton } from '@/components/dashboard/ReportsListSkeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { PSIRReport, PaginatedResponse } from '@/types/psir';

export default function ReportsPage() {
  const [reports, setReports] = useState<PSIRReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: status,
      });
      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/reports?${params}`);
      const result: PaginatedResponse<PSIRReport> = await response.json();

      if (result.success) {
        setReports(result.data);
        setTotalPages(result.pagination.totalPages);
      } else {
        toast.error('Failed to load reports', {
          description: result.error || 'Could not fetch reports.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports', {
        description: 'An error occurred while loading reports.',
      });
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = () => {
    setPage(1);
    fetchReports();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/reports/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Report deleted', {
          description: 'The report has been permanently deleted.',
        });
        setDeleteId(null);
        fetchReports();
      } else {
        const result = await response.json().catch(() => ({}));
        toast.error('Failed to delete report', {
          description: result.error || 'An error occurred while deleting.',
        });
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report', {
        description: 'An error occurred while deleting the report.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Reports</h1>
          <p className="text-gray-600">
            Manage all PSIR reports
          </p>
        </div>
        <Link href="/dashboard/reports/new">
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <ReportsFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onSearch={handleSearch}
      />

      {/* Reports List */}
      {loading ? (
        <ReportsListSkeleton rows={8} />
      ) : (
        <>
          <ReportsList
            reports={reports}
            title="Reports"
            showActions={true}
            onDelete={(id) => setDeleteId(id)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent onClose={() => setDeleteId(null)}>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
