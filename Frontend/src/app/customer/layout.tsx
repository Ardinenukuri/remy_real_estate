'use client';

import React, { useState } from 'react';
import CustomerSidebar from '@/components/CustomerSidebar';
import { Menu, Home as HouseIcon } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <HouseIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-slate-900 dark:text-white font-bold text-sm tracking-wide">Remy</span>
            <span className="text-emerald-500 dark:text-emerald-400 text-[9px] font-medium tracking-widest uppercase">
              Real Estates
            </span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Customer Sidebar */}
      <CustomerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Viewport */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}