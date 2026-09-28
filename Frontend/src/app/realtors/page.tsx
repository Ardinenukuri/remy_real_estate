'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Building2,
  Briefcase,
  Phone,
  MessageSquare,
  BadgeCheck,
  Loader2,
  Users,
} from 'lucide-react';

interface Realtor {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
  specialization: string;
  agency_name: string;
  years_experience: number;
  office_address: string;
  phone: string;
  email: string;
  active_listings: number;
}

export default function RealtorsPage() {
  const router = useRouter();
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealtors() {
      setLoading(true);
      try {
        const res = await fetch('/api/realtors');
        if (res.ok) {
          const data = await res.json();
          setRealtors(data.realtors || []);
        }
      } catch (err) {
        console.error('Failed to load realtors:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRealtors();
  }, []);

  const handleMessage = (realtorId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      router.push(`/customer/messages?realtor_id=${realtorId}`);
    } else {
      router.push('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-[var(--navy)] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Realtors</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider mb-4">
                Verified Professionals
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white text-balance mb-3">
                Meet Our Realtors
              </h1>
              <p className="text-white/60 leading-relaxed text-sm">
                Every realtor on our platform is personally screened, verified, and held to the highest professional standards. Find the right expert for your property needs.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
              <BadgeCheck className="w-6 h-6 text-[var(--emerald)]" />
              <div>
                <p className="text-white font-bold text-xl leading-none">{realtors.length}</p>
                <p className="text-white/60 text-xs mt-0.5">Verified Realtors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realtors Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)] mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading our verified realtors...</p>
          </div>
        ) : realtors.length === 0 ? (
          <div className="py-24 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-[var(--navy)] dark:text-white mb-1">No Verified Realtors Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
              Our team is currently verifying new realtor applications. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {realtors.map((r) => (
              <article
                key={r.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {r.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.avatar_url} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-[var(--emerald)]">{r.name.charAt(0)}</span>
                        )}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--emerald)] rounded-full flex items-center justify-center shadow border-2 border-white"
                        title="Verified Realtor"
                      >
                        <BadgeCheck className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-[var(--navy)] dark:text-white text-lg leading-tight">{r.name}</h2>
                      {(r.specialization || r.agency_name) && (
                        <p className="text-[var(--emerald)] text-xs font-medium mt-0.5">
                          {r.specialization || r.agency_name}
                        </p>
                      )}

                      {r.office_address && (
                        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mt-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs">{r.office_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-4 line-clamp-3">
                    {r.bio || 'This realtor has not added a bio yet, but is verified and ready to help with your property search.'}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[var(--navy)] dark:text-white font-bold text-lg">
                        <Building2 className="w-4 h-4 text-[var(--emerald)]" />
                        {r.active_listings}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Active Listings</p>
                    </div>
                    <div className="text-center border-l border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-1 text-[var(--navy)] dark:text-white font-bold text-lg">
                        <Briefcase className="w-4 h-4 text-[var(--emerald)]" />
                        {r.years_experience > 0 ? `${r.years_experience}y` : '—'}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Experience</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {r.phone && (
                      <a
                        href={`tel:${r.phone}`}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--navy)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--emerald)] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    )}
                    <button
                      onClick={() => handleMessage(r.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 text-xs font-semibold rounded-xl hover:border-[var(--emerald)] hover:text-[var(--emerald)] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>
                    <Link
                      href={`/properties?realtor=${r.id}`}
                      className="ml-auto text-xs text-[var(--emerald)] font-medium hover:underline"
                    >
                      View Listings
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Join CTA */}
        <div className="mt-16 bg-[var(--navy)] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <span className="inline-flex items-center px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider mb-4">
              Join Our Network
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white text-balance mb-3">
              Are You a Realtor?
            </h3>
            <p className="text-white/60 leading-relaxed text-sm">
              Join Rwanda's fastest-growing real estate platform. List properties, receive verified leads, manage viewings, and grow your business — all from one professional dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              href="/register?role=realtor"
              className="px-6 py-3 bg-[var(--emerald)] text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors whitespace-nowrap"
            >
              Apply to Join
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
