'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Star,
  Trash2,
  Loader2,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import type { Property, Profile } from '@/types';
import { timeAgo, formatPriceShort } from '@/lib/utils';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface PropertyStats {
  total: number;
  approved: number;
  pending: number;
  featured: number;
  totalViews: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminPropertiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats>({
    total: 0,
    approved: 0,
    pending: 0,
    featured: 0,
    totalViews: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'featured'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to attach authorization header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  // 1. Fetch Properties via REST API (server-side search + pagination)
  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        filter,
        search: debouncedSearch,
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      const response = await fetch(`/api/admin/properties?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data?.data || []);
        setPagination(
          data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
        );
      } else {
        console.error('Failed to fetch properties:', response.statusText);
      }
    } catch (err) {
      console.error('Unexpected error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch, pagination.page, pagination.limit]);

  // 2. Fetch Property Stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/properties/stats', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data || { total: 0, approved: 0, pending: 0, featured: 0, totalViews: 0 });
      }
    } catch (err) {
      console.error('Error loading property stats:', err);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 3. Toggle Approval Status
  const toggleApproval = async (id: string, currentStatus: boolean) => {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/properties/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_approved: !currentStatus }),
      });

      if (response.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_approved: !currentStatus } : p))
        );
        // Update stats
        setStats((prev) => ({
          ...prev,
          approved: prev.approved + (currentStatus ? -1 : 1),
          pending: prev.pending + (currentStatus ? 1 : -1),
        }));
      } else {
        console.error('Approval toggle failed');
      }
    } catch (err) {
      console.error('Error toggling approval:', err);
    } finally {
      setActionId(null);
    }
  };

  // 4. Toggle Featured Status
  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/properties/${id}/feature`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_featured: !currentStatus }),
      });

      if (response.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_featured: !currentStatus } : p))
        );
        setStats((prev) => ({
          ...prev,
          featured: prev.featured + (currentStatus ? -1 : 1),
        }));
      } else {
        console.error('Featured toggle failed');
      }
    } catch (err) {
      console.error('Error toggling featured:', err);
    } finally {
      setActionId(null);
    }
  };

  // 5. Delete Property Listing
  const deleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property listing?')) return;

    setActionId(id);
    try {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setStats((prev) => ({ ...prev, total: prev.total - 1 }));
        loadStats();
      } else {
        console.error('Delete property failed');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
    } finally {
      setActionId(null);
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
  };

  const statCards = [
    {
      label: 'Total Properties',
      value: stats.total,
      icon: LayoutGrid,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle2,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Featured',
      value: stats.featured,
      icon: Sparkles,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              Property Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Review, approve, feature, or remove property listings.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border ${card.bg} p-4 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.label}
                  </span>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <span className={`text-2xl font-extrabold ${card.color}`}>
                  {card.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search properties by title, city, or district..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'pending', 'approved', 'featured'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${
                    filter === f
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Properties List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading property listings...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-500 mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Properties Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                No listings match your current filter or search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {properties.map((p) => {
                  const realtor = p.realtor as Profile | null;
                  const isPending = !p.is_approved;

                  return (
                    <div
                      key={p.id}
                      className={`bg-slate-100 dark:bg-slate-950 border rounded-2xl p-5 transition-all ${
                        isPending
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Left: Property Info */}
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {p.title || 'Untitled Property'}
                              </h3>

                              {/* Badges */}
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  p.is_approved
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {p.is_approved ? 'Approved' : 'Pending'}
                              </span>

                              {p.is_featured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  <Star className="w-3 h-3 fill-amber-300" />
                                  Featured
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                              {p.district && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                                  {p.district}
                                </span>
                              )}
                              <span className="font-semibold text-emerald-400">
                                {formatPriceShort(p.price)}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
                                {realtor?.full_name || 'Unknown Realtor'}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {p.views ?? 0} views
                              </span>
                              {(() => {
                                const createdAtValue =
                                  p.created_at instanceof Date
                                    ? p.created_at.toISOString()
                                    : typeof p.created_at === 'string' || typeof p.created_at === 'number'
                                      ? String(p.created_at)
                                      : '';

                                return createdAtValue ? (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Created {timeAgo(createdAtValue)}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-200 dark:border-slate-800/80 pt-3 sm:pt-0">
                          {/* Approval Toggle Button */}
                          <button
                            disabled={actionId === p.id}
                            onClick={() => toggleApproval(p.id, Boolean(p.is_approved))}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                              p.is_approved
                                ? 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {actionId === p.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : p.is_approved ? (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Unpublish</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>

                          {/* Feature Toggle Button */}
                          <button
                            disabled={actionId === p.id}
                            onClick={() => toggleFeatured(p.id, Boolean(p.is_featured))}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                              p.is_featured
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${p.is_featured ? 'fill-amber-300' : ''}`} />
                            <span>{p.is_featured ? 'Unfeature' : 'Feature'}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            disabled={actionId === p.id}
                            onClick={() => deleteProperty(p.id)}
                            className="p-1.5 text-slate-600 dark:text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Delete Property"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing{' '}
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    -{' '}
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="text-slate-700 dark:text-slate-200 font-semibold">{pagination.total}</span>{' '}
                    properties
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.totalPages ||
                          Math.abs(page - pagination.page) <= 1
                      )
                      .map((page, idx, arr) => {
                        const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <span key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-1.5 text-slate-600 text-xs">...</span>
                            )}
                            <button
                              onClick={() => goToPage(page)}
                              className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${
                                pagination.page === page
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {page}
                            </button>
                          </span>
                        );
                      })}

                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}