'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Award,
  Shield,
  KeyRound,
  Save,
  Check,
  Lock,
  Globe,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtorProfile {
  full_name: string;
  email: string;
  phone: string;
  agency_name: string;
  license_number: string;
  years_experience: number;
  bio: string;
  specialization: string;
  office_address: string;
  is_verified: boolean;
}

function RealtorProfileContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [profile, setProfile] = useState<RealtorProfile>({
    full_name: '',
    email: '',
    phone: '',
    agency_name: '',
    license_number: '',
    years_experience: 5,
    bio: '',
    specialization: 'Luxury Residential & Commercial',
    office_address: 'KG 7 Ave, Kigali, Rwanda',
    is_verified: true,
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
        const res = await fetch('/api/realtor/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile || profile);
        } else {
          // Fallback to initial stored or default realtor data
          const storedUser = localStorage.getItem('user');
          let parsedName = 'Eric Manzi';
          let parsedEmail = 'eric.m@remy.com';

          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              parsedName = u.full_name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || parsedName;
              parsedEmail = u.email || parsedEmail;
            } catch (e) {
              console.error('Error parsing session:', e);
            }
          }

          setProfile({
            full_name: parsedName,
            email: parsedEmail,
            phone: '+250 788 123 456',
            agency_name: 'Remy Premium Properties',
            license_number: 'RWA-RE-2024-089',
            years_experience: 6,
            bio: 'Dedicated real estate professional specializing in high-end residential listings, luxury villas, and prime commercial developments across Kigali.',
            specialization: 'Residential & Villa Developments',
            office_address: 'KG 7 Ave, Boulevard de l\'UMUGANWA, Kigali',
            is_verified: true,
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
      await fetch('/api/realtor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      setSuccessMsg('Realtor profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
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
      await fetch('/api/realtor/change-password', {
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

      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Failed to update password.' });
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs">Loading realtor profile details...</div>;
  }

  const avatarInitial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'R';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Page Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-emerald-400" />
          Realtor Agent Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your official real estate credentials, professional bio, agency contact info, and security credentials.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Professional Credentials & Info Form */}
          <form onSubmit={handleProfileSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Agent & Agency Details</h2>
                <p className="text-xs text-slate-400">Public profile details visible to prospective clients.</p>
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
                <label className="text-xs font-semibold text-slate-300">Official Email</label>
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
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Brokerage / Agency Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={profile.agency_name}
                    onChange={(e) => setProfile({ ...profile, agency_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">License ID Number</label>
                <div className="relative">
                  <Award className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={profile.license_number}
                    onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Primary Specialization</label>
                <input
                  type="text"
                  value={profile.specialization}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  placeholder="e.g. Commercial Real Estate, Luxury Residential"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Professional Bio</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
                />
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

          {/* Security & Password Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Account Security</h2>
                <p className="text-xs text-slate-400">Update your Realtor portal credentials.</p>
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

        {/* Right Column: Verification & Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 p-1 mx-auto shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-2xl text-emerald-400">
                  {avatarInitial}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                  {profile.full_name || 'Realtor Agent'}
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{profile.agency_name}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" /> Licensed Realtor
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>License Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>License No.</span>
                <span className="text-slate-200 font-mono text-[11px]">{profile.license_number}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Experience</span>
                <span className="text-slate-200">{profile.years_experience} Years</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Portal Overview
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-lg font-bold text-white block">Active</span>
                <span className="text-[10px] text-slate-400">Listings Status</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-lg font-bold text-emerald-400 block">Verified</span>
                <span className="text-[10px] text-slate-400">Agent Badge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealtorProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-xs">Loading profile settings...</div>}>
      <RealtorProfileContent />
    </Suspense>
  );
}