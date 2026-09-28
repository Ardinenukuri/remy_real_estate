'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
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
  Building2,
  Loader2,
} from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const realtorId = searchParams.get('realtor');

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'All' | 'For Sale' | 'For Rent'>(() => {
    const type = searchParams.get('type');
    if (type === 'buy' || type === 'sale') return 'For Sale';
    if (type === 'rent') return 'For Rent';
    return 'All';
  });
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('location') || searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState(0);
  const [minBaths, setMinBaths] = useState(0);
  const [category, setCategory] = useState(() => searchParams.get('category') || '');

  const activeAdvancedFilterCount = [minPrice, maxPrice, minBeds > 0, minBaths > 0, category].filter(Boolean).length;

  const clearAdvancedFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinBeds(0);
    setMinBaths(0);
    setCategory('');
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchDatabaseProperties() {
      setLoading(true);
      try {
        const query = realtorId ? `?realtor_id=${encodeURIComponent(realtorId)}` : '';
        const res = await fetch(`/api/properties${query}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.properties || [];
          setProperties(list);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to fetch properties from database:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDatabaseProperties();
  }, [realtorId]);

  const handleSaveProperty = async (prop: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/signin';
      return;
    }

    try {
      await fetch('/api/customer/saved-properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ property_id: prop.id }),
      });
      alert('Property saved to your favorites!');
    } catch (err) {
      console.error('Failed to save property:', err);
    }
  };

  const filteredProperties = properties
    .filter((p) => {
      const pType = (p.listing_type || p.type || '').toLowerCase();
      if (filterType === 'For Sale' && !pType.includes('sale')) return false;
      if (filterType === 'For Rent' && !pType.includes('rent')) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = (p.title || '').toLowerCase();
        const district = (p.district || p.location || p.address || '').toLowerCase();
        if (!title.includes(q) && !district.includes(q)) return false;
      }
      const price = Number(p.price || 0);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;
      if (minBeds > 0 && Number(p.bedrooms || 0) < minBeds) return false;
      if (minBaths > 0 && Number(p.bathrooms || 0) < minBaths) return false;
      if (category && p.category_id !== category) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
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
                {filteredProperties.length} verified database listings found
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, address, or neighborhood…"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all relative shrink-0 ${
              showFilters
                ? 'bg-[var(--navy)] border-[var(--navy)] text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeAdvancedFilterCount > 0 && (
              <span className="w-5 h-5 bg-[var(--emerald)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeAdvancedFilterCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--navy)] text-white'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
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
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--navy)] dark:text-white text-sm">Advanced Filters</h3>
              <button
                onClick={clearAdvancedFilters}
                className="text-xs text-[var(--emerald)] font-medium hover:underline"
              >
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Min Price (RWF)</label>
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="No minimum"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Max Price (RWF)</label>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="No maximum"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Min Bedrooms</label>
                <select
                  value={minBeds}
                  onChange={(e) => setMinBeds(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                >
                  <option value={0}>Any</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Min Bathrooms</label>
                <select
                  value={minBaths}
                  onChange={(e) => setMinBaths(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                >
                  <option value={0}>Any</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategory('')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === ''
                        ? 'bg-[var(--emerald)] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        category === cat.id
                          ? 'bg-[var(--emerald)] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Grid / List */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)] mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading database properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-[var(--navy)] dark:text-white">No Database Properties Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {searchQuery
                ? 'No real estate listings match your search criteria.'
                : 'No property listings have been published in the database yet. Real estate agents can add listings via the Realtor Dashboard.'}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProperties.map((prop, idx) => {
              const coverImg = prop.images?.[0] || prop.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
              const pType = prop.listing_type === 'rent' ? 'For Rent' : 'For Sale';
              const propId = prop.id || prop.slug || `prop-${idx}`;

              return (
                <article
                  key={propId}
                  className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-800 group ${
                    viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${
                      viewMode === 'list' ? 'sm:w-64 h-52 shrink-0' : 'h-52'
                    }`}
                  >
                    <img
                      src={coverImg}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg text-white ${
                          pType === 'For Sale' ? 'bg-[var(--emerald)]' : 'bg-blue-600'
                        }`}
                      >
                        {pType}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleSaveProperty(prop, e)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
                      aria-label="Save to favorites"
                    >
                      <Heart className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors" />
                    </button>

                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1.5 bg-[var(--navy)]/90 text-white text-sm font-bold rounded-lg backdrop-blur-sm">
                        {prop.currency || 'RWF'} {Number(prop.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-semibold text-[var(--navy)] dark:text-white text-base leading-snug mb-1 line-clamp-1">
                        {prop.title}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs truncate">{prop.district || prop.address || 'Kigali'}</span>
                      </div>

                      <div className="flex items-center gap-4 py-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Bed className="w-4 h-4 text-[var(--emerald)]" />
                          <span className="text-xs font-medium">{prop.bedrooms || 0} Beds</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Bath className="w-4 h-4 text-[var(--emerald)]" />
                          <span className="text-xs font-medium">{prop.bathrooms || 0} Baths</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Maximize2 className="w-4 h-4 text-[var(--emerald)]" />
                          <span className="text-xs font-medium">{prop.size || prop.area_sqm || 0} m²</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <Link
                        href={`/properties/${propId}`}
                        className="px-4 py-2 text-xs font-semibold bg-[var(--navy)] hover:bg-[var(--emerald)] text-white rounded-xl transition-colors shadow"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-24 text-center text-slate-400 dark:text-slate-500">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
