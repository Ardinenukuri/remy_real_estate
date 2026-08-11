'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HouseIcon,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface UserSession {
  id?: string;
  email?: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  // Exact requested admin navigation schema
  const adminNavigation = [
    { label: 'Overview', to: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Users', to: '/dashboard/admin/users', icon: Users },
    { label: 'Properties', to: '/dashboard/admin/properties', icon: Building2 },
    { label: 'Content', to: '/dashboard/admin/content', icon: FileText },
    { label: 'Reports', to: '/dashboard/admin/reports', icon: BarChart3 },
    { label: 'Profile', to: '/dashboard/admin/profile', icon: Settings },
  ];

  // Fetch logged-in user credentials dynamically from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse user session from localStorage:', err);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  // Resolve display name and initial dynamically
  const displayName =
    user?.full_name ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin User');

  const displayEmail = user?.email || 'admin@remy.com';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* 1. Mobile Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* 2. Responsive Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header & Branding */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HouseIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-base tracking-wide">Remy</span>
                <span className="text-emerald-400 text-[10px] font-medium tracking-widest uppercase">
                  Real Estates
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Admin Navigation
            </div>

            {adminNavigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.label === 'Overview'
                  ? pathname === item.to
                  : pathname === item.to || pathname?.startsWith(`${item.to}/`);

              return (
                <Link
                  key={item.label}
                  href={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Authenticated User Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                {avatarInitial}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-white truncate">
                  {displayName}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <span className="text-xs text-slate-400 truncate">
                {displayEmail}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}