'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersPanel, type AdminUser } from '@/components/admin/UsersPanel';
import { OfficesPanel, type Office } from '@/components/admin/OfficesPanel';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

export default function AdminPage() {
  const router = useRouter();
  const me = useCurrentUser();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, o] = await Promise.all([fetch('/api/admin/users').then((r) => r.json()), fetch('/api/admin/offices').then((r) => r.json())]);
      if (u.success) setUsers(u.data);
      if (o.success) setOffices(o.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (me === null || (me && me.role !== 'ADMIN')) {
      router.replace('/dashboard');
      return;
    }
    if (me) void load();
  }, [me, load, router]);

  if (!me || me.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Administration' }]} />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-sm text-gray-500">Manage offices and the users who belong to them.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="offices">Offices ({offices.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="pt-4">
          <UsersPanel users={users} offices={offices} onChange={setUsers} loading={loading} currentUserId={me.id} />
        </TabsContent>
        <TabsContent value="offices" className="pt-4">
          <OfficesPanel offices={offices} onChange={setOffices} loading={loading} currentOfficeId={me.officeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
