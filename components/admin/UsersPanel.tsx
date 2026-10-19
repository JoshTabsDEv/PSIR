'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, Loader2, Plus, UserRound } from 'lucide-react';
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
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InviteLinkDialog, type InviteLinkInfo } from './InviteLinkDialog';
import type { Office } from './OfficesPanel';

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: 'ADMIN' | 'OFFICER';
  isActive: boolean;
  officeId: number;
  office: { code: string; name: string };
  hasPassword: boolean;
  inviteExpiresAt: string | null;
}

interface Props {
  users: AdminUser[];
  offices: Office[];
  onChange: (users: AdminUser[]) => void;
  loading: boolean;
  currentUserId: number;
}

type Form = { username: string; name: string; officeId: string; role: 'ADMIN' | 'OFFICER' };

async function api(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error || 'Request failed');
  return result.data;
}

function statusBadge(user: AdminUser) {
  if (!user.isActive) return <Badge variant="outline">Inactive</Badge>;
  if (!user.hasPassword) return <Badge variant="destructive">Invited</Badge>;
  return <Badge variant="secondary">Active</Badge>;
}

const createHint = 'After creating, you get a one-time link to send to the user so they can set their password.';
const editHint = 'Username cannot change.';

export function UsersPanel({ users, offices, onChange, loading, currentUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<Form>({ username: '', name: '', officeId: '', role: 'OFFICER' });
  const [saving, setSaving] = useState(false);
  const [invite, setInvite] = useState<InviteLinkInfo | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const activeOffices = offices.filter((o) => o.isActive);
  const firstOfficeId = activeOffices[0]?.id;

  useEffect(() => {
    setForm(
      editing
        ? { username: editing.username, name: editing.name, officeId: String(editing.officeId), role: editing.role }
        : { username: '', name: '', officeId: String(firstOfficeId ?? ''), role: 'OFFICER' }
    );
  }, [editing, open, firstOfficeId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const saved: AdminUser = await api(`/api/admin/users/${editing.id}`, 'PATCH', {
          name: form.name,
          officeId: Number(form.officeId),
          role: form.role,
        });
        onChange(users.map((u) => (u.id === saved.id ? saved : u)));
        toast.success('User updated');
      } else {
        const created = await api('/api/admin/users', 'POST', {
          username: form.username,
          name: form.name,
          officeId: Number(form.officeId),
          role: form.role,
        });
        onChange([...users, created.user]);
        setInvite({
          name: created.user.name,
          username: created.user.username,
          inviteLink: created.inviteLink,
          expiresAt: created.expiresAt,
        });
        toast.success('User created');
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  async function newLink(user: AdminUser) {
    setBusyId(user.id);
    try {
      const data = await api(`/api/admin/users/${user.id}/invite`, 'POST');
      onChange(users.map((u) => (u.id === user.id ? { ...u, inviteExpiresAt: data.expiresAt } : u)));
      setInvite({ name: user.name, username: user.username, inviteLink: data.inviteLink, expiresAt: data.expiresAt });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(user: AdminUser) {
    setBusyId(user.id);
    try {
      const saved: AdminUser = await api(`/api/admin/users/${user.id}`, 'PATCH', { isActive: !user.isActive });
      onChange(users.map((u) => (u.id === saved.id ? saved : u)));
      toast.success(saved.isActive ? 'User activated' : 'User deactivated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Create a user, then send them the one-time link to set their password. Generate a new link to reset it.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          disabled={activeOffices.length === 0}
        >
          <Plus className="h-4 w-4" /> New user
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  <Loader2 className="inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id} className={user.isActive ? '' : 'opacity-60'}>
                <TableCell className="font-medium">
                  <UserRound className="mr-1 inline h-4 w-4 text-gray-400" />
                  {user.name}
                  {user.id === currentUserId && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                </TableCell>
                <TableCell className="font-mono text-xs">{user.username}</TableCell>
                <TableCell>
                  <span className="font-mono">{user.office.code}</span>{' '}
                  <span className="text-gray-500">· {user.office.name}</span>
                </TableCell>
                <TableCell>{user.role === 'ADMIN' ? <Badge>Admin</Badge> : <Badge variant="outline">Officer</Badge>}</TableCell>
                <TableCell>{statusBadge(user)}</TableCell>
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(user);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!user.isActive || busyId === user.id}
                    onClick={() => newLink(user)}
                  >
                    <KeyRound className="h-4 w-4" />
                    {user.hasPassword ? 'Reset link' : 'New link'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={user.id === currentUserId || busyId === user.id}
                    onClick={() => toggleActive(user)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
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
              <DialogTitle>{editing ? `Edit ${editing.username}` : 'New user'}</DialogTitle>
              <DialogDescription>{editing ? editHint : createHint}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-username">Username</Label>
                <Input
                  id="user-username"
                  value={form.username}
                  disabled={Boolean(editing)}
                  autoComplete="off"
                  className="font-mono"
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-name">Full name</Label>
                <Input
                  id="user-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-office">Office</Label>
                <Select
                  id="user-office"
                  value={form.officeId}
                  onChange={(e) => setForm({ ...form, officeId: e.target.value })}
                  required
                >
                  {activeOffices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} · {o.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <Select
                  id="user-role"
                  value={form.role}
                  disabled={editing?.id === currentUserId}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Form['role'] })}
                >
                  <option value="OFFICER">Officer (own office)</option>
                  <option value="ADMIN">Admin (all offices)</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Save' : 'Create & get link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <InviteLinkDialog info={invite} onClose={() => setInvite(null)} />
    </div>
  );
}
