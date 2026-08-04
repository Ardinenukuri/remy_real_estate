'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

const BLOG_POSTS = [
  {
    slug: 'guide-to-buying-property-in-kigali',
    title: 'Complete Guide to Buying Property in Kigali as an Expat',
    category: 'Buying Guides',
    excerpt:
      'Everything you need to know about Rwandan land registry laws, title transfers, tax structures, and working with certified local realtors in 2026.',
    author: 'Jean-Paul Mugisha',
    date: 'August 2, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'top-neighborhoods-to-invest-in-rwanda',
    title: 'Top 5 Kigali Neighborhoods with Highest Rental Yields',
    category: 'Market Trends',
    excerpt:
      'Detailed investment analysis of Nyarutarama, Kimihurura, Kacyiru, Gacuriro, and Kiyovu detailing appreciation rates and tenant demand.',
    author: 'Patrick Nshimiye',
    date: 'July 28, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'understanding-rwanda-land-registration-system',
    title: 'Understanding Rwanda’s Digital Land Registry System (UPI)',
    category: 'Legal & Tax',
    excerpt:
      'How the Unique Parcel Identifier (UPI) system streamlines property ownership validation and eliminates fraud in real estate transactions.',
    author: 'Diane Kagame',
    date: 'July 15, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Buying Guides', 'Market Trends', 'Legal & Tax', 'Neighborhoods'];

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
            <span className="text-white">Blog</span>
          </div>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" /> Insights & News
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white text-balance mb-3">
              Real Estate Journal
            </h1>
            <p className="text-white/60 leading-relaxed text-sm">
              Expert advice, market intelligence, neighborhood guides, and legal insights for property buyers, sellers, and investors in Rwanda.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--emerald)] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
            />
          </div>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.filter(
            (post) => selectedCategory === 'All' || post.category === selectedCategory,
          ).map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-[var(--navy)]/90 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-4 text-slate-400 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[var(--navy)] group-hover:text-[var(--emerald)] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs font-medium text-slate-500">By {post.author}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--emerald)] group-hover:translate-x-1 transition-transform">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
