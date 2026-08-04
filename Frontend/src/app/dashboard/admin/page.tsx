'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  BarChart3,
  LogOut,
  BadgeCheck,
} from 'lucide-react';

const PENDING_REALTORS = [
  {
    id: 'usr-1',
    name: 'Diane Kagame',
    email: 'diane@example.com',
    phone: '+250 788 004 004',
    specialty: 'Land & Development Consultant',
    registeredDate: 'August 3, 2026',
    status: 'Pending Verification',
  },
  {
    id: 'usr-2',
    name: 'Eric Hakizimana',
    email: 'eric@example.com',
    phone: '+250 788 555 123',
    specialty: 'Commercial Property Broker',
    registeredDate: 'August 4, 2026',
    status: 'Pending Verification',
  },
];

const PENDING_LISTINGS = [
  {
    id: 'prop-101',
    title: 'Modern Duplex in Gacuriro',
    realtorName: 'Jean-Paul Mugisha',
    location: 'Gacuriro, Kigali',
    price: '$195,000',
    type: 'House',
    submittedDate: 'August 4, 2026',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'realtors' | 'properties' | 'users'>('overview');
  const [realtorsList, setRealtorsList] = useState(PENDING_REALTORS);
  const [listingsList, setListingsList] = useState(PENDING_LISTINGS);

  const handleApproveRealtor = (id: string) => {
    setRealtorsList(realtorsList.filter((r) => r.id !== id));
  };

  const handleApproveListing = (id: string) => {
    setListingsList(listingsList.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      {/* Admin Header */}
      <div className="bg-[var(--navy)] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--emerald)] flex items-center justify-center font-bold text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold">Admin Command Center</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-[var(--emerald)] border border-[var(--emerald)]/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-white/60">Product Manager: Nukuri Ardine Martine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Registered Users</p>
              <p className="text-2xl font-bold text-[var(--navy)]">1,420</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Realtor Approvals</p>
              <p className="text-2xl font-bold text-amber-600">{realtorsList.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Property Approvals</p>
              <p className="text-2xl font-bold text-amber-600">{listingsList.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Listings Published</p>
              <p className="text-2xl font-bold text-[var(--emerald)]">1,200+</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--emerald)] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[var(--emerald)]" /> Overview & Metrics
            </button>

            <button
              onClick={() => setActiveTab('realtors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'realtors'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <BadgeCheck className="w-4 h-4 text-[var(--emerald)]" /> Realtor Approvals ({realtorsList.length})
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'properties'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-[var(--emerald)]" /> Property Approvals ({listingsList.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-[var(--emerald)]" /> User Management
            </button>
          </aside>

          <main className="md:col-span-3 space-y-6">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)] border-b border-slate-100 pb-3">
                  Platform Performance Summary
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                    <p className="text-2xl font-bold text-[var(--navy)]">$2.5M</p>
                    <p className="text-xs text-slate-400">Total Transaction Value</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                    <p className="text-2xl font-bold text-[var(--emerald)]">99.9%</p>
                    <p className="text-xs text-slate-400">Target Platform Uptime</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                    <p className="text-2xl font-bold text-blue-600">850+</p>
                    <p className="text-xs text-slate-400">Completed Transactions</p>
                  </div>
                </div>
              </div>
            )}

            {/* REALTORS APPROVAL QUEUE */}
            {activeTab === 'realtors' && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)]">Pending Realtor Approvals</h2>

                {realtorsList.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs">
                    No pending realtor verification applications.
                  </div>
                ) : (
                  realtorsList.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--navy)] text-sm">{r.name}</h3>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-semibold rounded">
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--emerald)] font-medium">{r.specialty}</p>
                        <p className="text-xs text-slate-400">
                          Email: {r.email} • Phone: {r.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRealtor(r.id)}
                          className="px-4 py-2 bg-[var(--emerald)] hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleApproveRealtor(r.id)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-xl flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PROPERTY APPROVAL QUEUE */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)]">Pending Property Listings</h2>

                {listingsList.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-xs">
                    No pending property listing submissions.
                  </div>
                ) : (
                  listingsList.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <Image src={prop.image} alt={prop.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--navy)] text-sm">{prop.title}</h3>
                          <p className="text-xs text-slate-400">
                            Realtor: {prop.realtorName} • {prop.location}
                          </p>
                          <p className="text-xs font-bold text-[var(--emerald)] mt-1">{prop.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveListing(prop.id)}
                          className="px-4 py-2 bg-[var(--emerald)] text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                        </button>
                        <button
                          onClick={() => handleApproveListing(prop.id)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-xl flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* USERS MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)] border-b border-slate-100 pb-3">
                  User Management
                </h2>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--navy)]">Jean-Paul Mugisha</p>
                      <p className="text-slate-400">Realtor • Verified</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-[var(--emerald)] font-semibold rounded-md">Active</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--navy)]">Aline Uwimana</p>
                      <p className="text-slate-400">Realtor • Verified</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-[var(--emerald)] font-semibold rounded-md">Active</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--navy)]">David Kagame</p>
                      <p className="text-slate-400">Customer</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-[var(--emerald)] font-semibold rounded-md">Active</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
