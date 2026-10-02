'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Home as HouseIcon,
  Lock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!token) {
      setErrorMessage('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--navy)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
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
              <span className="text-slate-900 dark:text-white font-bold text-base tracking-wide">Remy</span>
              <span className="text-[var(--emerald)] text-[11px] font-medium tracking-widest uppercase">
                Real Estates
              </span>
            </div>
          </Link>

          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">Create New Password</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enter your new password below to regain access to your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--navy)] dark:text-white">Password Reset Complete</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Your password has been successfully updated. You can now log in with your new credentials.
              </p>

              <div className="pt-2">
                <Link
                  href="/signin"
                  className="w-full py-3 bg-[var(--emerald)] hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow"
                >
                  Go to Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2.5 text-red-700 dark:text-red-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
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
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[var(--navy)]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}