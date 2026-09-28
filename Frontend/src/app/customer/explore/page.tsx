'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Calendar,
  Building2,
  Loader2,
  Grid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExploreProperty {
  id: string;
  title: string;
  district: string;
  address: string;
  price: number;
  type: 'sale' | 'rent';
  beds: number;
  baths: number;
  area_sqm: number;
  image_url: string;
  is_saved: boolean;
}

function ExplorePropertiesContent() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<ExploreProperty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const [propsRes, savedRes] = await Promise.all([
          fetch('/api/properties', {
            headers: { Authorization: token ? `Bearer ${token}` : '' },
          }),
          fetch('/api/customer/saved-properties', {
            headers: { Authorization: token ? `Bearer ${token}` : '' },
          }),
        ]);

        if (propsRes.ok) {
          const data = await propsRes.json();
          const list = Array.isArray(data) ? data : data.properties || [];

          let savedIds = new Set<string>();
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            savedIds = new Set((savedData.properties || []).map((s: any) => s.id));
          }

          const formatted: ExploreProperty[] = list.map((p: any) => ({
            id: p.id,
            title: p.title,
            district: p.district || p.address || 'Kigali',
            address: p.address || p.district || 'Kigali',
            price: Number(p.price || 0),
            type: p.listing_type === 'rent' ? 'rent' : 'sale',
            beds: p.bedrooms || 0,
            baths: p.bathrooms || 0,
            area_sqm: p.size || p.area_sqm || 0,
            image_url: p.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
            is_saved: savedIds.has(p.id),
          }));
          setProperties(formatted);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to fetch database properties:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const handleToggleSave = async (p: ExploreProperty, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wasSaved = p.is_saved;
    setProperties((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, is_saved: !item.is_saved } : item))
    );

    try {
      const token = localStorage.getItem('accessToken');
      if (wasSaved) {
        await fetch(`/api/customer/saved-properties?id=${p.id}`, {
          method: 'DELETE',
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
      } else {
        await fetch('/api/customer/saved-properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ property_id: p.id }),
        });
      }
    } catch (err) {
      console.error('Failed to toggle saved property:', err);
      setProperties((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_saved: wasSaved } : item))
      );
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || p.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Explore Database Properties
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse live verified listings from the database, save your favorites, and schedule viewings.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search database properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                filterType === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-white'
              )}
            >
              All ({properties.length})
            </button>
            <button
              onClick={() => setFilterType('sale')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                filterType === 'sale' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-white'
              )}
            >
              For Sale
            </button>
            <button
              onClick={() => setFilterType('rent')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                filterType === 'rent' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-white'
              )}
            >
              For Rent
            </button>
          </div>

          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg text-slate-500 dark:text-slate-400',
                viewMode === 'grid' && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
              )}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg text-slate-500 dark:text-slate-400',
                viewMode === 'list' && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
              )}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading database listings...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-600 dark:text-slate-500">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Database Properties Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? 'No database listings match your search criteria.'
                : 'No property listings have been published in the database yet. Real estate agents can publish listings from the Realtor Dashboard.'}
            </p>
          </div>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className={cn(
                'group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col',
                viewMode === 'list' && 'md:flex-row md:items-center'
              )}
            >
              <div className={cn(
                'relative overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0',
                viewMode === 'grid' ? 'w-full h-48' : 'w-full md:w-64 h-48 md:h-40'
              )}>
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white shadow-md',
                    property.type === 'sale' ? 'bg-emerald-600' : 'bg-blue-600'
                  )}>
                    For {property.type === 'sale' ? 'Sale' : 'Rent'}
                  </span>
                </div>

                <button
                  onClick={(e) => handleToggleSave(property, e)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-md"
                  title={property.is_saved ? 'Remove from Saved' : 'Save Property'}
                >
                  <Heart className={cn('w-4 h-4', property.is_saved && 'fill-rose-400')} />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                      {property.district}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      RWF {property.price.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{property.address}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                    {property.beds} Beds
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                    {property.baths} Baths
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                    {property.area_sqm} m²
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/customer/property/${property.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePropertiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400">Loading properties...</div>}>
      <ExplorePropertiesContent />
    </Suspense>
  );
}