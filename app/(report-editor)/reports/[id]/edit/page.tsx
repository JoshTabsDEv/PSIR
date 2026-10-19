'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PSIRForm } from '@/components/psir/PSIRForm';
import type { PSIRReport, PSIRFormData } from '@/types/psir';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditReportPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<PSIRReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/reports/${id}`);
        const result = await response.json();
        if (result.success) {
          setReport(result.data);
          // Show warning if report is already completed
          if (result.data.status === 'completed') {
            setShowWarning(true);
          }
        } else {
          toast.error('Failed to load report', {
            description: result.error || 'Could not fetch report data.',
          });
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
        toast.error('Failed to load report', {
          description: 'An error occurred while loading the report.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [id]);

  const handleSave = async (data: PSIRFormData, status: 'draft' | 'completed'): Promise<string> => {
    const response = await fetch(`/api/reports/${id}`, {
      method: 'PUT',
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

    if (status === 'completed') {
      toast.success('Report completed!', {
        description: 'Redirecting to report view...',
      });
      router.push(`/dashboard/reports/${id}`);
    }

    return id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f8f9fa] text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Report Not Found</h2>
          <p className="text-sm text-muted-foreground">The requested report could not be accessed.</p>
        </div>
        <Link href="/dashboard/reports">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
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
              onClick={() => router.push(`/dashboard/reports/${id}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowWarning(false)}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]"
            >
              Continue Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PSIRForm
        initialData={report as unknown as Partial<PSIRFormData>}
        reportId={id}
        onSave={handleSave}
      />
    </>
  );
}
