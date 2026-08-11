'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  User,
  Send,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyRef {
  id: string;
  title: string;
  district?: string;
  price?: number;
  currency?: string;
}

interface Inquiry {
  id: string;
  property_id: string;
  property?: PropertyRef;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

function RealtorInquiriesContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'closed'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Reply Form State inside modal/panel
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Load Inquiries via REST API
  useEffect(() => {
    async function loadInquiries() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;

        const params = new URLSearchParams();
        if (user?.id) params.set('realtor_id', user.id);

        const res = await fetch(`/api/inquiries?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load inquiries.');
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.inquiries || [];
        setInquiries(list);

        if (list.length > 0) {
          setSelectedInquiry(list[0]);
        }
      } catch (err: any) {
        console.error('Error fetching inquiries:', err);
        setError(err.message || 'Could not fetch customer inquiries.');
      } finally {
        setLoading(false);
      }
    }

    loadInquiries();
  }, []);

  // Filtered List Computation
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        (item.property?.title && item.property.title.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [inquiries, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => i.status === 'pending').length;
    const contacted = inquiries.filter((i) => i.status === 'contacted').length;
    const closed = inquiries.filter((i) => i.status === 'closed').length;
    return { total, pending, contacted, closed };
  }, [inquiries]);

  // Handle Status Update
  const handleUpdateStatus = async (inquiryId: string, newStatus: Inquiry['status']) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle Delete Inquiry
  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const remaining = inquiries.filter((i) => i.id !== inquiryId);
        setInquiries(remaining);
        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry(remaining[0] || null);
        }
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  // Handle Reply Submit
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (res.ok) {
        // Automatically set status to contacted on reply
        await handleUpdateStatus(selectedInquiry.id, 'contacted');
        setReplyMessage('');
        alert('Reply sent successfully!');
      } else {
        alert('Failed to send reply. Please try again.');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            Property Inquiries
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage inquiries and direct lead communications from your property listings.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400">Total Leads</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            <div className="text-xs text-slate-400">Pending Review</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.contacted}</div>
            <div className="text-xs text-slate-400">Contacted</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-800 text-slate-500">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-400">{stats.closed}</div>
            <div className="text-xs text-slate-400">Closed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, or listing..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          {(['all', 'pending', 'contacted', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all shrink-0',
                statusFilter === st
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Master/Detail Split View */}
      {loading ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading client inquiries...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No Inquiries Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No property inquiries match your current search or filter rules.'
              : 'You have not received any property inquiries yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inquiry List Column */}
          <div className="lg:col-span-5 space-y-3">
            {filteredInquiries.map((inquiry) => {
              const isSelected = selectedInquiry?.id === inquiry.id;

              return (
                <div
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
                  className={cn(
                    'p-4 rounded-2xl border cursor-pointer transition-all space-y-3 relative',
                    isSelected
                      ? 'bg-slate-800/80 border-emerald-500 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white text-sm truncate">
                      {inquiry.name}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                        inquiry.status === 'pending' &&
                          'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        inquiry.status === 'contacted' &&
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        inquiry.status === 'closed' &&
                          'bg-slate-800 text-slate-400 border-slate-700'
                      )}
                    >
                      {inquiry.status}
                    </span>
                  </div>

                  {inquiry.property?.title && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-emerald-400/70" />
                      <span className="truncate">{inquiry.property.title}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2">{inquiry.message}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Inquiry Detail View Column */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 sticky top-6">
            {selectedInquiry ? (
              <>
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedInquiry.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <a
                          href={`mailto:${selectedInquiry.email}`}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {selectedInquiry.email}
                        </a>
                      </span>
                      {selectedInquiry.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <a
                            href={`tel:${selectedInquiry.phone}`}
                            className="hover:text-emerald-400 transition-colors"
                          >
                            {selectedInquiry.phone}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) =>
                        handleUpdateStatus(
                          selectedInquiry.id,
                          e.target.value as Inquiry['status']
                        )
                      }
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="pending">Status: Pending</option>
                      <option value="contacted">Status: Contacted</option>
                      <option value="closed">Status: Closed</option>
                    </select>

                    <button
                      onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Listing Reference */}
                {selectedInquiry.property && (
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Inquired Property
                    </span>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        {selectedInquiry.property.title}
                      </h4>
                      {selectedInquiry.property.district && (
                        <span className="text-xs text-slate-400">
                          {selectedInquiry.property.district}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Client Message
                  </span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Quick Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-400">
                    Send Direct Email Reply
                  </label>
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Write your response to ${selectedInquiry.name}...`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-16 text-center text-slate-500 text-sm">
                Select an inquiry from the list to view full client details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RealtorInquiriesPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading inquiries...</div>}>
      <RealtorInquiriesContent />
    </Suspense>
  );
}