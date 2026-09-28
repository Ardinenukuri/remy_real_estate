'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Award, Users, Building2, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-[var(--navy)] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">About Us</span>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider mb-4">
              Our Vision & Story
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white text-balance mb-4">
              Redefining Real Estate in Rwanda
            </h1>
            <p className="text-white/70 leading-relaxed text-base">
              Remy Real Estates was founded with a singular mission: to bring absolute transparency, trust, and speed to property discovery, rental, and sales across Rwanda.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Mission & Image Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-heading text-3xl font-bold text-[var(--navy)] dark:text-white">
              Building Rwanda's Most Trusted Property Marketplace
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Before Remy Real Estates, property seekers in Rwanda faced unverified listings, hidden fees, and unreliable brokers. We changed the industry by implementing rigorous manual verification for every property parcel and house listed.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Today, we connect thousands of home buyers, renters, corporate clients, and international investors directly with certified local realtors.
            </p>

            <div className="space-y-3 pt-2">
              {[
                '100% Manually Screened & Verified Land Parcels & Homes',
                'Direct Connection to Licensed & Certified Rwandan Realtors',
                'Transparent Pricing with Zero Hidden Brokerage Fees',
                'Seamless Digital Viewing Appointments & Virtual Tours',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-semibold text-[var(--navy)] dark:text-white">
                  <CheckCircle2 className="w-5 h-5 text-[var(--emerald)] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Remy Real Estates Property"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Core Values Stats Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--emerald)] flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--navy)] dark:text-white">1,200+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Properties</div>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--navy)] dark:text-white">850+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Satisfied Clients</div>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--navy)] dark:text-white">120+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Certified Realtors</div>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--navy)] dark:text-white">98%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
