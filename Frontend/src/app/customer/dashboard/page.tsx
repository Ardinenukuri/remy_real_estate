'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  MessageSquare,
  Search,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedProperty {
  id: string;
  title: string;
  district: string;
  price: number;
  image?: string;
  beds?: number;
  baths?: number;
}

interface UpcomingTour {
  id: string;
  property_title: string;
  district: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  realtor_name: string;
}

interface DashboardStats {
  savedPropertiesCount: number;
  upcomingToursCount: number;
  unreadMessagesCount: number;
}

function CustomerDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    savedPropertiesCount: 0,
    upcomingToursCount: 0,
    unreadMessagesCount: 0,
  });
  const [recentSaved, setRecentSaved] = useState<SavedProperty[]>([]);
  const [upcomingTours, setUpcomingTours] = useState<UpcomingTour[]>([]);

  useEffect(() => {
    async function fetchCustomerDashboardData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/customer/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentSaved(data.recentSaved || []);
          setUpcomingTours(data.upcomingTours || []);
        } else {
          // Fallback demo data
          setStats({
            savedPropertiesCount: 5,
            upcomingToursCount: 2,
            unreadMessagesCount: 3,
          });
          setRecentSaved([
            { id: '1', title: 'Modern Villa in Kiyovu', district: 'Kiyovu, Kigali', price: 350000, beds: 4, baths: 3 },
            { id: '2', title: 'Luxury Apartment in Gacuriro', district: 'Gacuriro, Kigali', price: 180000, beds: 2, baths: 2 },
          ]);
          setUpcomingTours([
            { id: '101', property_title: 'Modern Villa in Kiyovu', district: 'Kiyovu', date: '2026-08-15', time: '10:00 AM', status: 'confirmed', realtor_name: 'Eric Manzi' },
            { id: '102', property_title: 'Commercial Suite Nyarugenge', district: 'Nyarugenge', date: '2026-08-18', time: '02:30 PM', status: 'pending', realtor_name: 'Aline Uwase' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome Back 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your saved homes, viewings, and communications.
          </p>
        </div>

        <Link
          href="/customer/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all shrink-0 self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          Explore Properties
        </Link>
      </div>

      {/* Overview Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Saved Homes</span>
            <span className="text-2xl font-bold text-white mt-1 block">{stats.savedPropertiesCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Upcoming Tours</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{stats.upcomingToursCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Unread Messages</span>
            <span className="text-2xl font-bold text-blue-400 mt-1 block">{stats.unreadMessagesCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scheduled Tours */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Scheduled Property Tours
            </h2>
            <Link href="/customer/tours" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading tour schedule...</div>
          ) : upcomingTours.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No property tours scheduled yet.</div>
          ) : (
            <div className="space-y-3">
              {upcomingTours.map((tour) => (
                <div key={tour.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{tour.property_title}</h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                        tour.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      )}
                    >
                      {tour.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {tour.district}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {tour.date} at {tour.time}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      Agent: {tour.realtor_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Favorites */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Saved Favorites
            </h2>
            <Link href="/customer/saved" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
              View Saved <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading favorites...</div>
          ) : recentSaved.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">You haven't saved any listings yet.</div>
          ) : (
            <div className="space-y-3">
              {recentSaved.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {item.district}
                    </p>
                    <span className="text-xs font-bold text-emerald-400 mt-1 block">
                      ${item.price.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/properties/${item.id}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading customer dashboard...</div>}>
      <CustomerDashboardContent />
    </Suspense>
  );
}