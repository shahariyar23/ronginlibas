'use client';

import React from 'react';
import { AdminProvider } from '@/context/AdminContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/common/CommandPalette';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-[#fbf9f2]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
      <CommandPalette />
    </AdminProvider>
  );
}
