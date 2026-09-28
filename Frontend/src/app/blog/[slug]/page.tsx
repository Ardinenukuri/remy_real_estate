'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Loader2, BookOpen, User } from 'lucide-react';

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

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          setPost(await res.json());
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)] mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading article...</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background pt-32 flex flex-col items-center justify-center text-center px-4">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h1 className="font-heading text-2xl font-bold text-[var(--navy)] dark:text-white mb-2">Article Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm">
          This article may have been unpublished or the link is incorrect.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--emerald)] text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-[var(--navy)] pt-24 pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{post.title}</span>
          </div>

          {post.category && (
            <span className="inline-flex items-center px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider mb-4">
              {post.category}
            </span>
          )}

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white text-balance mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/60 text-xs">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {estimateReadTime(post.content)}
            </span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {post.cover_image && (
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden mb-10 bg-slate-100 dark:bg-slate-800">
            <Image src={post.cover_image} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--emerald)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
