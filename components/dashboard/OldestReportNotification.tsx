'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface OldestReportData {
  reportNumber: string;
  petitionerName: string;
  createdAt: string;
}

export function OldestReportNotification() {
  const [data, setData] = useState<OldestReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOldestReport() {
      try {
        const response = await fetch('/api/reports/oldest');
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError('Failed to fetch oldest report');
        }
      } catch (err) {
        console.error('Error fetching oldest report:', err);
        setError('Failed to fetch oldest report');
      } finally {
        setLoading(false);
      }
    }

    fetchOldestReport();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-sm bg-white border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-primary)]" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Loading pending cases...
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (error || !data) {
    return null; // Don't show notification if there's an error or no data
  }

  return (
    <Card className="shadow-sm bg-gradient-to-r from-white to-blue-50/30 border-blue-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-[var(--brand-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold text-foreground">
              Pending Investigation
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Oldest case awaiting review
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Petitioner Name
            </p>
            <p className="text-sm font-semibold text-foreground break-words">
              {data.petitionerName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Report Number
            </p>
            <p className="text-sm font-semibold text-[var(--brand-primary)] font-mono">
              {data.reportNumber}
            </p>
          </div>
        </div>
        <div className="pt-1 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Received {format(new Date(data.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
