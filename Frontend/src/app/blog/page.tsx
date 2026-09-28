'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, Clock, ArrowRight, BookOpen, Loader2, Newspaper } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author: string;
  created_at: string;
}

const estimateReadTime = (content: string) => {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch('/api/blog');
        if (res.ok) {
          const data = await res.json();
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    const found = new Set<string>();
    posts.forEach((p) => {
      if (p.category) found.add(p.category);
    });
    return ['All', ...Array.from(found)];
  }, [posts]);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

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
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--emerald)] text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--emerald)]/30"
            />
          </div>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)] mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-24 text-center">
            <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-[var(--navy)] dark:text-white mb-1">No Articles Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
              {posts.length === 0
                ? "We haven't published any articles yet. Check back soon."
                : 'No articles match your search or category filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-[var(--navy)]/90 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{estimateReadTime(post.content)}</span>
                      </div>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[var(--navy)] dark:text-white group-hover:text-[var(--emerald)] transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">By {post.author}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--emerald)] group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
