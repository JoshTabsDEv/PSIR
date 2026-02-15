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
          src="/Parole_and_Probation_Administration_(PPA).svg"
          alt="Parole and Probation Administration logo"
          width={28}
          height={28}
          priority
        />
        <h1 className="text-lg font-semibold">PSIR Management System</h1>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Bureau of Corrections
        </span>
      </div>
    </header>
  );
}
