'use client';

import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { REPORT_DOCUMENTS } from '@/lib/docx/documents';

interface Props {
  reportId: string;
  /** The button that opens the menu */
  children: ReactNode;
  /** Which side of the trigger the menu opens on (flips automatically near viewport edges) */
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

/** Menu listing every document that can be generated for a report. */
export function ExportDocumentsMenu({ reportId, children, side = 'right', align = 'start' }: Props) {
  function download(label: string, url: string) {
    toast.info(`Generating ${label}…`);
    window.open(url, '_blank');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} sideOffset={12} className="w-64">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Export document
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {REPORT_DOCUMENTS.map((doc) => (
          <DropdownMenuItem
            key={doc.key}
            className="flex cursor-pointer items-start gap-2 py-2"
            onSelect={() => download(doc.label, doc.href(reportId))}
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" />
            <span className="flex flex-col">
              <span className="text-sm font-medium">{doc.label}</span>
              <span className="text-xs text-gray-500">{doc.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
