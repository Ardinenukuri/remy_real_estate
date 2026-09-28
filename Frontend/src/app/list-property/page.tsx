'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';

export default function ListPropertyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Villas',
    type: 'For Sale',
    price: '',
    location: '',
    bedrooms: '3',
    bathrooms: '2',
    sqft: '1500',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Header Banner */}
      <div className="bg-[var(--navy)] text-white py-12 mb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> For Property Owners & Realtors
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">List Your Property in Rwanda</h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Reach thousands of active buyers and renters across Kigali and nationwide. Get your property verified and published today.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-md">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[var(--emerald)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-[var(--navy)]">Property Listing Submitted!</h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Our verification team is reviewing your property details. You will receive an email confirmation once your listing is published live on Remy Real Estates.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--emerald)] text-white text-xs font-semibold rounded-xl"
              >
                Browse Published Listings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-[var(--navy)] border-b border-slate-100 pb-3">
                Property Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern 4BR Villa in Nyarutarama"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
                    >
                      <option value="For Sale">For Sale</option>
                      <option value="For Rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
                    >
                      <option value="Villas">Villas</option>
                      <option value="Apartments">Apartments</option>
                      <option value="Houses">Houses</option>
                      <option value="Offices">Offices</option>
                      <option value="Land">Land</option>
                      <option value="Penthouses">Penthouses</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price (USD) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $250,000 or $1,500/mo"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KG 17 Ave, Nyarutarama, Kigali"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Area (sqft)</label>
                    <input
                      type="number"
                      value={formData.sqft}
                      onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the property features, views, security, amenities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
                  ></textarea>
                </div>

                {/* Drag and Drop Image Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Property Photos</label>
                  <ImageUploader images={images} onChange={setImages} />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[var(--emerald)] hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Submit Property for Verification <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
