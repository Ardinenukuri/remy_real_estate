'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Users,
  Building2,
  Eye,
  Mail,
  Calendar,
  TrendingUp,
  Star,
  MessageSquare,
  Loader2,
  Menu,
} from 'lucide-react';

const formatPriceShort = (price: number) => {
  if (!Number.isFinite(price)) return 'N/A';

  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(price);
};

interface ReportStats {
  totalUsers: number;
  realtors: number;
  customers: number;
  verifiedRealtors: number;
  pendingRealtors: number;
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  totalViews: number;
  totalInquiries: number;
  totalAppointments: number;
  totalFavorites: number;
  totalBlogPosts: number;
  totalTestimonials: number;
  pendingTestimonials: number;
  totalMessages: number;
  newMessages: number;
}

interface TopProperty {
  title: string;
  views: number;
  price: number;
  district: string;
}

interface CategoryCount {
  name: string;
  count: number;
}

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    realtors: 0,
    customers: 0,
    verifiedRealtors: 0,
    pendingRealtors: 0,
    totalProperties: 0,
    approvedProperties: 0,
    pendingProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalAppointments: 0,
    totalFavorites: 0,
    totalBlogPosts: 0,
    totalTestimonials: 0,
    pendingTestimonials: 0,
    totalMessages: 0,
    newMessages: 0,
  });
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [propertiesByCategory, setPropertiesByCategory] = useState<CategoryCount[]>([]);

  // Helper function to manage Authorization headers
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch report metrics in a single aggregated REST request or parallelized endpoints
      const res = await fetch('/api/admin/reports', {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.topProperties) setTopProperties(data.topProperties);
        if (data.propertiesByCategory) setPropertiesByCategory(data.propertiesByCategory);
      } else {
        console.error('Failed to retrieve report analytics');
      }
    } catch (err) {
      console.error('Error loading admin reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100">
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center py-20 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Generating analytics and reports...</p>
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      sub: `${stats.customers} customers, ${stats.realtors} realtors`,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    {
      label: 'Pending Realtors',
      value: stats.pendingRealtors,
      sub: `${stats.verifiedRealtors} verified`,
      icon: Star,
      color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      sub: `${stats.approvedProperties} approved, ${stats.pendingProperties} pending`,
      icon: Building2,
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      sub: 'across all listings',
      icon: Eye,
      color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    {
      label: 'Inquiries',
      value: stats.totalInquiries,
      sub: 'total sent',
      icon: Mail,
      color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    },
    {
      label: 'Appointments',
      value: stats.totalAppointments,
      sub: 'total requested',
      icon: Calendar,
      color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    {
      label: 'Favorites',
      value: stats.totalFavorites,
      sub: 'properties saved',
      icon: Star,
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      label: 'Blog Posts',
      value: stats.totalBlogPosts,
      sub: 'published articles',
      icon: MessageSquare,
      color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    },
  ];

  const maxCatCount = Math.max(...propertiesByCategory.map((c) => c.count), 1);
  const maxViews = Math.max(...topProperties.map((p) => p.views), 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-6 flex items-center gap-4 lg:hidden sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-900 dark:text-white">Admin Reports</span>
        </header>

        <main className="space-y-6 p-6 max-w-7xl w-full mx-auto">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform-wide statistics and performance insights</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">{c.value}</p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{c.label}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-0.5">{c.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Properties By Views */}
            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Top Properties by Views
              </h2>
              {topProperties.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-500 py-8 text-center">No property view data available</p>
              ) : (
                <div className="space-y-4">
                  {topProperties.map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate flex-1 mr-2">{p.title}</span>
                        <span className="font-mono text-emerald-400 shrink-0">{p.views.toLocaleString()} views</span>
                      </div>
                      <div className="h-2 bg-white dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${(p.views / maxViews) * 100}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-500">
                        {p.district} · {formatPriceShort(p.price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Properties By Category */}
            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Properties by Category
              </h2>
              {propertiesByCategory.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-500 py-8 text-center">No category data available</p>
              ) : (
                <div className="space-y-4">
                  {propertiesByCategory.map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{c.name}</span>
                        <span className="font-mono text-emerald-400">{c.count}</span>
                      </div>
                      <div className="h-2 bg-white dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(c.count / maxCatCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content & Activity Summary */}
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">Content & Engagement Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">{stats.totalTestimonials}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Testimonials</p>
                {stats.pendingTestimonials > 0 && (
                  <p className="text-[11px] font-semibold text-amber-400">{stats.pendingTestimonials} pending</p>
                )}
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">{stats.totalMessages}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Messages</p>
                {stats.newMessages > 0 && (
                  <p className="text-[11px] font-semibold text-blue-400">{stats.newMessages} unread</p>
                )}
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">{stats.totalBlogPosts}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Blog Posts</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">{stats.totalFavorites}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Saved Favorites</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}