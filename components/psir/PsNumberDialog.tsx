'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  reportId: string;
  initialValue?: string;
  /** Called with the saved value; the caller then continues (e.g. starts the download). */
  onSaved: (psNumber: string) => void;
  onCancel: () => void;
}

/**
 * Asks for the PS No. (probation supervision docket number, assigned when the
 * client reports to the office after the court grants probation) before a
 * document that prints it is generated for the first time. Saved on the
 * report so later exports and the Final Report reuse it.
 */
export function PsNumberDialog({ open, reportId, initialValue = '', onSaved, onCancel }: Props) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const psNumber = value.trim();
    if (!psNumber) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/ps-number`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psNumber }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to save');
      onSaved(result.data.psNumber as string);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save PS No.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>PS No. needed</DialogTitle>
            <DialogDescription>
              This document prints the probation supervision docket number (PS No.), assigned when the
              client reports to the office. It is saved on the report and reused as the docket number on
              the Final Report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ps-number">PS No.</Label>
            <Input
              id="ps-number"
              value={value}
              autoFocus
              placeholder="e.g., PS-2026-01-00001"
              maxLength={64}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !value.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save and download
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
