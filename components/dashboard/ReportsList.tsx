'use client';

import Link from 'next/link';
import { Eye, Pencil, Trash2, FileDown, FolderOpen, MoreHorizontal } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

interface ReportsListProps {
  reports: PSIRReport[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function ReportsList({
  reports,
  showActions = true,
  onDelete,
}: ReportsListProps) {
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

              {/* Date */}
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
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => window.open(`/api/reports/${report._id}/export/docx`, '_blank')}
                        >
                          <FileDown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Export DOCX</span>
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
  );
}
