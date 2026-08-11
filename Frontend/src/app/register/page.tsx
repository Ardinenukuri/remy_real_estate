'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home as HouseIcon,
  User,
  BadgeCheck,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<'customer' | 'realtor'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Front-end Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('You must accept the Terms of Service to proceed.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      // Store JWT token if backend auto-logs in user on register
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-[var(--emerald)] rounded-xl flex items-center justify-center shadow-lg">
              <HouseIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-white font-bold tracking-wide">Remy</span>
              <span className="text-[var(--emerald)] text-[10px] font-medium tracking-widest uppercase">
                Real Estates
              </span>
            </div>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Create Your Account</h1>
          <p className="text-white/50 text-sm">Join Rwanda's most trusted real estate platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[var(--emerald)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-[var(--navy)]">Account Created!</h2>
              <p className="text-slate-600 text-sm max-w-xs mx-auto">
                {role === 'realtor'
                  ? 'Your realtor account application has been submitted for admin verification. You can now access your realtor portal.'
                  : 'Welcome to Remy Real Estates! Your account is active.'}
              </p>
              <div className="pt-2">
                <Link
                  href={role === 'realtor' ? '/dashboard/realtor' : '/dashboard/customer'}
                  className="inline-block px-6 py-3 bg-[var(--emerald)] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-emerald-600 transition-colors"
                >
                  Access Your Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Role Toggle */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    role === 'customer'
                      ? 'bg-[var(--navy)] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[var(--navy)]'
                  }`}
                >
                  <User className="w-4 h-4" /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('realtor')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    role === 'realtor'
                      ? 'bg-[var(--navy)] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[var(--navy)]'
                  }`}
                >
                  <BadgeCheck className="w-4 h-4" /> Realtor / Agent
                </button>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="firstName">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="firstName"
                        type="text"
                        required
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="reg-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="reg-phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="+250 7XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Show password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30 focus:border-[var(--emerald)]"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    required
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-[var(--emerald)]"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a className="text-[var(--emerald)] hover:underline" href="#">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a className="text-[var(--emerald)] hover:underline" href="#">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[var(--emerald)] hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-5">
                Already have an account?{' '}
                <Link className="text-[var(--emerald)] font-semibold hover:underline" href="/signin">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}