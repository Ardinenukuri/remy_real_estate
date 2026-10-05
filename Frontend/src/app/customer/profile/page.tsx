'use client';

import { useEffect, useState, Suspense } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Bell,
  Save,
  Check,
  Shield,
  KeyRound,
  Sparkles,
  Star,
  MessageSquarePlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarUploader } from '@/components/AvatarUploader';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  preferred_language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  tour_reminders: boolean;
  avatar_url?: string;
}

function CustomerProfileContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    preferred_language: 'English',
    email_notifications: true,
    sms_notifications: false,
    tour_reminders: true,
    avatar_url: '',
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const [testimonialContent, setTestimonialContent] = useState('');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');

        const res = await fetch('/api/customer/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const p = data.profile || data;
          setProfile({
            full_name: p.full_name || '',
            email: p.email || '',
            phone: p.phone || '',
            preferred_language: p.preferred_language || 'English',
            email_notifications: p.email_notifications ?? true,
            sms_notifications: p.sms_notifications ?? false,
            tour_reminders: p.tour_reminders ?? true,
            avatar_url: p.avatar_url || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const syncSessionUser = (updates: { full_name?: string; email?: string; avatar_url?: string }) => {
    try {
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : {};
      if (updates.avatar_url !== undefined) user.avatarUrl = updates.avatar_url;
      if (updates.full_name) user.full_name = updates.full_name;
      if (updates.email) user.email = updates.email;
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err) {
      console.error('Failed to sync session user:', err);
    }
  };

  const handleAvatarUpdate = async (newUrl: string) => {
    setProfile((prev) => ({ ...prev, avatar_url: newUrl }));

    // Skip the instant base64 preview fired before the upload completes -
    // only persist once we have the real, permanent uploaded file URL.
    if (newUrl.startsWith('data:')) return;

    syncSessionUser({ avatar_url: newUrl });

    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url: newUrl }),
      });
    } catch (err) {
      console.error('Failed to save avatar:', err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to update profile. Please try again.');
      }

      const p = data?.profile || data;
      setProfile((prev) => ({
        ...prev,
        full_name: p?.full_name ?? prev.full_name,
        email: p?.email ?? prev.email,
        phone: p?.phone ?? prev.phone,
        preferred_language: p?.preferred_language ?? prev.preferred_language,
        email_notifications: p?.email_notifications ?? prev.email_notifications,
        sms_notifications: p?.sms_notifications ?? prev.sms_notifications,
        tour_reminders: p?.tour_reminders ?? prev.tour_reminders,
      }));
      syncSessionUser({
        full_name: p?.full_name || profile.full_name,
        email: p?.email || profile.email,
        avatar_url: profile.avatar_url,
      });

      setSuccessMsg('Profile details and avatar updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwords.new_password.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
    setPasswords({ current_password: '', new_password: '', confirm_password: '' });
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialContent.trim()) return;

    setSubmittingTestimonial(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/customer/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: testimonialContent.trim(), rating: testimonialRating }),
      });

      if (res.ok) {
        setTestimonialSubmitted(true);
        setTestimonialContent('');
        setTestimonialRating(5);
      }
    } catch (err) {
      console.error('Failed to submit testimonial:', err);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500 dark:text-slate-400">Loading profile configuration...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Page Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-emerald-400" />
          Account Settings & Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal information, profile photo, and security preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Profile Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information Form */}
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Information</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your account contact information and profile picture.</p>
              </div>
            </div>

            {/* Profile Avatar Upload */}
            <div className="text-center pb-2">
              <AvatarUploader
                currentUrl={profile.avatar_url}
                onAvatarChange={handleAvatarUpdate}
                name={profile.full_name}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Click camera icon to upload profile photo</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Preferred Language</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
                  <select
                    value={profile.preferred_language}
                    onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="Kirundi">Kirundi</option>
                    <option value="Kinyarwanda">Kinyarwanda</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications Preferences */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Notification Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">Email Alerts</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive tour updates and property matches via email.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.email_notifications}
                    onChange={(e) => setProfile({ ...profile, email_notifications: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Password Security Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your login credentials.</p>
              </div>
            </div>

            {passwordMsg.text && (
              <div
                className={cn(
                  'p-3 rounded-xl text-xs font-semibold',
                  passwordMsg.type === 'error'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                )}
              >
                {passwordMsg.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Column: Account Card Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 p-0.5 mx-auto shadow-lg shadow-emerald-500/20 bg-slate-100 dark:bg-slate-950">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center font-bold text-2xl text-emerald-400">
                    {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{profile.full_name || 'User Name'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3 h-3" /> Verified Client
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Account Status</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Member Since</span>
                <span className="text-slate-700 dark:text-slate-200">2026</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              Need Assistance?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If you require changes to your registered email or need concierge property matching support, reach out to our team.
            </p>
            <a
              href="mailto:support@remy.com"
              className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Contact Support →
            </a>
          </div>

          {/* Share a Testimonial */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
              Share Your Experience
            </div>

            {testimonialSubmitted ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4" /> Thank you!
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-normal">
                  Your testimonial was submitted and is awaiting review by our team before it appears on the site.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTestimonialSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tell other buyers and renters about your experience with Remy Real Estates. Approved stories are featured on our homepage.
                </p>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestimonialRating(star)}
                      className="p-0.5"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={cn(
                          'w-5 h-5 transition-colors',
                          star <= testimonialRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                        )}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Share a few sentences about your experience..."
                  value={testimonialContent}
                  onChange={(e) => setTestimonialContent(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />

                <button
                  type="submit"
                  disabled={submittingTestimonial || !testimonialContent.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {submittingTestimonial ? 'Submitting...' : 'Submit Testimonial'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400">Loading settings...</div>}>
      <CustomerProfileContent />
    </Suspense>
  );
}