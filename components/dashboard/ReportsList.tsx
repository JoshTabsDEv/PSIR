'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2, FileDown, FolderOpen, MoreHorizontal, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

interface ReportsListProps {
  reports: PSIRReport[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onReportUpdated?: (updated: PSIRReport) => void;
}

export function ReportsList({
  reports,
  showActions = true,
  onDelete,
  onReportUpdated,
}: ReportsListProps) {
  const [courtDateDialog, setCourtDateDialog] = useState<{ open: boolean; reportId: string; reportNumber: string }>({
    open: false,
    reportId: '',
    reportNumber: '',
  });
  const [courtDate, setCourtDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openCourtDateDialog = (report: PSIRReport) => {
    setCourtDate('');
    setError('');
    setCourtDateDialog({ open: true, reportId: report._id!, reportNumber: report.reportNumber });
  };

  const handleSetCourtDate = async () => {
    if (!courtDate) {
      setError('Please select a date.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/reports/${courtDateDialog.reportId}/submit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedToCourtDate: courtDate }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.error || 'Failed to save date.');
        return;
      }
      onReportUpdated?.(result.data);
      setCourtDateDialog({ open: false, reportId: '', reportNumber: '' });
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reports.length === 0) {
    return (
      <Card className="border-dashed bg-muted/5">
        <CardContent className="pt-6">
          <EmptyState
            icon={FolderOpen}
            title="Registry Empty"
            description="No investigation reports found. Initiate a new case to begin."
            action={{ label: 'New Investigation', href: '/dashboard/reports/new' }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6">
                Report ID
              </TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Subject Name
              </TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Submitted to Court
              </TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-6">
                Date Created
              </TableHead>
              {showActions && (
                <TableHead className="h-12 w-[100px] pr-6" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report._id}
                className="group hover:bg-muted/30 transition-colors"
              >
                {/* Report ID */}
                <TableCell className="px-6">
                  <span className="inline-flex items-center font-mono text-xs font-medium text-foreground/80 bg-muted/60 px-2.5 py-1 rounded-md">
                    {report.reportNumber}
                  </span>
                </TableCell>

                {/* Subject Name */}
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {formatFullName(
                        report.identifyingData.lastName,
                        report.identifyingData.firstName,
                        report.identifyingData.middleName
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {report.criminalHistory?.presentOffense?.chargedWith
                        ? report.criminalHistory.presentOffense.chargedWith
                        : `Filed ${formatDateDisplay(report.createdAt)}`}
                    </span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {report.status === 'completed' ? (
                    <Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20 hover:bg-[var(--color-success)]/15">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-[var(--color-warning)]/40 text-[var(--color-warning)] bg-[var(--color-warning)]/5 hover:bg-[var(--color-warning)]/10">
                      Draft
                    </Badge>
                  )}
                </TableCell>

                {/* Submitted to Court */}
                <TableCell>
                  {report.submittedToCourtDate ? (
                    <span className="text-sm text-muted-foreground">
                      {formatDateDisplay(report.submittedToCourtDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">—</span>
                  )}
                </TableCell>

                {/* Date Created */}
                <TableCell className="text-right pr-6">
                  <span className="text-sm text-muted-foreground">
                    {formatDateDisplay(report.createdAt)}
                  </span>
                </TableCell>

                {/* Actions */}
                {showActions && (
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/reports/${report._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/reports/${report._id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => window.open(`/api/reports/${report._id}/export/docx`, '_blank')}
                          >
                            <FileDown className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Export DOCX</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => openCourtDateDialog(report)}
                          >
                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Set Court Submit Date</span>
                          </DropdownMenuItem>
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                                onClick={() => onDelete(report._id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="text-sm">Delete Report</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Court Date Dialog */}
      <Dialog
        open={courtDateDialog.open}
        onOpenChange={(open) => !open && setCourtDateDialog({ open: false, reportId: '', reportNumber: '' })}
      >
        <DialogContent onClose={() => setCourtDateDialog({ open: false, reportId: '', reportNumber: '' })} className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[var(--brand-primary)]" />
              Set Submitted to Court Date
            </DialogTitle>
            <DialogDescription>
              <span className="font-mono text-xs">{courtDateDialog.reportNumber}</span>
              {' '}— Setting this date will automatically mark the report as{' '}
              <strong>Completed</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <Label htmlFor="court-date">Date Submitted to Court</Label>
            <Input
              id="court-date"
              type="date"
              value={courtDate}
              onChange={(e) => { setCourtDate(e.target.value); setError(''); }}
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourtDateDialog({ open: false, reportId: '', reportNumber: '' })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetCourtDate}
              disabled={submitting || !courtDate}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90"
            >
              {submitting ? 'Saving...' : 'Confirm & Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
