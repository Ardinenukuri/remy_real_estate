'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Home as HouseIcon,
  Search,
  ArrowRight,
  Heart,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  MessageCircle,
  CalendarCheck,
  TrendingUp,
  Award,
  Quote,
} from 'lucide-react';

const FEATURED_PROPERTIES = [
  {
    slug: 'luxury-villa-nyarutarama',
    title: 'Luxury Villa in Nyarutarama',
    location: 'KG 17 Ave, Nyarutarama, Kigali',
    price: '$320,000',
    type: 'For Sale',
    category: 'Villas',
    featured: true,
    beds: 5,
    baths: 4,
    sqft: '4,200',
    realtor: 'Jean-Paul M.',
    realtorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'modern-apartment-kacyiru',
    title: 'Modern Apartment in Kacyiru',
    location: 'KG 5 Ave, Kacyiru, Kigali',
    price: '$185,000',
    type: 'For Sale',
    category: 'Apartments',
    featured: false,
    beds: 3,
    baths: 2,
    sqft: '1,850',
    realtor: 'Aline U.',
    realtorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'executive-penthouse-kimihurura',
    title: 'Executive Penthouse in Kimihurura',
    location: 'KG 11 Ave, Kimihurura, Kigali',
    price: '$4,500/mo',
    type: 'For Rent',
    category: 'Penthouses',
    featured: true,
    beds: 4,
    baths: 3,
    sqft: '3,100',
    realtor: 'Patrick N.',
    realtorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'commercial-office-cbd',
    title: 'Prime Commercial Office, CBD',
    location: 'KG 7 Ave, Kigali CBD, Kigali',
    price: '$650,000',
    type: 'For Sale',
    category: 'Offices',
    featured: true,
    beds: 0,
    baths: 6,
    sqft: '5,800',
    realtor: 'Jean-Paul M.',
    realtorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'family-home-gacuriro',
    title: 'Family Home with Pool, Gacuriro',
    location: 'KG 23 Ave, Gacuriro, Kigali',
    price: '$220,000',
    type: 'For Sale',
    category: 'Houses',
    featured: false,
    beds: 4,
    baths: 3,
    sqft: '2,800',
    realtor: 'Aline U.',
    realtorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'cozy-apartment-remera',
    title: 'Cozy 2BR Apartment in Remera',
    location: 'KG 9 Ave, Remera, Kigali',
    price: '$1,200/mo',
    type: 'For Rent',
    category: 'Apartments',
    featured: false,
    beds: 2,
    baths: 1,
    sqft: '950',
    realtor: 'Patrick N.',
    realtorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  },
];

