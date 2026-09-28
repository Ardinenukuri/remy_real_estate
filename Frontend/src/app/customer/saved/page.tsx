'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Heart,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  ExternalLink,
  Trash2,
  Grid,
  List,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedPropertyItem {
  id: string;
  title: string;
  location: string;
  price: string | number;
  currency?: string;
  type?: string;
  image: string;
  saved_at: string;
}

function SavedPropertiesContent() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<SavedPropertyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSavedProperties() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/customer/saved-properties', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties || []);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to fetch saved properties:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedProperties();
  }, []);

  const handleRemoveSaved = async (id: string) => {
    setRemovingId(id);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/customer/saved-properties?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to unsave property:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const title = p.title || 'Property';
    const loc = p.location || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || (p.type && p.type.toLowerCase().includes(filterType));

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            Saved Properties
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep track of homes and commercial spaces you've bookmarked across the platform.
          </p>
        </div>

        <Link
          href="/customer/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all shrink-0 self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          Find More Properties
        </Link>
      </div>

      {/* Filter & Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search saved properties..."
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
              className={cn('p-1.5 rounded-lg text-slate-500 dark:text-slate-400', viewMode === 'grid' && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white')}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded-lg text-slate-500 dark:text-slate-400', viewMode === 'list' && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white')}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-72 animate-pulse p-4 space-y-4">
              <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-600 dark:text-slate-500">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No saved properties found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? 'No saved listings match your search query.'
                : "You haven't saved any listings to your account yet. Click the heart icon on any property to save it."}
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}
        >
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className={cn(
                'group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col',
                viewMode === 'list' && 'md:flex-row md:items-center'
              )}
            >
              <div
                className={cn(
                  'relative overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0',
                  viewMode === 'grid' ? 'w-full h-48' : 'w-full md:w-64 h-48 md:h-40'
                )}
              >
                <img
                  src={property.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleRemoveSaved(property.id)}
                  disabled={removingId === property.id}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md text-rose-500 hover:text-white hover:bg-rose-600 transition-all shadow-md"
                  title="Remove from Saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                      {property.location || 'Kigali'}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      RWF {Number(property.price || 0).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/customer/property/${property.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <span>View Property Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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

export default function SavedPropertiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400">Loading saved properties...</div>}>
      <SavedPropertiesContent />
    </Suspense>
  );
}