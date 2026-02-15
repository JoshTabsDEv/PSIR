'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PSIRForm } from '@/components/psir/PSIRForm';
import type { PSIRFormData } from '@/types/psir';

export default function NewReportPage() {
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);

  const handleSave = useCallback(async (data: PSIRFormData, status: 'draft' | 'completed') => {
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

      const result = await response.json();

      if (status === 'completed') {
        toast.success('Report completed!', {
          description: 'Redirecting to report view...',
        });
        router.push(`/dashboard/reports/${result.data._id}`);
      }
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

      // Store the report ID for subsequent saves
      setReportId(result.data._id);

      if (status === 'completed') {
        toast.success('Report completed!', {
          description: 'Redirecting to report view...',
        });
        router.push(`/dashboard/reports/${result.data._id}`);
      }
    }
  }, [reportId, router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New PSIR Report</h1>
        <p className="text-gray-500">
          Fill out the Post-Sentence Investigation Report form
        </p>
      </div>

      <PSIRForm onSave={handleSave} reportId={reportId || undefined} />
    </div>
  );
}
