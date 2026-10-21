'use client';

import { useState } from 'react';
import { REPORT_DOCUMENTS, type ReportDocument } from '@/lib/docx/documents';
import { PsNumberDialog } from '@/components/psir/PsNumberDialog';
import Link from 'next/link';
import { Eye, Pencil, Trash2, FileDown, FolderOpen, MoreHorizontal, CalendarCheck, AlertTriangle } from 'lucide-react';
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

type DateKind = 'court' | 'granted' | 'received';

interface DateDialogConfig {
  menu: string;
  title: string;
  label: string;
  note: string;
  confirm: string;
  endpoint: 'submit' | 'dates';
  field: 'submittedToCourtDate' | 'probationGrantedDate' | 'probationOrderReceivedDate';
}

const DATE_DIALOGS: Record<DateKind, DateDialogConfig> = {
  court: {
    menu: 'Set Date PSIR Submitted to Court',
    title: 'Set Date PSIR Submitted to Court',
    label: 'Date PSIR Submitted to Court',
    note: 'Setting this date marks the report as Completed.',
    confirm: 'Confirm & Complete',
    endpoint: 'submit',
    field: 'submittedToCourtDate',
  },
  granted: {
    menu: 'Set Date Probation Granted',
    title: 'Set Date Probation Granted',
    label: 'Date Probation Granted',
    note: 'Printed on the Client Profile and as the Date of Probation Order on the Final Report.',
    confirm: 'Save',
    endpoint: 'dates',
    field: 'probationGrantedDate',
  },
  received: {
    menu: 'Set Date Probation Order Received',
    title: 'Set Date Probation Order Received',
    label: 'Date Probation Order Received',
    note: 'Printed on the Client Profile and the sheets linked to it.',
    confirm: 'Save',
    endpoint: 'dates',
    field: 'probationOrderReceivedDate',
  },
};

interface ReportsListProps {
  reports: PSIRReport[];
  title?: string;
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
  const [courtDateDialog, setCourtDateDialog] = useState<{ open: boolean; reportId: string; reportNumber: string; kind: DateKind }>({
    open: false,
    reportId: '',
    reportNumber: '',
    kind: 'court',
  });
  const [psPrompt, setPsPrompt] = useState<{ report: PSIRReport; doc: ReportDocument } | null>(null);
  const [editWarning, setEditWarning] = useState<{ open: boolean; reportId: string }>({
    open: false,
    reportId: '',
  });
  const [courtDate, setCourtDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openCourtDateDialog = (report: PSIRReport, kind: DateKind = 'court') => {
    const current =
      kind === 'court' ? report.submittedToCourtDate : kind === 'granted' ? report.probationGrantedDate : report.probationOrderReceivedDate;
    setCourtDate(current ? new Date(current).toISOString().split('T')[0] : '');
    setError('');
    setCourtDateDialog({ open: true, reportId: report._id!, reportNumber: report.reportNumber, kind });
  };

  const closeDateDialog = () => setCourtDateDialog((d) => ({ ...d, open: false }));

  const downloadDocument = (report: PSIRReport, doc: ReportDocument) => {
    window.open(doc.href(report._id!), '_blank');
  };

  const exportDocument = (report: PSIRReport, doc: ReportDocument) => {
    if (doc.requiresPsNumber && !report.psNumber?.trim()) {
      setPsPrompt({ report, doc }); // ask for the PS No. first, download after save
      return;
    }
    downloadDocument(report, doc);
  };

  const handleEditClick = (report: PSIRReport) => {
    if (report.status === 'completed') {
      setEditWarning({ open: true, reportId: report._id! });
    } else {
      window.location.href = `/reports/${report._id}/edit`;
    }
  };

  const handleSetCourtDate = async () => {
    if (!courtDate) {
      setError('Please select a date.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const cfg = DATE_DIALOGS[courtDateDialog.kind];
      const res = await fetch(`/api/reports/${courtDateDialog.reportId}/${cfg.endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [cfg.field]: courtDate }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.error || 'Failed to save date.');
        return;
      }
      onReportUpdated?.(result.data);
      closeDateDialog();
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
            action={{ label: 'New Investigation', href: '/reports/new' }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-6">
                Investigation Docket Number
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
                {/* Investigation Docket Number */}
                <TableCell className="px-6">
                  <span className="inline-flex items-center font-mono text-xs font-medium text-foreground/80 bg-muted/60 px-2.5 py-1 rounded-md">
                    {report.identifyingData.investigationDocketNumber}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditClick(report)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
                        <DropdownMenuContent align="end" sideOffset={4} collisionPadding={8} className="w-52">
                          {REPORT_DOCUMENTS.map((doc) => (
                            <DropdownMenuItem
                              key={doc.key}
                              className="gap-2 cursor-pointer"
                              onClick={() => exportDocument(report, doc)}
                            >
                              <FileDown className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Export {doc.label}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          {(Object.keys(DATE_DIALOGS) as DateKind[]).map((kind) => (
                            <DropdownMenuItem
                              key={kind}
                              className="gap-2 cursor-pointer"
                              onClick={() => openCourtDateDialog(report, kind)}
                            >
                              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{DATE_DIALOGS[kind].menu}</span>
                            </DropdownMenuItem>
                          ))}
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
      <Dialog open={courtDateDialog.open} onOpenChange={(open) => !open && closeDateDialog()}>
        <DialogContent onClose={closeDateDialog} className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[var(--brand-primary)]" />
              {DATE_DIALOGS[courtDateDialog.kind].title}
            </DialogTitle>
            <DialogDescription>
              <span className="font-mono text-xs">{courtDateDialog.reportNumber}</span>
              {' '}— {DATE_DIALOGS[courtDateDialog.kind].note}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <Label htmlFor="court-date">{DATE_DIALOGS[courtDateDialog.kind].label}</Label>
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
            <Button variant="outline" onClick={closeDateDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSetCourtDate}
              disabled={submitting || !courtDate}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90"
            >
              {submitting ? 'Saving...' : DATE_DIALOGS[courtDateDialog.kind].confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PsNumberDialog
        open={Boolean(psPrompt)}
        reportId={psPrompt?.report._id ?? ''}
        initialValue={psPrompt?.report.psNumber ?? ''}
        onCancel={() => setPsPrompt(null)}
        onSaved={(psNumber) => {
          const pending = psPrompt;
          setPsPrompt(null);
          if (!pending) return;
          const updated = { ...pending.report, psNumber };
          onReportUpdated?.(updated);
          downloadDocument(updated, pending.doc);
        }}
      />

      {/* Edit Warning Dialog */}
      <Dialog open={editWarning.open} onOpenChange={(open) => !open && setEditWarning({ open: false, reportId: '' })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--brand-primary)]">
              <AlertTriangle className="h-5 w-5" />
              Editing Completed Report
            </DialogTitle>
            <DialogDescription>
              This report has been marked as <strong>completed</strong> and submitted to court. 
              Editing may affect the official record. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditWarning({ open: false, reportId: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                window.location.href = `/reports/${editWarning.reportId}/edit`;
              }}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]"
            >
              Continue Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
