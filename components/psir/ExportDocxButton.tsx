'use client';

import { useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportDocxButtonProps {
  /** Report ID to export */
  reportId: string;
  /** Report number for display/filename */
  reportNumber?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Show icon only */
  iconOnly?: boolean;
  /** Custom class name */
  className?: string;
}

export function ExportDocxButton({
  reportId,
  reportNumber,
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  className,
}: ExportDocxButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/export/docx`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed: ${response.status}`);
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `PSIR-${reportNumber || reportId}.docx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isLoading ? Loader2 : FileText;

  return (
    <div className="inline-flex flex-col items-start">
      <Button
        variant={variant}
        size={size}
        onClick={handleExport}
        disabled={isLoading}
        className={className}
        title={iconOnly ? 'Export to DOCX' : undefined}
      >
        <Icon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} ${!iconOnly ? 'mr-2' : ''}`} />
        {!iconOnly && (isLoading ? 'Exporting...' : 'Export DOCX')}
      </Button>
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}

/**
 * Minimal download button with just an icon
 */
export function ExportDocxIconButton({
  reportId,
  reportNumber,
  className,
}: Pick<ExportDocxButtonProps, 'reportId' | 'reportNumber' | 'className'>) {
  return (
    <ExportDocxButton
      reportId={reportId}
      reportNumber={reportNumber}
      variant="ghost"
      size="icon"
      iconOnly
      className={className}
    />
  );
}
