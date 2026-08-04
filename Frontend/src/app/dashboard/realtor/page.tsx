'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  PlusCircle,
  MessageSquare,
  Calendar,
  BarChart2,
  BadgeCheck,
  Eye,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Phone,
  LogOut,
} from 'lucide-react';

const REALTOR_PROPERTIES = [
  {
    id: '1',
    title: 'Luxury Villa in Nyarutarama',
    location: 'Nyarutarama, Kigali',
    price: '$320,000',
    status: 'Available',
    approvalStatus: 'Approved',
    views: 342,
    inquiriesCount: 14,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Prime Commercial Office, CBD',
    location: 'Kigali CBD, Kigali',
    price: '$650,000',
    status: 'Available',
    approvalStatus: 'Approved',
    views: 289,
    inquiriesCount: 9,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    title: 'Modern Duplex in Gacuriro',
    location: 'Gacuriro, Kigali',
    price: '$195,000',
    status: 'Pending Approval',
    approvalStatus: 'Pending',
    views: 45,
    inquiriesCount: 2,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
  },
];

const REALTOR_INQUIRIES = [
  {
    id: 'inq-101',
    customerName: 'David & Mary K.',
    customerPhone: '+250 788 123 456',
    propertyTitle: 'Luxury Villa in Nyarutarama',
    message: 'Hello, I would like to confirm if the asking price includes title deed transfer fees.',
    date: 'August 3, 2026',
    status: 'Replied',
  },
  {
    id: 'inq-102',
    customerName: 'Claire M.',
    customerPhone: '+250 788 987 654',
    propertyTitle: 'Prime Commercial Office, CBD',
    message: 'Is parking space included for office employees?',
    date: 'August 2, 2026',
    status: 'New',
  },
];

const REALTOR_VIEWINGS = [
  {
    id: 'vw-201',
    customerName: 'David & Mary K.',
    propertyTitle: 'Luxury Villa in Nyarutarama',
    requestedDate: 'August 8, 2026 at 10:00 AM',
    status: 'Approved',
  },
  {
    id: 'vw-202',
    customerName: 'Eric H.',
    propertyTitle: 'Prime Commercial Office, CBD',
    requestedDate: 'August 10, 2026 at 2:30 PM',
    status: 'Pending',
  },
];

export default function RealtorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'viewings' | 'analytics'>('listings');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      {/* Top Header Banner */}
      <div className="bg-[var(--navy)] text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[var(--emerald)] shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                alt="Jean-Paul Mugisha"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold">Jean-Paul Mugisha</h1>
                <BadgeCheck className="w-5 h-5 text-[var(--emerald)]" title="Verified Realtor" />
              </div>
              <p className="text-xs text-white/60">Senior Real Estate Consultant • Verified Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/list-property"
              className="px-4 py-2.5 bg-[var(--emerald)] hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors shadow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Create New Listing
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[var(--emerald)] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Listings</p>
              <p className="text-2xl font-bold text-[var(--navy)]">14</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Views</p>
              <p className="text-2xl font-bold text-[var(--navy)]">4,820</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Inquiries Received</p>
              <p className="text-2xl font-bold text-[var(--navy)]">63</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Viewings</p>
              <p className="text-2xl font-bold text-[var(--navy)]">5</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="space-y-1">
            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'listings'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-[var(--emerald)]" /> Property Listings
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'inquiries'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[var(--emerald)]" /> Customer Inquiries ({REALTOR_INQUIRIES.length})
            </button>

            <button
              onClick={() => setActiveTab('viewings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'viewings'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-[var(--emerald)]" /> Viewing Requests ({REALTOR_VIEWINGS.length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-[var(--navy)] text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-[var(--emerald)]" /> Analytics & Reports
            </button>
          </aside>

          {/* Tab Main Content */}
          <main className="md:col-span-3">
            {/* LISTINGS */}
            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-[var(--navy)]">My Listed Properties</h2>
                  <Link
                    href="/list-property"
                    className="px-3.5 py-2 bg-[var(--emerald)] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Listing
                  </Link>
                </div>

                <div className="space-y-4">
                  {REALTOR_PROPERTIES.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <Image src={prop.image} alt={prop.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--navy)] text-sm">{prop.title}</h3>
                          <p className="text-xs text-slate-400">{prop.location}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="font-bold text-[var(--emerald)]">{prop.price}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                prop.approvalStatus === 'Approved'
                                  ? 'bg-emerald-50 text-[var(--emerald)]'
                                  : 'bg-amber-50 text-amber-600'
                              }`}
                            >
                              {prop.approvalStatus === 'Approved' ? 'Published' : 'Pending Admin Approval'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button className="p-2 border border-slate-200 text-slate-600 hover:text-[var(--emerald)] rounded-xl" title="Edit listing">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-slate-200 text-slate-600 hover:text-red-600 rounded-xl" title="Delete listing">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INQUIRIES */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)]">Customer Inquiries</h2>

                <div className="space-y-4">
                  {REALTOR_INQUIRIES.map((inq) => (
                    <div key={inq.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-[var(--navy)] text-sm">{inq.customerName}</h3>
                          <p className="text-xs text-slate-400">Re: {inq.propertyTitle}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                            inq.status === 'Replied' ? 'bg-emerald-50 text-[var(--emerald)]' : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">"{inq.message}"</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <a
                          href={`tel:${inq.customerPhone}`}
                          className="flex items-center gap-1.5 text-xs text-[var(--emerald)] font-semibold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Customer ({inq.customerPhone})
                        </a>
                        <button className="px-3 py-1.5 bg-[var(--navy)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--emerald)] transition-colors">
                          Reply Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEWINGS */}
            {activeTab === 'viewings' && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)]">Viewing Requests</h2>

                <div className="space-y-4">
                  {REALTOR_VIEWINGS.map((vw) => (
                    <div key={vw.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-[var(--navy)] text-sm">{vw.customerName}</h3>
                        <p className="text-xs text-slate-400">Property: {vw.propertyTitle}</p>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--emerald)] font-medium pt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{vw.requestedDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {vw.status === 'Pending' ? (
                          <>
                            <button className="px-3.5 py-1.5 bg-[var(--emerald)] text-white text-xs font-semibold rounded-xl">
                              Approve
                            </button>
                            <button className="px-3.5 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl">
                              Decline
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 text-[var(--emerald)] text-xs font-semibold rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="font-heading text-xl font-bold text-[var(--navy)] border-b border-slate-100 pb-3">
                  Listing Analytics & Insights
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--navy)]">Luxury Villa in Nyarutarama</h4>
                      <p className="text-xs text-slate-400">342 Unique Visitors • 14 Inquiries</p>
                    </div>
                    <span className="text-xs font-bold text-[var(--emerald)]">Top Performer</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--navy)]">Prime Commercial Office, CBD</h4>
                      <p className="text-xs text-slate-400">289 Unique Visitors • 9 Inquiries</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600">High Interest</span>
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
