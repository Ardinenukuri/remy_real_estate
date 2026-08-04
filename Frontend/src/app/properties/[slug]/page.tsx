'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Car,
  CheckCircle2,
  Phone,
  MessageSquare,
  BadgeCheck,
  Share2,
  Heart,
} from 'lucide-react';

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-[var(--navy)] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-white">
              Properties
            </Link>
            <span>/</span>
            <span className="text-white capitalize">Luxury Villa in Nyarutarama</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[var(--emerald)] text-white text-xs font-semibold rounded-lg">
                  For Sale
                </span>
                <span className="px-3 py-1 bg-amber-400 text-white text-xs font-semibold rounded-lg">
                  Featured
                </span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold">Luxury Villa in Nyarutarama</h1>
              <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
                <MapPin className="w-4 h-4 text-[var(--emerald)]" />
                <span>KG 17 Ave, Nyarutarama, Kigali, Rwanda</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left md:text-right">
                <p className="text-white/60 text-xs uppercase tracking-wider">Asking Price</p>
                <p className="text-3xl font-extrabold text-[var(--emerald)]">$320,000</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                  aria-label="Save"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Images, Overview, Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative h-[420px] rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                <Image
                  src={images[selectedImageIndex]}
                  alt="Property Main View"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === i
                        ? 'border-[var(--emerald)] ring-2 ring-[var(--emerald)]/40'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Key Specs Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--emerald)] flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Bedrooms</p>
                  <p className="text-sm font-bold text-[var(--navy)]">5 Beds</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Bathrooms</p>
                  <p className="text-sm font-bold text-[var(--navy)]">4 Baths</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Area</p>
                  <p className="text-sm font-bold text-[var(--navy)]">4,200 sqft</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Year Built</p>
                  <p className="text-sm font-bold text-[var(--navy)]">2024</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="font-heading text-2xl font-bold text-[var(--navy)]">About This Property</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Situated in Kigali's highly sought-after Nyarutarama neighborhood, this contemporary luxury villa offers an unparalleled living experience. Featuring open-concept living rooms with double-height ceilings, a gourmet chef's kitchen with built-in appliances, and panoramic views of the Kigali skyline.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                The master suite includes a private terrace, walk-in dressing room, and a spa-inspired ensuite bathroom. Outside features a manicured tropical garden, heated infinity swimming pool, covered outdoor dining lounge, and dedicated staff quarters.
              </p>
            </div>

            {/* Amenities Checklist */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="font-heading text-2xl font-bold text-[var(--navy)]">Amenities & Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Infinity Swimming Pool',
                  'Manicured Garden',
                  '24/7 Security Guard',
                  'Panoramic City Views',
                  'High-Speed Fiber Internet',
                  'Backup Generator',
                  'Water Storage Tanks',
                  'Fitted Gourmet Kitchen',
                  'Staff Quarters (DSQ)',
                  'Covered Garage (2 Cars)',
                  'Solar Water Heating',
                  'Electric Fence',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-slate-700 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[var(--emerald)] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Realtor & Schedule Form) */}
          <div className="space-y-6">
            {/* Realtor Contact Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                    alt="Jean-Paul Mugisha"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--emerald)] rounded-full flex items-center justify-center border-2 border-white">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--navy)] text-base">Jean-Paul Mugisha</h3>
                  <p className="text-[var(--emerald)] text-xs font-medium">Senior Real Estate Consultant</p>
                  <p className="text-slate-400 text-xs mt-1">Verified Realtor • 14 Active Listings</p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="tel:+250788001001"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--navy)] hover:bg-[var(--emerald)] text-white font-semibold rounded-xl text-xs transition-colors shadow"
                >
                  <Phone className="w-4 h-4" /> Call Realtor (+250 788 001 001)
                </a>
                <Link
                  href="/contact?realtor=jean-paul-m"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 hover:border-[var(--emerald)] text-slate-700 hover:text-[var(--emerald)] font-semibold rounded-xl text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Send Direct Message
                </Link>
              </div>

              {/* Schedule Viewing Form */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h4 className="font-semibold text-[var(--navy)] text-sm">Schedule a Viewing</h4>
                <form className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[var(--emerald)] hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shadow"
                  >
                    Request Viewing
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
