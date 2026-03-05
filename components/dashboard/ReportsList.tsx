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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from '@/components/ui/card';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';
import { cn } from '@/lib/utils';

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
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden ring-1 ring-black/[0.02]">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
            <TableHead className="h-11 text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-6">Report ID</TableHead>
            <TableHead className="h-11 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject Name</TableHead>
            <TableHead className="h-11 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
            <TableHead className="h-11 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Creation Date</TableHead>
            {showActions && <TableHead className="h-11 w-[50px] pr-6"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report._id} className="group hover:bg-muted/5 transition-colors">
              <TableCell className="pl-6">
                <span className="font-mono text-[11px] font-semibold text-foreground/70 bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                  {report.reportNumber}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-foreground uppercase">
                    {formatFullName(
                      report.identifyingData.lastName,
                      report.identifyingData.firstName,
                      report.identifyingData.middleName
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground lowercase">investigation file</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full ring-2 ring-offset-1",
                    report.status === 'completed' 
                      ? "bg-green-500 ring-green-500/20" 
                      : "bg-orange-500 ring-orange-500/20"
                  )} />
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    report.status === 'completed' ? "text-green-700" : "text-orange-700"
                  )}>
                    {report.status}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatDateDisplay(report.createdAt)}
                </span>
              </TableCell>
              {showActions && (
                <TableCell className="pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <Link href={`/dashboard/reports/${report._id}`}>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">View Analysis</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/dashboard/reports/${report._id}/edit`}>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">Edit Record</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem 
                        className="gap-2 cursor-pointer"
                        onClick={() => window.open(`/api/reports/${report._id}/export/docx`, '_blank')}
                      >
                        <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">Export DOCX</span>
                      </DropdownMenuItem>
                      {onDelete && (
                        <>
                          <div className="h-px bg-border my-1" />
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                            onClick={() => onDelete(report._id!)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Purge Record</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
