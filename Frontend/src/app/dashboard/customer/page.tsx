'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageSquare,
  Calendar,
  User,
  Home as HouseIcon,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  Phone,
  ArrowRight,
  LogOut,
} from 'lucide-react';

// Mock Customer Data
const SAVED_PROPERTIES = [
  {
    id: '1',
    title: 'Luxury Villa in Nyarutarama',
    location: 'KG 17 Ave, Nyarutarama, Kigali',
    price: '$320,000',
    type: 'For Sale',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Executive Penthouse in Kimihurura',
    location: 'KG 11 Ave, Kimihurura, Kigali',
    price: '$4,500/mo',
    type: 'For Rent',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
  },
];

const MY_INQUIRIES = [
  {
    id: 'inq-1',
    propertyTitle: 'Luxury Villa in Nyarutarama',
    realtorName: 'Jean-Paul Mugisha',
    date: 'August 3, 2026',
    message: 'Hello, I would like to confirm if the asking price includes title deed transfer fees.',
    status: 'Replied',
    reply: 'Yes David, the price covers the land registry title transfer fees.',
  },
  {
    id: 'inq-2',
    propertyTitle: 'Modern Apartment in Kacyiru',
    realtorName: 'Aline Uwimana',
    date: 'August 1, 2026',
    message: 'Is this apartment available for a 6-month lease?',
    status: 'Pending',
  },
];

const MY_VIEWINGS = [
  {
    id: 'vw-1',
    propertyTitle: 'Luxury Villa in Nyarutarama',
    realtorName: 'Jean-Paul Mugisha',
    date: 'August 8, 2026 at 10:00 AM',
    status: 'Confirmed',
  },
];

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'inquiries' | 'viewings' | 'profile'>('favorites');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      {/* Top Bar */}
      <div className="bg-[var(--navy)] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--emerald)] flex items-center justify-center font-bold text-lg text-white">
              DK
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">David & Mary K.</h1>
              <p className="text-xs text-white/60">Customer Portal • Buyer / Renter</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="px-4 py-2 bg-[var(--emerald)] hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors shadow flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Browse Properties
            </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <aside className="space-y-1">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <Heart className="w-4 h-4 text-[var(--emerald)]" /> Saved Favorites ({SAVED_PROPERTIES.length})
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'inquiries'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[var(--emerald)]" /> Property Inquiries ({MY_INQUIRIES.length})
            </button>

            <button
              onClick={() => setActiveTab('viewings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'viewings'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-[var(--emerald)]" /> Viewing Appointments ({MY_VIEWINGS.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-[var(--emerald)]" /> Account Profile
            </button>
          </aside>

          {/* Main Area */}
          <main className="md:col-span-3">
            {/* SAVED FAVORITES */}
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-[var(--navy)]">Saved Favorites</h2>
                  <span className="text-xs text-slate-400">{SAVED_PROPERTIES.length} Saved Items</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {SAVED_PROPERTIES.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between group"
                    >
                      <div className="relative h-44 w-full">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                        <button
                          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-slate-400 hover:text-red-500 shadow"
                          title="Remove favorite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="absolute bottom-3 left-3 px-3 py-1 bg-[var(--navy)] text-white text-xs font-bold rounded-lg">
                          {item.price}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-[var(--navy)] text-sm">{item.title}</h3>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <Link
                            href={`/properties/luxury-villa-nyarutarama`}
                            className="text-xs font-semibold text-[var(--emerald)] flex items-center gap-1 hover:underline"
                          >
                            View Listing Details <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INQUIRIES */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-[var(--navy)]">My Property Inquiries</h2>
                </div>

                <div className="space-y-4">
                  {MY_INQUIRIES.map((inq) => (
                    <div key={inq.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--navy)] text-sm">{inq.propertyTitle}</h3>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                            inq.status === 'Replied'
                              ? 'bg-emerald-50 text-[var(--emerald)]'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 italic">" {inq.message} "</p>

                      {inq.reply && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                          <p className="font-semibold text-[var(--navy)]">Response from {inq.realtorName}:</p>
                          <p className="text-slate-600">{inq.reply}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>Realtor: {inq.realtorName}</span>
                        <span>Sent: {inq.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEWINGS */}
            {activeTab === 'viewings' && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)]">Scheduled Property Viewings</h2>

                <div className="space-y-4">
                  {MY_VIEWINGS.map((vw) => (
                    <div key={vw.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="px-2.5 py-1 bg-emerald-50 text-[var(--emerald)] text-[11px] font-semibold rounded-md">
                          {vw.status}
                        </span>
                        <h3 className="font-semibold text-[var(--navy)] text-sm pt-1">{vw.propertyTitle}</h3>
                        <p className="text-xs text-slate-500">Realtor: {vw.realtorName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--emerald)] font-medium pt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{vw.date}</span>
                        </div>
                      </div>

                      <button className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:border-red-400 hover:text-red-600 transition-colors">
                        Cancel Appointment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)] border-b border-slate-100 pb-3">
                  Account Profile Details
                </h2>

                <form className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                      <input
                        type="text"
                        defaultValue="David"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        defaultValue="Kagame"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue="david@example.com"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+250 788 123 456"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>

                  <button
                    type="button"
                    className="px-6 py-2.5 bg-[var(--emerald)] text-white text-xs font-semibold rounded-xl shadow"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
