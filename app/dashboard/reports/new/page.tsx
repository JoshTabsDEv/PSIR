'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PSIRForm, type SaveResult } from '@/components/psir/PSIRForm';
import type { PSIRFormData } from '@/types/psir';

export default function NewReportPage() {
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);

  const handleSave = useCallback(async (data: PSIRFormData, status: 'draft' | 'completed'): Promise<string | SaveResult> => {
    // If we already have a report ID, update instead of create
    if (reportId) {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to update report';
        throw new Error(errorMessage);
      }

      if (status === 'completed') {
        toast.success('Report completed!', {
          description: 'Redirecting to report view...',
        });
        router.push(`/dashboard/reports/${reportId}`);
      }

      return reportId;
    } else {
      // First save - create new report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to save report';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const newId: string = result.data._id;
      const reportNumber: string | undefined = result.data.reportNumber;

      // Store the report ID for subsequent saves
      setReportId(newId);

      if (status === 'completed') {
        toast.success('Report completed!', {
          description: 'Redirecting to report view...',
        });
        router.push(`/dashboard/reports/${newId}`);
      }

      return { id: newId, reportNumber };
    }
  }, [reportId, router]);

  return (
    <div className="absolute inset-0 z-50">
      <PSIRForm onSave={handleSave} reportId={reportId || undefined} />
    </div>
  );
}
