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
  onSaved: (piNumber: string) => void;
  onCancel: () => void;
}

/**
 * Asks for the PI No. (probation investigation docket number) before a
 * document that prints it is generated for the first time. Saves it on the
 * report so later exports and the Final Report reuse it.
 */
export function PiNumberDialog({ open, reportId, initialValue = '', onSaved, onCancel }: Props) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const piNumber = value.trim();
    if (!piNumber) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/pi-number`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piNumber }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to save');
      onSaved(result.data.piNumber as string);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save PI No.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>PI No. needed</DialogTitle>
            <DialogDescription>
              This document prints the probation investigation number (PI No.). It is saved on the
              report and reused as the supervision docket number on the Final Report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pi-number">PI No.</Label>
            <Input
              id="pi-number"
              value={value}
              autoFocus
              placeholder="e.g., PI-2026-0001"
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
