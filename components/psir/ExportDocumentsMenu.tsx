'use client';

import { useState, type ReactNode } from 'react';
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
import { REPORT_DOCUMENTS, type ReportDocument } from '@/lib/docx/documents';
import { PiNumberDialog } from './PiNumberDialog';

interface Props {
  reportId: string;
  /** Current PI No. (Investigation Docket #). Documents that print it prompt for it when empty. */
  piNumber?: string | null;
  /** Called after the PI No. is saved through the prompt, so the page can update its copy */
  onPiNumberSaved?: (piNumber: string) => void;
  /** The button that opens the menu */
  children: ReactNode;
  /** Which side of the trigger the menu opens on (flips automatically near viewport edges) */
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

/** Menu listing every document that can be generated for a report. */
export function ExportDocumentsMenu({
  reportId,
  piNumber,
  onPiNumberSaved,
  children,
  side = 'right',
  align = 'start',
}: Props) {
  const [pending, setPending] = useState<ReportDocument | null>(null);

  function download(doc: ReportDocument) {
    toast.info(`Generating ${doc.label}…`);
    window.open(doc.href(reportId), '_blank');
  }

  function select(doc: ReportDocument) {
    if (doc.requiresPiNumber && !piNumber?.trim()) {
      setPending(doc); // ask first, download after save
      return;
    }
    download(doc);
  }

  return (
    <>
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
              onSelect={() => select(doc)}
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

      <PiNumberDialog
        open={Boolean(pending)}
        reportId={reportId}
        initialValue={piNumber ?? ''}
        onCancel={() => setPending(null)}
        onSaved={(value) => {
          onPiNumberSaved?.(value);
          const doc = pending;
          setPending(null);
          if (doc) download(doc);
        }}
      />
    </>
  );
}
