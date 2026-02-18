'use client';

import Link from 'next/link';
import { Eye, Pencil, Trash2, FileDown, FolderOpen } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

interface ReportsListProps {
  reports: PSIRReport[];
  title?: string;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function ReportsList({
  reports,
  title = 'Reports',
  showActions = true,
  onDelete,
}: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FolderOpen}
            title="No reports found"
            description="There are no PSIR reports here yet. Create your first report to get started."
            action={{ label: 'Create New Report', href: '/dashboard/reports/new' }}
            secondaryAction={{ label: 'Browse all reports', href: '/dashboard/reports' }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {showActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell className="font-mono text-sm">
                  {report.reportNumber}
                </TableCell>
                <TableCell>
                  {formatFullName(
                    report.identifyingData.lastName,
                    report.identifyingData.firstName,
                    report.identifyingData.middleName
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${report.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                    />
                    <span className="text-sm font-medium">
                      {report.status === 'completed' ? 'Completed' : 'Draft'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDateDisplay(report.createdAt)}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/reports/${report._id}`}>
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/reports/${report._id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Export DOCX"
                        onClick={() => window.open(`/api/reports/${report._id}/export/docx`, '_blank')}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => onDelete(report._id!)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
