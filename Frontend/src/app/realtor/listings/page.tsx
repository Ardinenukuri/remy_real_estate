'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Grid3x3,
  List,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building2,
} from 'lucide-react';
import type { Property, Category } from '@/types';
import { formatPriceShort, cn } from '@/lib/utils';

const RWANDA_DISTRICTS = [
  'Nyarutarama',
  'Kacyiru',
  'Kimihurura',
  'Gacuriro',
  'Remera',
  'CBD',
  'Kanombe',
  'Kibagabaga',
  'Gisozi',
  'Nyarugenge',
];

const AMENITIES = [
  'Swimming Pool',
  'Garden',
  'Garage',
  'Air Conditioning',
  'Security',
  'Parking',
  'Smart Home',
  'Furnished',
  'Balcony',
  'Elevator',
  'Solar Power',
  'Backup Generator',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

function RealtorListingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [district, setDistrict] = useState(searchParams.get('district') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || 'any');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || 'any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Load Categories via REST API
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Load Properties via REST API
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);

      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      const params = new URLSearchParams();
      if (user?.id) params.set('realtor_id', user.id);
      if (status !== 'all') params.set('status', status);
      if (type !== 'all') params.set('type', type);
      if (category !== 'all') params.set('category', category);
      if (district !== 'all') params.set('district', district);
      if (bedrooms !== 'any') params.set('bedrooms', bedrooms);
      if (bathrooms !== 'any') params.set('bathrooms', bathrooms);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (query) params.set('q', query);
      if (selectedAmenities.length > 0)
        params.set('amenities', selectedAmenities.join(','));
      if (sort) params.set('sort', sort);

      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/properties?${params.toString()}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : data.properties || []);
      } catch (error) {
        console.error('Error fetching realtor listings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [
    query,
    category,
    type,
    status,
    district,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    selectedAmenities,
    sort,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category !== 'all') count++;
    if (type !== 'all') count++;
    if (district !== 'all') count++;
    if (status !== 'all') count++;
    if (bedrooms !== 'any') count++;
    if (bathrooms !== 'any') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    count += selectedAmenities.length;
    return count;
  }, [
    category,
    type,
    district,
    status,
    bedrooms,
    bathrooms,
    minPrice,
    maxPrice,
    selectedAmenities,
  ]);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'any') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl('q', query);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setType('all');
    setStatus('all');
    setDistrict('all');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('any');
    setBathrooms('any');
    setSelectedAmenities([]);
    setSort('newest');
    router.push(pathname);
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const handleDeleteListing = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/properties/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setProperties((prev) => prev.filter((p) => p.id !== id));
        } else {
          alert('Failed to delete property.');
        }
      } catch (err) {
        console.error('Failed to delete listing:', err);
        alert('An error occurred while deleting the property.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Listings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {loading
              ? 'Loading your listings...'
              : `Manage your ${properties.length} active property ${
                  properties.length === 1 ? 'listing' : 'listings'
                }`}
          </p>
        </div>

        <Link
          href="/realtor/listings/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Search & Filter Trigger */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings by location, title, or reference..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all relative',
            showFilters
              ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500 text-emerald-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Filter Listings</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Listing Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  updateUrl('type', e.target.value);
                }}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  updateUrl('category', e.target.value);
                }}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                District
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  updateUrl('district', e.target.value);
                }}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Districts</option>
                {RWANDA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  updateUrl('status', e.target.value);
                }}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Min Price (RWF)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Max Price (RWF)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Min Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Min Bathrooms
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                    selectedAmenities.includes(a)
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Options & Layout Toggles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Sort by:</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setView('grid')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              view === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-400' : 'text-slate-600 dark:text-slate-500'
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              view === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-400' : 'text-slate-600 dark:text-slate-500'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Properties Display Grid/List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your property portfolio...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Listings Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            We couldn’t find any properties matching your selected criteria.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors"
          >
            Clear Active Filters
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <RealtorPropertyCard
              key={property.id}
              property={property}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <RealtorPropertyListRow
              key={property.id}
              property={property}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* Card Component for Grid View */
function RealtorPropertyCard({
  property,
  onDelete,
}: {
  property: Property;
  onDelete: (id: string) => void;
}) {
  const primaryImage = property.images?.[0] || '/placeholder-house.jpg';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
            {property.listing_type}
          </span>
          <span
            className={cn(
              'px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md border text-[11px] font-semibold uppercase tracking-wide',
              property.status === 'available'
                ? 'border-emerald-500/30 text-emerald-400'
                : 'border-amber-500/30 text-amber-400'
            )}
          >
            {property.status}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
            <span>{property.district}, Kigali</span>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 mb-2 group-hover:text-emerald-400 transition-colors">
            {property.title}
          </h3>

          <div className="text-lg font-bold text-emerald-400 mb-4">
            {formatPriceShort(property.price, property.currency)}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-3">
            {(property.bedrooms ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" /> {property.bedrooms} Beds
              </span>
            )}
            {(property.bathrooms ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" /> {property.bathrooms} Baths
              </span>
            )}
            {(property.size ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" /> {property.size}m²
              </span>
            )}
          </div>
        </div>

        {/* Action Controls for Realtor */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-3 gap-2">
          <Link
            href={`/properties/${property.id}`}
            target="_blank"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View Public Page"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/realtor/listings/edit/${property.id}`}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Listing"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(property.id)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Listing"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* List Row Component for Table/List View */
function RealtorPropertyListRow({
  property,
  onDelete,
}: {
  property: Property;
  onDelete: (id: string) => void;
}) {
  const primaryImage = property.images?.[0] || '/placeholder-house.jpg';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="w-full sm:w-40 aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
          <span>{property.district}, Kigali</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 uppercase font-semibold text-[10px]">
            {property.listing_type}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{property.title}</h3>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
          {(property.bedrooms ?? 0) > 0 && <span>{property.bedrooms} Beds</span>}
          {(property.bathrooms ?? 0) > 0 && <span>{property.bathrooms} Baths</span>}
          {(property.size ?? 0) > 0 && <span>{property.size}m²</span>}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0">
        <div className="text-base font-bold text-emerald-400">
          {formatPriceShort(property.price, property.currency)}
        </div>

        <div className="flex items-center gap-1 mt-2">
          <Link
            href={`/properties/${property.id}`}
            target="_blank"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/realtor/listings/edit/${property.id}`}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(property.id)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 dark:text-slate-400">Loading...</div>}>
      <RealtorListingsContent />
    </Suspense>
  );
}