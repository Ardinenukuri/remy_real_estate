'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home as HouseIcon,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resolves target dashboard route based on user role
  const getDashboardPath = (role?: string) => {
    const normalizedRole = role?.toLowerCase() || '';

    switch (normalizedRole) {
      case 'admin':
        return '/dashboard/admin';
      case 'realtor':
        return '/dashboard/realtor';
      case 'customer':
      case 'client':
      default:
        return '/customer/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      // 1. Store credentials locally
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // 2. Determine target path and perform immediate redirection
      const targetPath = getDashboardPath(data.user?.role);
      router.push(targetPath);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--emerald)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-10 h-10 bg-[var(--emerald)] rounded-xl flex items-center justify-center shadow-lg">
              <HouseIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-white font-bold text-base tracking-wide">Remy</span>
              <span className="text-[var(--emerald)] text-[11px] font-medium tracking-widest uppercase">
                Real Estates
              </span>
            </div>
          </Link>

          <h1 className="font-heading text-3xl font-bold text-white">Sign In to Your Account</h1>
          <p className="mt-2 text-xs text-slate-400">
            Access your saved properties, active listings, and direct messages.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600" htmlFor="password">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs text-[var(--emerald)] font-medium hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--emerald)] hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
            Don't have an account yet?{' '}
            <Link href="/register" className="text-[var(--emerald)] font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}