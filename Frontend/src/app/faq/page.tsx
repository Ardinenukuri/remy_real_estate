'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Loader2, MessageCircleQuestion } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      setLoading(true);
      try {
        const res = await fetch('/api/faqs');
        if (res.ok) {
          const data = await res.json();
          setFaqs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
  }, []);

  const grouped = useMemo(() => {
    const groups = new Map<string, Faq[]>();
    faqs.forEach((faq) => {
      const category = faq.category || 'General';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(faq);
    });
    return Array.from(groups.entries());
  }, [faqs]);

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
            <span className="text-white">FAQ</span>
          </div>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 rounded-full text-[var(--emerald)] text-xs font-semibold uppercase tracking-wider mb-4">
              <MessageCircleQuestion className="w-3.5 h-3.5" /> Help Center
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white text-balance mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-white/60 leading-relaxed text-sm">
              Answers to the most common questions about buying, renting, listing, and working with realtors on Remy Real Estates.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--emerald)] mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-20 text-center">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-[var(--navy)] dark:text-white mb-1">No FAQs Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
              We haven't published any FAQs yet. Have a question? Reach out to our team directly.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--emerald)] text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([category, items]) => (
              <div key={category}>
                <h2 className="font-heading text-lg font-bold text-[var(--navy)] dark:text-white mb-4">{category}</h2>
                <div className="space-y-3">
                  {items.map((faq) => {
                    const isOpen = openId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : faq.id)}
                          className="w-full flex items-center justify-between gap-4 p-5 text-left"
                        >
                          <span className="font-semibold text-[var(--navy)] dark:text-white text-sm">{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still have questions CTA */}
        {faqs.length > 0 && (
          <div className="mt-14 bg-[var(--navy)] rounded-3xl p-10 text-center">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-2">
              Still Have Questions?
            </h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Our team is happy to help with anything not covered here.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--emerald)] text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
