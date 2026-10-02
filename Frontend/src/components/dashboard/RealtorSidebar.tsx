'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Home as HouseIcon,
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageSquare,
  Calendar,
  BarChart3,
  User,
  LogOut,
  X,
  BadgeCheck,
} from 'lucide-react';

interface RealtorSidebarProps {
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
  avatarUrl?: string;
}

export default function RealtorSidebar({
  sidebarOpen,
  setSidebarOpen,
}: RealtorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [counts, setCounts] = useState({ pendingAppointments: 0, unreadMessages: 0 });

  const realtorNavigation = [
    { label: 'Overview', to: '/realtor', icon: LayoutDashboard },
    { label: 'My Listings', to: '/realtor/listings', icon: Building2 },
    { label: 'Add Listing', to: '/realtor/listings/new', icon: PlusCircle },
    { label: 'Messages', to: '/realtor/messages', icon: MessageSquare, badge: counts.unreadMessages },
    { label: 'Appointments', to: '/realtor/appointments', icon: Calendar, badge: counts.pendingAppointments },
    { label: 'Analytics', to: '/realtor/analytics', icon: BarChart3 },
    { label: 'Profile', to: '/realtor/profile', icon: User },
  ];

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error('Failed to parse user session from localStorage:', err);
        }
      }
    };

    loadUser();
    window.addEventListener('user-profile-updated', loadUser);
    return () => window.removeEventListener('user-profile-updated', loadUser);
  }, []);

  useEffect(() => {
    async function loadCounts() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch('/api/realtor/notifications/counts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCounts({
            pendingAppointments: data.pendingAppointments || 0,
            unreadMessages: data.unreadMessages || 0,
          });
        } else if (res.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          router.push('/signin?session_ended=1');
        }
      } catch (err) {
        console.error('Failed to load notification counts:', err);
      }
    }

    loadCounts();
    const interval = setInterval(loadCounts, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  const displayName =
    user?.full_name ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Realtor Agent');

  const displayEmail = user?.email || 'realtor@remy.com';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Layout Spacer - reserves the sidebar's width in the page's flex row
          on desktop, since the sidebar itself is pulled out of normal flow
          below (position: fixed) so it can never move with page scroll. */}
      <div className="hidden lg:block w-64 shrink-0" aria-hidden="true" />

      {/* Sidebar Panel - truly fixed to the viewport, independent of page content height */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Scrollable Content */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {/* Header & Branding */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HouseIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-slate-900 dark:text-white font-bold text-base tracking-wide">Remy</span>
                <span className="text-emerald-500 dark:text-emerald-400 text-[10px] font-medium tracking-widest uppercase">
                  Real Estates
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <ThemeToggle className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" />

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 flex-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Realtor Portal
            </div>

            {realtorNavigation.map((item) => {
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
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && (
                    <span
                      className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive ? 'bg-white/25 text-white' : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Pinned Authenticated User & Sign Out Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-500 dark:text-emerald-400 text-sm">
                  {avatarInitial}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {displayName}
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {displayEmail}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}