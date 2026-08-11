'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  User,
  Mail,
  Phone,
  Plus,
  X,
  MapPin,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyRef {
  id: string;
  title: string;
  district?: string;
  price?: number;
}

interface Appointment {
  id: string;
  property_id: string;
  property?: PropertyRef;
  client_name: string;
  client_email: string;
  client_phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

function RealtorAppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // New Appointment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    date: '',
    time: '',
    notes: '',
  });

  // Load Appointments via API
  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;

        const params = new URLSearchParams();
        if (user?.id) params.set('realtor_id', user.id);

        const res = await fetch(`/api/appointments?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load appointments.');
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.appointments || [];
        setAppointments(list);

        if (list.length > 0) {
          setSelectedAppointment(list[0]);
        }
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'Could not fetch scheduled appointments.');
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  // Filtered Appointments List
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.client_name.toLowerCase().includes(query) ||
        item.client_email.toLowerCase().includes(query) ||
        (item.property?.title && item.property.title.toLowerCase().includes(query)) ||
        item.date.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    return { total, pending, confirmed, completed };
  }, [appointments]);

  // Handle Status Change
  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedAppointment?.id === id) {
          setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  };

  // Create Appointment Submission
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newAppt = await res.json();
        setAppointments((prev) => [newAppt, ...prev]);
        setSelectedAppointment(newAppt);
        setIsModalOpen(false);
        setFormData({
          property_id: '',
          client_name: '',
          client_email: '',
          client_phone: '',
          date: '',
          time: '',
          notes: '',
        });
      } else {
        alert('Failed to schedule appointment. Please check inputs.');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            Property Viewing Appointments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track and manage scheduled client property tours and meetings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Viewing
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400">Total Bookings</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            <div className="text-xs text-slate-400">Awaiting Confirmation</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.confirmed}</div>
            <div className="text-xs text-slate-400">Confirmed</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
            <div className="text-xs text-slate-400">Completed Tours</div>
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
            placeholder="Search by client, property, or date..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
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

      {/* Main Grid View */}
      {loading ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading scheduled appointments...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No Appointments Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No appointments match your active filter criteria.'
              : 'You do not have any property viewings scheduled.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Appointment List Column */}
          <div className="lg:col-span-5 space-y-3">
            {filteredAppointments.map((appt) => {
              const isSelected = selectedAppointment?.id === appt.id;

              return (
                <div
                  key={appt.id}
                  onClick={() => setSelectedAppointment(appt)}
                  className={cn(
                    'p-4 rounded-2xl border cursor-pointer transition-all space-y-3',
                    isSelected
                      ? 'bg-slate-800/80 border-emerald-500 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {appt.client_name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                        appt.status === 'pending' &&
                          'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        appt.status === 'confirmed' &&
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        appt.status === 'completed' &&
                          'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        appt.status === 'cancelled' &&
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      )}
                    >
                      {appt.status}
                    </span>
                  </div>

                  {appt.property?.title && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-emerald-400/70" />
                      <span className="truncate">{appt.property.title}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                      {appt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {appt.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed View Pane */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 sticky top-6">
            {selectedAppointment ? (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedAppointment.client_name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <a
                          href={`mailto:${selectedAppointment.client_email}`}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {selectedAppointment.client_email}
                        </a>
                      </span>
                      {selectedAppointment.client_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <a
                            href={`tel:${selectedAppointment.client_phone}`}
                            className="hover:text-emerald-400 transition-colors"
                          >
                            {selectedAppointment.client_phone}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>

                  <select
                    value={selectedAppointment.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        selectedAppointment.id,
                        e.target.value as Appointment['status']
                      )
                    }
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pending">Status: Pending</option>
                    <option value="confirmed">Status: Confirmed</option>
                    <option value="completed">Status: Completed</option>
                    <option value="cancelled">Status: Cancelled</option>
                  </select>
                </div>

                {/* Property & Schedule Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Tour Location
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {selectedAppointment.property?.title || 'General Consultation'}
                    </p>
                    {selectedAppointment.property?.district && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {selectedAppointment.property.district}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Scheduled Time
                    </span>
                    <p className="text-sm font-semibold text-emerald-400">
                      {selectedAppointment.date} at {selectedAppointment.time}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Client Request
                    </p>
                  </div>
                </div>

                {/* Client Notes */}
                {selectedAppointment.notes && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400">
                      Additional Client Notes
                    </span>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedAppointment.notes}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-slate-500 text-sm">
                Select an appointment to inspect viewing details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Schedule New Property Viewing</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Property ID / Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. prop_123"
                  value={formData.property_id}
                  onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Client Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@example.com"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Client Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+257 ..."
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notes / Special Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes regarding access or client requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  {submitting ? 'Scheduling...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RealtorAppointmentsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading appointments...</div>}>
      <RealtorAppointmentsContent />
    </Suspense>
  );
}