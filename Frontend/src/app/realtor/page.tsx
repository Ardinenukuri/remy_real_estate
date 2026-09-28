'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  MessageSquare,
  Calendar,
  Eye,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

const formatPriceShort = (price: number) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)}B`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `${Math.round(price / 1000)}K`;
  }
  return `${Math.round(price)}`;
};

interface RecentListing {
  id: string;
  title: string;
  location: string;
  price: number;
  is_approved: boolean;
  views: number;
  images: string[];
}

interface RecentAppointment {
  id: string;
  property?: { id: string; title: string; district?: string };
  client_name: string;
  date: string;
  time: string;
  status: string;
}

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  totalAppointments: number;
  pendingAppointments: number;
  unreadMessages: number;
}

export default function RealtorOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    unreadMessages: 0,
  });
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/realtor/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats({
          totalProperties: data.stats?.totalProperties || 0,
          activeListings: data.stats?.activeListings || 0,
          totalViews: data.stats?.totalViews || 0,
          totalAppointments: data.stats?.totalAppointments || 0,
          pendingAppointments: data.stats?.pendingAppointments || 0,
          unreadMessages: data.stats?.unreadMessages || 0,
        });
        setRecentListings(data.recentListings || []);
        setRecentAppointments(data.recentAppointments || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading realtor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Welcome back! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Overview of your active listings and client interactions
          </p>
        </div>
        <Link
          href="/realtor/listings/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Listing
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Listings
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.activeListings}{' '}
              <span className="text-xs font-normal text-slate-600 dark:text-slate-500">/ {stats.totalProperties} total</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Views
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Unread Messages
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.unreadMessages}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Upcoming Viewings
            </p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {stats.pendingAppointments}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Recent Listings</h2>
            <Link
              href="/realtor/listings"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
            {recentListings.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-500 text-center py-10">No listings posted yet.</p>
            ) : (
              recentListings.map((property) => (
                <div key={property.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0">
                      {property.images?.[0] ? (
                        <img
                          src={property.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-500">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{property.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{property.location}</p>
                      <p className="text-xs font-mono text-emerald-400 mt-0.5">
                        {formatPriceShort(property.price)} RWF
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      property.is_approved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {property.is_approved ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" /> Pending
                      </>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Upcoming Viewings</h2>
            <Link
              href="/realtor/appointments"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-500 text-center py-4">No scheduled viewings</p>
            ) : (
              recentAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{app.client_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{app.property?.title}</p>
                  <p className="text-[10px] text-purple-400 font-mono">
                    {app.date} at {app.time}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
