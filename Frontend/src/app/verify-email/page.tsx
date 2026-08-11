'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Home as HouseIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing verification token. Please check your verification link.');
      return;
    }

    const verifyEmailToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        const response = await fetch(`${apiUrl}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed or token has expired.');
        }

        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'An unexpected error occurred during verification.');
      }
    };

    verifyEmailToken();
  }, [token]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {status === 'loading' && (
        <div className="text-center py-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)] flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--navy)]">
            Verifying Your Email...
          </h2>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            Please wait while we confirm your email address and activate your account.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[var(--emerald)]" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--navy)]">
            Email Verified Successfully!
          </h2>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            Your account is now fully activated. You can sign in and start exploring properties.
          </p>

          <div className="pt-2">
            <Link
              href="/signin"
              className="w-full py-3 bg-[var(--emerald)] hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--navy)]">
            Verification Failed
          </h2>
          <p className="text-slate-600 text-xs max-w-xs mx-auto leading-relaxed">
            {errorMessage}
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/signin"
              className="w-full py-3 bg-[var(--navy)] hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow"
            >
              Return to Sign In
            </Link>
            <Link
              href="/register"
              className="w-full py-2.5 text-slate-600 hover:text-[var(--navy)] text-xs font-semibold rounded-xl text-center"
            >
              Need a new account? Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
        </div>

        {/* Suspense Wrapper for Next.js SearchParams handling */}
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--emerald)]" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}