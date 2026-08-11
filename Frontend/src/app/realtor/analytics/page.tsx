'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Calendar,
  Building2,
  Users,
  ArrowUpRight,
  Filter,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalViews: number;
    viewsTrend: number;
    totalInquiries: number;
    inquiriesTrend: number;
    totalBookings: number;
    bookingsTrend: number;
    conversionRate: number;
    conversionTrend: number;
  };
  topProperties: Array<{
    id: string;
    title: string;
    views: number;
    inquiries: number;
    price: number;
  }>;
  monthlyViews: Array<{
    month: string;
    views: number;
    inquiries: number;
  }>;
}

function RealtorAnalyticsContent() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/realtor/analytics?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          // Fallback mock data structure for demo/development display
          setData({
            overview: {
              totalViews: 4250,
              viewsTrend: 12.5,
              totalInquiries: 318,
              inquiriesTrend: 8.2,
              totalBookings: 46,
              bookingsTrend: -2.4,
              conversionRate: 7.4,
              conversionTrend: 1.1,
            },
            topProperties: [
              { id: '1', title: 'Modern Villa in Kiyovu', views: 1420, inquiries: 89, price: 350000 },
              { id: '2', title: 'Luxury Apartment in Gacuriro', views: 980, inquiries: 64, price: 180000 },
              { id: '3', title: 'Commercial Space in Nyarugenge', views: 760, inquiries: 42, price: 500000 },
              { id: '4', title: 'Cozy Family Home in Kicukiro', views: 540, inquiries: 31, price: 120000 },
            ],
            monthlyViews: [
              { month: 'Jan', views: 1200, inquiries: 80 },
              { month: 'Feb', views: 1500, inquiries: 95 },
              { month: 'Mar', views: 1800, inquiries: 110 },
              { month: 'Apr', views: 2100, inquiries: 140 },
              { month: 'May', views: 2400, inquiries: 160 },
              { month: 'Jun', views: 2800, inquiries: 190 },
            ],
          });
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [timeRange]);

  const maxViews = useMemo(() => {
    if (!data?.monthlyViews) return 1;
    return Math.max(...data.monthlyViews.map((m) => m.views), 1);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track client engagement, listing views, and lead conversions.
          </p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all',
                timeRange === range
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading performance data...</p>
        </div>
      ) : data ? (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Views */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Listing Views</span>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{data.overview.totalViews.toLocaleString()}</span>
                <span className={cn('text-xs font-semibold flex items-center gap-0.5', data.overview.viewsTrend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {data.overview.viewsTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(data.overview.viewsTrend)}%
                </span>
              </div>
            </div>

            {/* Total Inquiries */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Client Inquiries</span>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{data.overview.totalInquiries.toLocaleString()}</span>
                <span className={cn('text-xs font-semibold flex items-center gap-0.5', data.overview.inquiriesTrend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {data.overview.inquiriesTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(data.overview.inquiriesTrend)}%
                </span>
              </div>
            </div>

            {/* Total Tour Bookings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Tour Bookings</span>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{data.overview.totalBookings.toLocaleString()}</span>
                <span className={cn('text-xs font-semibold flex items-center gap-0.5', data.overview.bookingsTrend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {data.overview.bookingsTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(data.overview.bookingsTrend)}%
                </span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Inquiry Conversion</span>
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{data.overview.conversionRate}%</span>
                <span className={cn('text-xs font-semibold flex items-center gap-0.5', data.overview.conversionTrend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {data.overview.conversionTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(data.overview.conversionTrend)}%
                </span>
              </div>
            </div>
          </div>

          {/* Bar Visualizer & Top Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* View Trends Chart Panel */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Traffic Trends
                </h3>
                <span className="text-xs text-slate-400">Monthly View Volume</span>
              </div>

              {/* Custom CSS Bar Chart Visual */}
              <div className="pt-8 pb-2 flex items-end justify-between gap-3 h-56 border-b border-slate-800">
                {data.monthlyViews.map((item) => {
                  const heightPercentage = Math.round((item.views / maxViews) * 100);
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                        {item.views}
                      </div>
                      <div
                        style={{ height: `${heightPercentage}%` }}
                        className="w-full max-w-[36px] bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t-lg transition-all"
                      />
                      <span className="text-xs text-slate-400 mt-3 font-medium">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performing Properties */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Top Performing Listings
              </h3>

              <div className="space-y-3">
                {data.topProperties.map((prop, idx) => (
                  <div
                    key={prop.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                        <h4 className="text-sm font-semibold text-white truncate">{prop.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-500" />
                          {prop.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          {prop.inquiries} leads
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400">
                        ${prop.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function RealtorAnalyticsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading analytics...</div>}>
      <RealtorAnalyticsContent />
    </Suspense>
  );
}