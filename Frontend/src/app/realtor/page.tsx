'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Mail,
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

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  is_approved: boolean;
  views_count?: number;
  property_images?: { url: string }[];
}

interface Inquiry {
  id: string;
  client_name: string;
  created_at: string;
  status: string;
  property?: { title: string };
}

interface Appointment {
  id: string;
  client_name: string;
  scheduled_at: string;
  property?: { title: string };
}

// Mock Data
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Luxury Villa in Kiyovu',
    location: 'Kiyovu, Kigali',
    price: 350000000,
    is_approved: true,
    views_count: 1240,
    property_images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500' }],
  },
  {
    id: '2',
    title: 'Executive Apartment with City View',
    location: 'Nyarutarama, Kigali',
    price: 180000000,
    is_approved: true,
    views_count: 850,
    property_images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500' }],
  },
  {
    id: '3',
    title: 'Cozy Family House',
    location: 'Gacuriro, Kigali',
    price: 120000000,
    is_approved: false,
    views_count: 310,
    property_images: [],
  },
  {
    id: '4',
    title: 'Commercial Office Space',
    location: 'Kimi hurura, Kigali',
    price: 450000000,
    is_approved: true,
    views_count: 620,
    property_images: [{ url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500' }],
  },
];

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: '101',
    client_name: 'Jean-Luc Habimana',
    created_at: new Date().toISOString(),
    status: 'pending',
    property: { title: 'Modern Luxury Villa in Kiyovu' },
  },
  {
    id: '102',
    client_name: 'Marie Claire Uwase',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'replied',
    property: { title: 'Executive Apartment with City View' },
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '201',
    client_name: 'David Mugisha',
    scheduled_at: new Date(Date.now() + 172800000).toISOString(),
    property: { title: 'Modern Luxury Villa in Kiyovu' },
  },
  {
    id: '202',
    client_name: 'Aline Niyonsaba',
    scheduled_at: new Date(Date.now() + 345600000).toISOString(),
    property: { title: 'Commercial Office Space' },
  },
];

export default function RealtorOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    pendingInquiries: 0,
    upcomingAppointments: 0,
    totalViews: 0,
  });
  const [recentListings, setRecentListings] = useState<Property[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API fetch delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const listings = MOCK_PROPERTIES;
      const inquiries = MOCK_INQUIRIES;
      const appointments = MOCK_APPOINTMENTS;

      setStats({
        totalListings: listings.length,
        activeListings: listings.filter((p) => p.is_approved).length,
        totalViews: listings.reduce((acc, curr) => acc + (curr.views_count || 0), 0),
        pendingInquiries: inquiries.filter((i) => i.status === 'pending').length,
        upcomingAppointments: appointments.length,
      });

      setRecentListings(listings.slice(0, 4));
      setRecentInquiries(inquiries);
      setUpcomingAppointments(appointments);
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
      <div className="flex flex-col items-center justify-center py-20 border border-slate-800 bg-slate-900 rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
        <p className="text-xs text-slate-400">Loading realtor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Welcome back! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
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
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Listings
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {stats.activeListings}{' '}
              <span className="text-xs font-normal text-slate-500">/ {stats.totalListings} total</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Views
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {stats.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pending Inquiries
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {stats.pendingInquiries}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Upcoming Viewings
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {stats.upcomingAppointments}
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
            <h2 className="font-heading font-bold text-lg text-white">Recent Listings</h2>
            <Link
              href="/realtor/listings"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
            {recentListings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No listings posted yet.</p>
            ) : (
              recentListings.map((property) => (
                <div key={property.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                      {property.property_images?.[0]?.url ? (
                        <img
                          src={property.property_images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">{property.title}</p>
                      <p className="text-xs text-slate-400">{property.location}</p>
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

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Recent Inquiries */}
          <div className="space-y-3">
            <h2 className="font-heading font-bold text-lg text-white">Inquiries</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              {recentInquiries.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No recent messages</p>
              ) : (
                recentInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-200">{inquiry.client_name}</span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      Re: {inquiry.property?.title || 'Property'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-3">
            <h2 className="font-heading font-bold text-lg text-white">Upcoming Viewings</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No scheduled viewings</p>
              ) : (
                upcomingAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1"
                  >
                    <p className="text-xs font-bold text-slate-200">{app.client_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{app.property?.title}</p>
                    <p className="text-[10px] text-purple-400 font-mono">
                      {new Date(app.scheduled_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}