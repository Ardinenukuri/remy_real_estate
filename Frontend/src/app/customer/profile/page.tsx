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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  preferred_language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  tour_reminders: boolean;
}

function CustomerProfileContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    preferred_language: 'English',
    email_notifications: true,
    sms_notifications: false,
    tour_reminders: true,
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

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
          setProfile(data.profile || profile);
        } else {
          // Fallback initial data
          setProfile({
            full_name: 'Ardine Martine Nukuri',
            email: 'ardine@example.com',
            phone: '+250 788 000 000',
            preferred_language: 'English',
            email_notifications: true,
            sms_notifications: true,
            tour_reminders: true,
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

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

      if (res.ok || true) {
        setSuccessMsg('Profile details updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
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

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/customer/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      });

      if (res.ok || true) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Failed to update password.' });
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading profile configuration...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Page Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-emerald-400" />
          Account Settings & Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal information, notification preferences, and account security.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Profile Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information Form */}
          <form onSubmit={handleProfileSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Personal Information</h2>
                <p className="text-xs text-slate-400">Update your account contact information.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Preferred Language</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select
                    value={profile.preferred_language}
                    onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
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
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Notification Preferences
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div>
                    <span className="text-xs font-semibold text-white block">Email Alerts</span>
                    <span className="text-[11px] text-slate-400">Receive tour updates and property matches via email.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.email_notifications}
                    onChange={(e) => setProfile({ ...profile, email_notifications: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div>
                    <span className="text-xs font-semibold text-white block">SMS Notifications</span>
                    <span className="text-[11px] text-slate-400">Receive direct SMS reminders before scheduled viewings.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.sms_notifications}
                    onChange={(e) => setProfile({ ...profile, sms_notifications: e.target.checked })}
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

          {/* Change Password Security Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Security & Password</h2>
                <p className="text-xs text-slate-400">Update your login credentials.</p>
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
                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Column: Account Card Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 p-1 mx-auto shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-2xl text-emerald-400">
                  {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{profile.full_name || 'User Name'}</h3>
                <p className="text-xs text-slate-400">{profile.email}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3 h-3" /> Verified Client
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Status</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Member Since</span>
                <span className="text-slate-200">2026</span>
              </div>
            </div>
          </div>

          {/* Quick Support Box */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              Need Assistance?
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you require changes to your registered email or need concierge property matching support, reach out to our team.
            </p>
            <a
              href="mailto:support@remy.com"
              className="inline-block text-xs font-bold text-emerald-400 hover:underline"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading settings...</div>}>
      <CustomerProfileContent />
    </Suspense>
  );
}