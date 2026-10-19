'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:pl-64">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
        {/* <Footer /> */}
      </div>
    </div>
  );
}
