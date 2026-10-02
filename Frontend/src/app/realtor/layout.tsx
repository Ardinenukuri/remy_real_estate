'use client';

import { useState } from 'react';
import RealtorSidebar from '@/components/dashboard/RealtorSidebar';
import { Menu } from 'lucide-react';

export default function RealtorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      <RealtorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Toggle Bar */}
        <div className="lg:hidden h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 flex items-center justify-between sticky top-0 z-30">
          <span className="text-slate-900 dark:text-white font-bold text-base">Realtor Dashboard</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}