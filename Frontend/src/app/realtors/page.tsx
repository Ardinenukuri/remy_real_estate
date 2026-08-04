'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Star,
  Building2,
  Handshake,
  Globe,
  Phone,
  MessageSquare,
  BadgeCheck,
} from 'lucide-react';

const REALTORS_LIST = [
  {
    slug: 'jean-paul-m',
    name: 'Jean-Paul Mugisha',
    role: 'Senior Real Estate Consultant',
    rating: 4.9,
    reviewsCount: 38,
    location: 'Nyarutarama, Kigali',
    bio: 'With over 10 years of experience in the Rwandan real estate market, Jean-Paul specializes in luxury residential and commercial properties. A trusted advisor to expatriates, investors, and high-net-worth clients.',
    activeListings: 14,
    dealsClosed: 62,
    languagesCount: 3,
    specialties: ['Luxury Villas', 'Commercial Properties', 'Investment Properties'],
    languages: ['English', 'French', 'Kinyarwanda'],
    phone: '+250 788 001 001',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
  },
  {
    slug: 'aline-u',
    name: 'Aline Uwimana',
    role: 'Residential Property Specialist',
    rating: 4.8,
    reviewsCount: 27,
    location: 'Kacyiru, Kigali',
    bio: 'Aline is a dedicated residential specialist who has helped hundreds of families find their perfect home in Kigali. She is known for her in-depth neighborhood knowledge and patience throughout the buying process.',
    activeListings: 9,
    dealsClosed: 41,
    languagesCount: 2,
    specialties: ['Family Homes', 'Apartments', 'First-time Buyers'],
    languages: ['English', 'Kinyarwanda'],
    phone: '+250 788 002 002',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    slug: 'patrick-n',
    name: 'Patrick Nshimiye',
    role: 'Luxury Rentals & Relocation Expert',
    rating: 4.7,
    reviewsCount: 31,
    location: 'Kimihurura, Kigali',
    bio: 'Patrick has built a strong reputation managing premium rentals and assisting diplomats, NGO workers, and corporate clients with relocation to Kigali. He provides white-glove service from property search to move-in.',
    activeListings: 11,
    dealsClosed: 55,
    languagesCount: 4,
    specialties: ['Luxury Rentals', 'Corporate Relocation', 'Diplomatic Housing'],
    languages: ['English', 'French', 'Kinyarwanda', 'Swahili'],
    phone: '+250 788 003 003',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    slug: 'diane-k',
    name: 'Diane Kagame',
    role: 'Land & Development Consultant',
    rating: 4.8,
    reviewsCount: 19,
    location: 'Kigali CBD',
    bio: "Diane specializes in land acquisition, plot sales, and real estate development consultancy. She has guided both local and international developers through Rwanda's land registry process with precision and care.",
    activeListings: 7,
    dealsClosed: 29,
    languagesCount: 2,
    specialties: ['Land & Plots', 'Real Estate Development', 'Legal Documentation'],
    languages: ['English', 'Kinyarwanda'],
    phone: '+250 788 004 004',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
];

export default function RealtorsPage() {
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
                <p className="text-white font-bold text-xl leading-none">4+</p>
                <p className="text-white/60 text-xs mt-0.5">Verified Realtors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realtors Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REALTORS_LIST.map((r) => (
            <article
              key={r.slug}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 relative">
                      <Image src={r.avatar} alt={r.name} fill className="object-cover" />
                    </div>
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--emerald)] rounded-full flex items-center justify-center shadow border-2 border-white"
                      title="Verified Realtor"
                    >
                      <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h2 className="font-semibold text-[var(--navy)] text-lg leading-tight">{r.name}</h2>
                        <p className="text-[var(--emerald)] text-xs font-medium mt-0.5">{r.role}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-600">{r.rating}</span>
                        <span className="text-xs text-slate-400">({r.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 mt-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs">{r.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mt-4 line-clamp-2">{r.bio}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[var(--navy)] font-bold text-lg">
                      <Building2 className="w-4 h-4 text-[var(--emerald)]" />
                      {r.activeListings}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Active Listings</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <div className="flex items-center justify-center gap-1 text-[var(--navy)] font-bold text-lg">
                      <Handshake className="w-4 h-4 text-[var(--emerald)]" />
                      {r.dealsClosed}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Deals Closed</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[var(--navy)] font-bold text-lg">
                      <Globe className="w-4 h-4 text-[var(--emerald)]" />
                      {r.languagesCount}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Languages</p>
                  </div>
                </div>

                {/* Specialties & Languages */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {r.specialties.map((spec, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-slate-400">Languages:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {r.languages.map((lang, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-[var(--emerald)]/10 text-[var(--emerald)] text-xs rounded-md font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                  <a
                    href={`tel:${r.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--navy)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--emerald)] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <Link
                    href={`/contact?realtor=${r.slug}`}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:border-[var(--emerald)] hover:text-[var(--emerald)] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </Link>
                  <Link
                    href={`/properties?realtor=${r.slug}`}
                    className="ml-auto text-xs text-[var(--emerald)] font-medium hover:underline"
                  >
                    View Listings
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

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
              href="/signin?role=realtor"
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
