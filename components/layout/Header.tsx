'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearCurrentUserCache, useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearCurrentUserCache();
      router.replace('/login');
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex items-center gap-2">
        <Image
          src="/ppa-logo.png"
          alt="Parole and Probation Administration logo"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
          priority
        />
        <h1 className="text-lg font-semibold text-gray-900">PSIR Management System</h1>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden sm:inline text-sm text-gray-600" title={`${user.username} (${user.role})`}>
            {user.name} <span className="text-gray-400">&middot; {user.officeCode}</span>
          </span>
        )}
        <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
