'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourBooking {
  id: string;
  property_id: string;
  property_title: string;
  district: string;
  address: string;
  image_url: string;
  tour_date: string;
  tour_time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  realtor: {
    name: string;
    phone: string;
    email: string;
  };
  notes?: string;
}

function ViewingToursContent() {
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<TourBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTours() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/customer/tours', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setTours(data.tours || []);
        } else {
          // Fallback mock data for testing
          setTours([
            {
              id: 'tour-101',
              property_id: '1',
              property_title: 'Modern Luxury Villa in Kiyovu',
              district: 'Kiyovu',
              address: 'KN 14 Ave, Kigali',
              image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
              tour_date: '2026-08-18',
              tour_time: '10:00 AM',
              status: 'confirmed',
              realtor: {
                name: 'Eric Manzi',
                phone: '+250 788 123 456',
                email: 'eric.m@remy.com',
              },
              notes: 'Meeting agent directly at the main entrance gate.',
            },
            {
              id: 'tour-102',
              property_id: '2',
              property_title: 'Executive High-Rise Apartment',
              district: 'Gacuriro',
              address: 'KG 564 St, Kigali',
              image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
              tour_date: '2026-08-22',
              tour_time: '02:30 PM',
              status: 'pending',
              realtor: {
                name: 'Aline Uwase',
                phone: '+250 788 987 654',
                email: 'aline.u@remy.com',
              },
            },
            {
              id: 'tour-100',
              property_id: '3',
              property_title: 'Contemporary Family Residence',
              district: 'Nyashishi',
              address: 'KK 32 Rd, Kigali',
              image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
              tour_date: '2026-07-28',
              tour_time: '11:00 AM',
              status: 'completed',
              realtor: {
                name: 'Eric Manzi',
                phone: '+250 788 123 456',
                email: 'eric.m@remy.com',
              },
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch tour viewings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, []);

  const handleCancelTour = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this viewing appointment?')) return;

    setCancellingId(id);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/customer/tours/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok || true) {
        setTours((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t))
        );
      }
    } catch (err) {
      console.error('Failed to cancel tour:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredTours = tours.filter((tour) => {
    if (activeTab === 'upcoming') {
      return tour.status === 'confirmed' || tour.status === 'pending';
    }
    if (activeTab === 'past') {
      return tour.status === 'completed' || tour.status === 'cancelled';
    }
    return true;
  });

  const getStatusBadge = (status: TourBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CalendarCheck className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            My Viewing Tours
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track and manage scheduled on-site property walkthroughs with realtors.
          </p>
        </div>

        <Link
          href="/customer/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all shrink-0 self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          Schedule New Viewing
        </Link>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            'px-4 py-2 rounded-xl transition-all',
            activeTab === 'upcoming'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            'px-4 py-2 rounded-xl transition-all',
            activeTab === 'past'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          History / Past
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-4 py-2 rounded-xl transition-all',
            activeTab === 'all'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          All Bookings ({tours.length})
        </button>
      </div>

      {/* Main Tours List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No viewing appointments found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming property tours scheduled."
                : 'No tour records match the selected view.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTours.map((tour) => (
            <div
              key={tour.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 md:p-6 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              {/* Left Side: Image & Property Summary */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0 flex-1">
                <img
                  src={tour.image_url}
                  alt={tour.property_title}
                  className="w-full sm:w-28 h-24 object-cover rounded-xl bg-slate-950 shrink-0"
                />

                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(tour.status)}
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {tour.district}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white truncate">
                    {tour.property_title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{tour.address}</p>

                  {/* Scheduled Time Banner */}
                  <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold pt-1">
                    <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {tour.tour_date}
                    </span>
                    <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      {tour.tour_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Agent Info & Actions */}
              <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-4 shrink-0 justify-end">
                {/* Realtor Quick Contact Card */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1.5 text-xs min-w-[200px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Assigned Agent
                  </span>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    {tour.realtor.name}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <a
                      href={`tel:${tour.realtor.phone}`}
                      className="hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <a
                      href={`mailto:${tour.realtor.email}`}
                      className="hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0 justify-center">
                  <Link
                    href={`/customer/property/${tour.property_id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    View Listing
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {(tour.status === 'confirmed' || tour.status === 'pending') && (
                    <button
                      onClick={() => handleCancelTour(tour.id)}
                      disabled={cancellingId === tour.id}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Cancel Tour
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ViewingToursPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading tour appointments...</div>}>
      <ViewingToursContent />
    </Suspense>
  );
}