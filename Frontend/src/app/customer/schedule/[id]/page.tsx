'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  Building2,
  Loader2,
  Check,
  User,
  Phone,
  Mail,
  CalendarCheck,
} from 'lucide-react';

interface PropertyInfo {
  id: string;
  title: string;
  district: string;
  address: string;
  image_url: string;
  realtor: {
    name: string;
    phone: string;
    email: string;
  };
}

function ScheduleViewingContent() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [property, setProperty] = useState<PropertyInfo | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/customer/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const p = data.property || data;
          setProperty({
            id: p.id,
            title: p.title,
            district: p.district,
            address: p.address,
            image_url: p.image_url,
            realtor: p.realtor || {
              name: 'Remy Real Estate',
              phone: '+250 788 000 000',
              email: 'info@remy.com',
            },
          });
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/customer/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          tour_date: formData.date,
          tour_time: formData.time,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/customer/tours');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to schedule tour:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading property details...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <CalendarCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Viewing Scheduled!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Your property viewing has been scheduled. The realtor will confirm your appointment shortly.
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-500 mt-2">Redirecting to your tours...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/customer/property/${propertyId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Property
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-emerald-400" />
          Schedule Property Viewing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose a convenient date and time for your on-site tour.
        </p>
      </div>

      {/* Property Summary Card */}
      {property && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-20 h-16 object-cover rounded-xl shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{property.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-600 dark:text-slate-500" />
              {property.district}, {property.address}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3 text-slate-600 dark:text-slate-500" />
              Agent: {property.realtor.name}
            </p>
          </div>
        </div>
      )}

      {/* Schedule Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Preferred Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Preferred Time</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Notes for the Realtor</label>
          <textarea
            rows={4}
            placeholder="Any questions or special requirements for your visit..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Realtor Contact Info */}
        {property && (
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              Your Assigned Agent
            </span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm">
                {property.realtor.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{property.realtor.name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <a href={`tel:${property.realtor.phone}`} className="hover:text-emerald-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <a href={`mailto:${property.realtor.email}`} className="hover:text-emerald-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href={`/customer/property/${propertyId}`}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !formData.date || !formData.time}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {submitting ? 'Scheduling...' : 'Confirm Viewing'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ScheduleViewingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400">Loading schedule form...</div>}>
      <ScheduleViewingContent />
    </Suspense>
  );
}