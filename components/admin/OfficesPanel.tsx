'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface Office {
  id: number;
  code: string;
  name: string;
  region: string | null;
  address: string | null;
  isActive: boolean;
  _count: { users: number; reports: number };
}

interface Props {
  offices: Office[];
  onChange: (offices: Office[]) => void;
  loading: boolean;
  currentOfficeId: number;
}

const emptyForm = { code: '', name: '', region: '', address: '' };

async function api(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error || 'Request failed');
  return result.data;
}

export function OfficesPanel({ offices, onChange, loading, currentOfficeId }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Office | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(
      editing
        ? { code: editing.code, name: editing.name, region: editing.region ?? '', address: editing.address ?? '' }
        : emptyForm
    );
  }, [editing, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, region: form.region || null, address: form.address || null };
      const saved: Office = editing
        ? await api(`/api/admin/offices/${editing.id}`, 'PATCH', payload)
        : await api('/api/admin/offices', 'POST', { code: form.code, ...payload });
      onChange(editing ? offices.map((o) => (o.id === saved.id ? saved : o)) : [...offices, saved]);
      toast.success(editing ? 'Office updated' : 'Office created');
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(office: Office) {
    try {
      const saved: Office = await api(`/api/admin/offices/${office.id}`, 'PATCH', { isActive: !office.isActive });
      onChange(offices.map((o) => (o.id === saved.id ? saved : o)));
      toast.success(saved.isActive ? 'Office activated' : 'Office deactivated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed');
    }
  }

  const createHint = 'Short code like TAG or CEB. Used in report numbers: PI-TAG-2026-00001.';
  const editHint = 'Code is fixed because it is part of existing report numbers.';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Offices own users and reports. The code appears in report numbers and cannot change later.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New office
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Reports</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  <Loader2 className="inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && offices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No offices yet.
                </TableCell>
              </TableRow>
            )}
            {offices.map((office) => (
              <TableRow key={office.id}>
                <TableCell className="font-mono font-semibold">
                  <Building2 className="mr-1 inline h-4 w-4 text-gray-400" />
                  {office.code}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{office.name}</div>
                  {office.address && <div className="text-xs text-gray-500">{office.address}</div>}
                </TableCell>
                <TableCell>{office.region || '—'}</TableCell>
                <TableCell className="text-right">{office._count.users}</TableCell>
                <TableCell className="text-right">{office._count.reports}</TableCell>
                <TableCell>
                  {office.isActive ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(office);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={office.id === currentOfficeId}
                    onClick={() => toggleActive(office)}
                  >
                    {office.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editing ? `Edit ${editing.code}` : 'New office'}</DialogTitle>
              <DialogDescription>{editing ? editHint : createHint}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="office-code">Code</Label>
                <Input
                  id="office-code"
                  value={form.code}
                  disabled={Boolean(editing)}
                  maxLength={8}
                  className="font-mono uppercase"
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="office-name">Name</Label>
                <Input
                  id="office-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-region">Region</Label>
              <Input
                id="office-region"
                value={form.region}
                placeholder="e.g. VII"
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="office-address">Address</Label>
              <Input
                id="office-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
