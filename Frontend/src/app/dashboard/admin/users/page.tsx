'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Loader2,
  Building,
  Phone,
  Clock,
} from 'lucide-react';
import type { Profile } from '@/types';
import AdminSidebar from '@/components/admin/AdminSidebar';

function formatDate(value: string | Date | number | null | undefined): string {
  if (!value) return 'Unknown date';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'customer' | 'realtor' | 'admin' | 'pending' | 'banned'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Helper to attach authorization header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  // 1. Fetch Users via REST API
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ filter });
      const response = await fetch(`/api/users?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      } else {
        console.error('Failed to fetch users:', response.statusText);
      }
    } catch (err) {
      console.error('Unexpected error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Safe search filtering
  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase().trim();
    const nameMatch = u.full_name ? u.full_name.toLowerCase().includes(query) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(query) : false;
    return nameMatch || emailMatch;
  });

  // 2. Toggle Realtor Verification Status via PATCH/PUT API
  const toggleVerification = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/users/${id}/verify`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_verified: !currentStatus }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_verified: !currentStatus } : u))
        );
      } else {
        console.error('Verification update failed');
      }
    } catch (err) {
      console.error('Error toggling verification:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Update User Role via PATCH/PUT API
  const updateRole = async (id: string, newRole: Profile['role']) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
        );
      } else {
        console.error('Role update failed');
      }
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. Ban / Unban User
  const toggleBan = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/users/${id}/ban`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_banned: !currentStatus }),
      });

      if (response.ok) {
        const payload = await response.json();
        const nextUser = payload?.user ?? payload;
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_banned: Boolean(nextUser?.is_banned ?? !currentStatus) } : u))
        );
      } else {
        console.error('Ban update failed');
      }
    } catch (err) {
      console.error('Error toggling ban:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white">
              User Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage system accounts, assign roles, and verify realtor credentials.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {(['all', 'customer', 'realtor', 'admin', 'pending', 'banned'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${
                    filter === f
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {f === 'pending' ? 'Pending Realtors' : f === 'banned' ? 'Banned' : f}
                </button>
              ))}
            </div>
          </div>

          {/* User Cards List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-950 border border-slate-800 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs text-slate-400">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Users Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No registered accounts match your current search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => {
                const isPendingRealtor = u.role === 'realtor' && !u.is_verified;

                return (
                  <div
                    key={u.id}
                    className={`bg-slate-950 border rounded-2xl p-5 transition-all ${
                      isPendingRealtor
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left Side Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base shrink-0">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-white truncate">
                              {u.full_name || 'Unnamed User'}
                            </h3>
                            {u.is_verified && u.role === 'realtor' && (
                              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : u.role === 'realtor'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              {u.email}
                            </span>
                            {u.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                {u.phone}
                              </span>
                            )}
                            {u.company && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-slate-500" />
                                {u.company}
                              </span>
                            )}
                            {u.created_at && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                Joined {formatDate(u.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                        {u.role === 'realtor' && (
                          <button
                            disabled={updatingId === u.id}
                            onClick={() => toggleVerification(u.id, Boolean(u.is_verified))}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                              Boolean(u.is_verified)
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                            }`}
                          >
                            {updatingId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : Boolean(u.is_verified) ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Verify Realtor</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          disabled={updatingId === u.id}
                          onClick={() => toggleBan(u.id, Boolean(u.is_banned))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                            u.is_banned
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {updatingId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : u.is_banned ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Unban</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Ban</span>
                            </>
                          )}
                        </button>

                        <select
                          disabled={updatingId === u.id}
                          value={u.role}
                          onChange={(e) =>
                            updateRole(u.id, e.target.value as Profile['role'])
                          }
                          className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
                        >
                          <option value="customer">Customer</option>
                          <option value="realtor">Realtor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}