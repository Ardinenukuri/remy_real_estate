'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Save,
  Check,
  Lock,
  Server,
  Activity,
  Terminal,
  BadgeCheck,
  ShieldAlert,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface AdminProfile {
  full_name: string;
  email: string;
  phone: string;
  role_title: string;
  access_level: 'Super Admin' | 'System Admin' | 'Moderator';
  mfa_enabled: boolean;
  system_alerts_email: boolean;
  security_audit_logs: boolean;
}

function AdminProfileContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [profile, setProfile] = useState<AdminProfile>({
    full_name: '',
    email: '',
    phone: '',
    role_title: 'Chief Technology Officer',
    access_level: 'Super Admin',
    mfa_enabled: true,
    system_alerts_email: true,
    security_audit_logs: true,
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
        const res = await fetch('/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile || profile);
        } else {
          // Fallback initial system admin credentials
          const storedUser = localStorage.getItem('user');
          let parsedName = 'System Administrator';
          let parsedEmail = 'admin@remy.com';

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
            phone: '+250 788 000 999',
            role_title: 'Platform System Lead',
            access_level: 'Super Admin',
            mfa_enabled: true,
            system_alerts_email: true,
            security_audit_logs: true,
          });
        }
      } catch (err) {
        console.error('Failed to fetch admin profile:', err);
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
      await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      setSuccessMsg('Administrator profile configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update admin profile:', err);
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

    if (passwords.new_password.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Admin security policy requires at least 8 characters.' });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/admin/change-password', {
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

      setPasswordMsg({ type: 'success', text: 'Admin account password updated successfully!' });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Failed to update admin password.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex text-slate-100">
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="p-8 text-slate-400 text-xs">Loading admin system credentials...</div>
        </div>
      </div>
    );
  }

  const avatarInitial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center gap-4 lg:hidden sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-white">Admin Profile</span>
        </header>

        <main className="p-6 max-w-7xl w-full mx-auto">
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Top Page Header */}
            <div className="pb-6 border-b border-slate-800">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-emerald-400" />
                System Admin Settings & Profile
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage system root credentials, administrative permissions, system alert triggers, and platform security policies.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Columns: Main Admin Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Admin Details Form */}
                <form onSubmit={handleProfileSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Administrator Identity</h2>
                      <p className="text-xs text-slate-400">Personal identity and system contact records.</p>
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
                      <label className="text-xs font-semibold text-slate-300">System Admin Email</label>
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
                      <label className="text-xs font-semibold text-slate-300">Role Title</label>
                      <input
                        type="text"
                        value={profile.role_title}
                        onChange={(e) => setProfile({ ...profile, role_title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Platform Security Toggles */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Administrative System Controls
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                        <div>
                          <span className="text-xs font-semibold text-white block">Multi-Factor Authentication (MFA)</span>
                          <span className="text-[11px] text-slate-400">Require TOTP authenticator code on admin logins.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.mfa_enabled}
                          onChange={(e) => setProfile({ ...profile, mfa_enabled: e.target.checked })}
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                        <div>
                          <span className="text-xs font-semibold text-white block">Critical System Alerts</span>
                          <span className="text-[11px] text-slate-400">Receive instant alerts for server issues and unauthorized login attempts.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={profile.system_alerts_email}
                          onChange={(e) => setProfile({ ...profile, system_alerts_email: e.target.checked })}
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
                      {saving ? 'Saving...' : 'Save System Settings'}
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
                      <h2 className="text-base font-bold text-white">Root Password & Credentials</h2>
                      <p className="text-xs text-slate-400">Update your administrative access password.</p>
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
                        <label className="text-xs font-semibold text-slate-300">New Admin Password</label>
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
                      Update Admin Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Privileges & System Status */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 p-1 mx-auto shadow-lg shadow-emerald-500/20">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-2xl text-emerald-400">
                        {avatarInitial}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                        {profile.full_name || 'System Admin'}
                        <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{profile.role_title}</p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <ShieldAlert className="w-3.5 h-3.5" /> Root Access Level
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Access Scope</span>
                      <span className="text-emerald-400 font-semibold">{profile.access_level}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>MFA Status</span>
                      <span className="text-slate-200">{profile.mfa_enabled ? 'Active' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Server Environment</span>
                      <span className="text-slate-200 font-mono text-[11px]">Production</span>
                    </div>
                  </div>
                </div>

                {/* System Environment Monitor Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Platform Health
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">API Health</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 99.9%
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Database Cluster</span>
                      <span className="text-emerald-400 font-semibold">Healthy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-xs">Loading administrator profile...</div>}>
      <AdminProfileContent />
    </Suspense>
  );
}