const TESTIMONIALS = [
  {
    name: 'David & Mary K.',
    role: 'Homeowners in Nyarutarama',
    initials: 'DM',
    comment:
      'Finding our dream villa in Kigali was effortless through Remy Real Estates. Direct contact with Jean-Paul made the title verification and buying process 100% transparent.',
    rating: 5,
  },
  {
    name: 'Sarah L.',
    role: 'Expat Tenant in Kimihurura',
    initials: 'SL',
    comment:
      'As an expat moving to Rwanda, Patrick helped me secure a high-security penthouse within 48 hours of arriving in Kigali. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Emmanuel R.',
    role: 'Commercial Investor',
    initials: 'ER',
    comment:
      'The platform provided verified office listings in Kigali CBD with accurate square footage and pricing history. We closed our transaction smoothly.',
    rating: 5,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('apartments');
  const [priceRange, setPriceRange] = useState('any');

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury property in Kigali Rwanda"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy)]/70 via-[var(--navy)]/50 to-[var(--navy)]/80" />
        </div>

        {/* Floating Top Metrics Bar */}
        <div className="absolute top-0 left-0 right-0 pt-24 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
            <div className="hidden lg:flex items-center gap-8 py-3 px-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-none">1,200+</div>
                <div className="text-white/60 text-xs mt-1">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-none">850+</div>
                <div className="text-white/60 text-xs mt-1">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-none">120+</div>
                <div className="text-white/60 text-xs mt-1">Verified Realtors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider mb-6">
            Rwanda's #1 Real Estate Platform
          </span>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white font-bold leading-tight text-balance mb-4">
            Find Your Dream Space
            <br />
            <span className="text-[var(--emerald)]">with Verified</span> Listings
          </h1>

          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Search top-tier residential, commercial, and luxury properties with direct realtor communication across Rwanda.
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto text-left">
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('buy')}
                className={`flex-1 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  activeTab === 'buy'
                    ? 'bg-[var(--navy)] text-white'
                    : 'text-slate-500 hover:text-[var(--navy)] hover:bg-slate-50'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`flex-1 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  activeTab === 'rent'
                    ? 'bg-[var(--navy)] text-white'
                    : 'text-slate-500 hover:text-[var(--navy)] hover:bg-slate-50'
                }`}
              >
                Rent
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Location (e.g. Nyarutarama)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                  />
                </div>

                <div className="relative">
                  <HouseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)] appearance-none cursor-pointer"
                  >
                    <option value="apartments">Apartments</option>
                    <option value="villas">Villas</option>
                    <option value="offices">Offices</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full pl-7 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)] appearance-none cursor-pointer"
                  >
                    <option value="any">Any Price</option>
                    <option value="0-50000">Under $50K</option>
                    <option value="50000-200000">$50K – $200K</option>
                    <option value="200000-500000">$200K – $500K</option>
                    <option value="500000+">$500K+</option>
                  </select>
                </div>
              </div>

              <Link
                href={`/properties?type=${activeTab}&location=${encodeURIComponent(
                  location,
                )}&category=${propertyType}&price=${priceRange}`}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--emerald)] hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-md"
              >
                <Search className="w-4 h-4" /> Search Properties
              </Link>
            </div>
          </div>

          {/* Popular Tag Buttons */}
          <div className="mt-6 flex items-center justify-center flex-wrap gap-2">
            <span className="text-white/50 text-xs">Popular:</span>
            <Link href="/properties?location=Nyarutarama&category=villas">
              <span className="px-3 py-1 text-xs text-white/80 bg-white/10 hover:bg-[var(--emerald)]/30 border border-white/20 rounded-full transition-colors cursor-pointer">
                Nyarutarama Villas
              </span>
            </Link>
            <Link href="/properties?location=Kacyiru&category=apartments">
              <span className="px-3 py-1 text-xs text-white/80 bg-white/10 hover:bg-[var(--emerald)]/30 border border-white/20 rounded-full transition-colors cursor-pointer">
                Kacyiru Apartments
              </span>
            </Link>
            <Link href="/properties?location=Kimihurura&category=offices">
              <span className="px-3 py-1 text-xs text-white/80 bg-white/10 hover:bg-[var(--emerald)]/30 border border-white/20 rounded-full transition-colors cursor-pointer">
                Kimihurura Offices
              </span>
            </Link>
            <Link href="/properties?location=Gacuriro&category=land">
              <span className="px-3 py-1 text-xs text-white/80 bg-white/10 hover:bg-[var(--emerald)]/30 border border-white/20 rounded-full transition-colors cursor-pointer">
                Gacuriro Land
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-white/40 text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </section>

      {/* FEATURED LISTINGS SECTION */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <span className="inline-flex items-center px-3 py-1 bg-[var(--emerald)]/10 text-[var(--emerald)] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
                Featured Listings
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--navy)] text-balance">
                Handpicked Properties
                <br />
                <span className="text-[var(--emerald)]">Just for You</span>
              </h2>
            </div>
            <Link
              href="/properties"
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white rounded-xl text-sm font-semibold transition-colors"
            >
              View All Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PROPERTIES.map((prop) => (
              <article
                key={prop.slug}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100 group"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <Image
                    src={prop.image}
                    alt={prop.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg text-white ${
                        prop.type === 'For Sale' ? 'bg-[var(--emerald)]' : 'bg-blue-600'
                      }`}
                    >
                      {prop.type}
                    </span>
                    {prop.featured && (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-amber-400 text-white rounded-lg">
                        Featured
                      </span>
                    )}
                  </div>
                  <button
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
                    aria-label="Save to favorites"
                  >
                    <Heart className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1.5 bg-[var(--navy)]/90 text-white text-sm font-bold rounded-lg backdrop-blur-sm">
                      {prop.price}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[var(--navy)] text-base leading-snug mb-1 line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-400 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="text-xs">{prop.location}</span>
                  </div>

                  <div className="flex items-center gap-4 py-3 border-t border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Bed className="w-4 h-4 text-[var(--emerald)]" />
                      <span className="text-xs font-medium">{prop.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Bath className="w-4 h-4 text-[var(--emerald)]" />
                      <span className="text-xs font-medium">{prop.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Maximize2 className="w-4 h-4 text-[var(--emerald)]" />
                      <span className="text-xs font-medium">{prop.sqft} sqft</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--navy)] overflow-hidden flex items-center justify-center relative">
                        <Image src={prop.realtorAvatar} alt={prop.realtor} fill className="object-cover" />
                      </div>
                      <span className="text-xs text-slate-500">{prop.realtor}</span>
                    </div>
                    <Link
                      href={`/properties/${prop.slug}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-[var(--navy)] hover:bg-[var(--emerald)] text-white rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="py-20 bg-[var(--navy)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/30 text-[var(--emerald)] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
              Why Choose Us
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
              The Smarter Way to Find
              <br />
              <span className="text-[var(--emerald)]">Your Next Property</span>
            </h2>
            <p className="text-white/60 leading-relaxed">
              We combine verified data, experienced realtors, and modern tools to make your property journey seamless from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-emerald-50 text-[var(--emerald)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">Verified Listings</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Every property is manually reviewed and verified by our team before publishing — no fake listings, ever.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">Direct Realtor Chat</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Connect instantly with verified realtors. Ask questions, negotiate, and communicate in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-amber-50 text-amber-600">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">Instant Viewing Scheduling</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Book a property viewing in seconds. Pick your preferred date and time directly from the listing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-50 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">Market Insights</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Access real-time pricing data and market trends to make informed investment decisions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-rose-50 text-rose-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">Top Certified Realtors</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Work with Rwanda's best real estate professionals — all certified, experienced, and highly rated.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-teal-50 text-teal-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">Advanced Search</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Filter by price, location, bedrooms, amenities, and more to find exactly what you're looking for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center px-3 py-1 bg-[var(--emerald)]/10 text-[var(--emerald)] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
              Client Stories
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--navy)] text-balance">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--emerald)] flex items-center justify-center text-white font-bold text-sm">
                    {t.initials}
                  </div>
                  <Quote className="w-8 h-8 text-[var(--emerald)]/20" />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                  "{t.comment}"
                </p>
                <div>
                  <h4 className="font-semibold text-[var(--navy)] text-sm">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
