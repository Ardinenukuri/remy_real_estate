'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Grid3X3,
  List as ListIcon,
  Heart,
  Bed,
  Bath,
  Maximize2,
} from 'lucide-react';

const PROPERTIES_LIST = [
  {
    slug: 'family-home-gacuriro',
    title: 'Family Home with Pool, Gacuriro',
    location: 'KG 23 Ave, Gacuriro, Kigali',
    price: '$220,000',
    type: 'For Sale',
    category: 'Houses',
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
    beds: 2,
    baths: 1,
    sqft: '950',
    realtor: 'Patrick N.',
    realtorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'executive-penthouse-kimihurura',
    title: 'Executive Penthouse in Kimihurura',
    location: 'KG 11 Ave, Kimihurura, Kigali',
    price: '$4,500/mo',
    type: 'For Rent',
    category: 'Penthouses',
    beds: 4,
    baths: 3,
    sqft: '3,100',
    realtor: 'Patrick N.',
    realtorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'land-plot-kanombe',
    title: 'Prime Land Plot in Kanombe',
    location: 'KG 45 Ave, Kanombe, Kigali',
    price: '$85,000',
    type: 'For Sale',
    category: 'Land',
    beds: 0,
    baths: 0,
    sqft: '6,000',
    realtor: 'Jean-Paul M.',
    realtorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'modern-apartment-kacyiru',
    title: 'Modern Apartment in Kacyiru',
    location: 'KG 5 Ave, Kacyiru, Kigali',
    price: '$185,000',
    type: 'For Sale',
    category: 'Apartments',
    beds: 3,
    baths: 2,
    sqft: '1,850',
    realtor: 'Aline U.',
    realtorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'guest-house-kiyovu',
    title: 'Charming Guest House in Kiyovu',
    location: 'KG 3 Ave, Kiyovu, Kigali',
    price: '$2,800/mo',
    type: 'For Rent',
    category: 'Guest House',
    featured: true,
    beds: 6,
    baths: 5,
    sqft: '3,500',
    realtor: 'Aline U.',
    realtorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
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
];

export default function PropertiesPage() {
  const [filterType, setFilterType] = useState<'All' | 'For Sale' | 'For Rent'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProperties = PROPERTIES_LIST.filter((p) => {
    if (filterType === 'For Sale' && p.type !== 'For Sale') return false;
    if (filterType === 'For Rent' && p.type !== 'For Rent') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-[var(--navy)] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
                <span>/</span>
                <span className="text-white">Properties</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white text-balance">
                Property Listings
              </h1>
              <p className="text-white/60 mt-2 text-sm">
                {filteredProperties.length} properties found
              </p>
            </div>
            <div className="flex gap-1 bg-white/10 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setFilterType('All')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'All'
                    ? 'bg-[var(--emerald)] text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('For Sale')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'For Sale'
                    ? 'bg-[var(--emerald)] text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                For Sale
              </button>
              <button
                onClick={() => setFilterType('For Rent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'For Rent'
                    ? 'bg-[var(--emerald)] text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                For Rent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, address, or neighborhood…"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors bg-white border-slate-200 text-slate-700 hover:border-slate-300">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--navy)] text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--navy)] text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Properties Grid / List */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'flex flex-col gap-4'
          }
        >
          {filteredProperties.map((prop, idx) => (
            <article
              key={idx}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100 group ${
                viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
              }`}
            >
              <div
                className={`relative overflow-hidden bg-slate-100 ${
                  viewMode === 'list' ? 'sm:w-64 h-52 shrink-0' : 'h-52'
                }`}
              >
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

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--navy)] text-base leading-snug mb-1 line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-400 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
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
                </div>

                <div className="flex items-center justify-between pt-2">
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
    </div>
  );
}
