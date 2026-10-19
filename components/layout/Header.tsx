'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuToggle}
      >
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

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          DOJ/PPA
        </span>
      </div>
    </header>
  );
}
