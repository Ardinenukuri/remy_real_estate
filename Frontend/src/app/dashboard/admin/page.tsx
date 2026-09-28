'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import {
  Users,
  Building2,
  Clock,
  Eye,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'realtor' | 'admin';
  is_verified: boolean;
}

interface Property {
  id: string;
  title: string;
  is_approved: boolean;
  created_at: string;
  views?: number;
  realtor?: {
    full_name: string;
  };
}

interface DashboardData {
  stats: {
    totalUsers: number;
    totalProperties: number;
    totalViews: number;
    pendingRealtors: number;
    pendingProperties: number;
  };
  recentUsers: UserProfile[];
  recentProperties: Property[];
}

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`${apiUrl}/admin/dashboard-stats`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load admin dashboard statistics.');
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 min-h-[60vh] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 my-8 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{error || 'Unable to retrieve dashboard information.'}</span>
      </div>
    );
  }

  const { stats, recentUsers, recentProperties } = data;
  const pendingTotal = stats.pendingRealtors + stats.pendingProperties;

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400',
      link: '/dashboard/admin/users',
    },
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      color: 'bg-emerald-500/10 text-emerald-400',
      link: '/dashboard/admin/properties',
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-purple-500/10 text-purple-400',
      link: '/dashboard/admin/reports',
    },
    {
      label: 'Pending Approvals',
      value: pendingTotal,
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-400',
      link: '/dashboard/admin/users',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100">
      {/* Sidebar Component */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mobile Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-6 flex items-center gap-4 lg:hidden sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900 dark:text-white">Admin Dashboard</span>
        </header>

        {/* Dashboard Main Container */}
        <main className="space-y-8 p-6 max-w-7xl w-full mx-auto">
          {/* Section Header */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              System-wide metrics and pending management approvals.
            </p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  href={s.link}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Pending Approvals Alert Section */}
          {pendingTotal > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <h2 className="font-bold text-lg text-amber-400 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Pending Approvals
              </h2>
              <div className="space-y-3">
                {stats.pendingRealtors > 0 && (
                  <Link
                    href="/dashboard/admin/users"
                    className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {stats.pendingRealtors} realtor{' '}
                      {stats.pendingRealtors === 1 ? 'account' : 'accounts'} awaiting verification
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </Link>
                )}
                {stats.pendingProperties > 0 && (
                  <Link
                    href="/dashboard/admin/properties"
                    className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {stats.pendingProperties}{' '}
                      {stats.pendingProperties === 1 ? 'property' : 'properties'} awaiting approval
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity: Users + Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users Card */}
            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Recent Users</h2>
                <Link
                  href="/dashboard/admin/users"
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentUsers.slice(0, 5).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {u.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {u.full_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : u.role === 'realtor'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Properties Card */}
            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Recent Properties</h2>
                <Link
                  href="/dashboard/admin/properties"
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentProperties.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {p.realtor?.full_name || 'Unknown'} · {timeAgo(p.created_at)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        p.is_approved
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {p.is_approved ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {p.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}