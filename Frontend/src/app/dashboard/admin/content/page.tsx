'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Star,
  Mail,
  Loader2,
  Clock,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { timeAgo, cn } from '@/lib/utils';
import AdminSidebar from '@/components/admin/AdminSidebar';

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

type Tab = 'blog' | 'faqs' | 'testimonials' | 'messages';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  published: boolean;
  created_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminContentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('blog');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper for REST API headers
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  // 1. Initial Load for all Content Entities
  const loadAllContent = useCallback(async () => {
    setLoading(true);
    try {
      const [blogsRes, faqsRes, testRes, msgsRes] = await Promise.all([
        fetch('/api/admin/blogs', { headers: getAuthHeaders() }),
        fetch('/api/admin/faqs', { headers: getAuthHeaders() }),
        fetch('/api/admin/testimonials', { headers: getAuthHeaders() }),
        fetch('/api/admin/messages', { headers: getAuthHeaders() }),
      ]);

      if (blogsRes.ok) setBlogPosts(await blogsRes.json());
      if (faqsRes.ok) setFaqs(await faqsRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
      if (msgsRes.ok) setMessages(await msgsRes.json());
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  // Tab definitions
  const tabs: { key: Tab; label: string; icon: typeof FileText; count: number }[] = [
    { key: 'blog', label: 'Blog Posts', icon: FileText, count: blogPosts.length },
    { key: 'faqs', label: 'FAQs', icon: HelpCircle, count: faqs.length },
    { key: 'testimonials', label: 'Testimonials', icon: Star, count: testimonials.length },
    { key: 'messages', label: 'Messages', icon: Mail, count: messages.length },
  ];

  // --- BLOG HANDLERS ---
  const handleSaveBlog = async (data: {
    title: string;
    excerpt: string;
    content: string;
    cover_image: string;
    author: string;
    published: boolean;
  }) => {
    setSubmitting(true);
    try {
      if (editingBlog) {
        const res = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const updated = await res.json();
          setBlogPosts((prev) => prev.map((b) => (b.id === editingBlog.id ? updated : b)));
        }
      } else {
        const slug = slugify(data.title) + '-' + Math.random().toString(36).slice(2, 6);
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...data, slug }),
        });
        if (res.ok) {
          const created = await res.json();
          setBlogPosts((prev) => [created, ...prev]);
        }
      }
      setShowBlogForm(false);
      setEditingBlog(null);
    } catch (err) {
      console.error('Error saving blog post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setBlogPosts((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting blog post:', err);
    }
  };

  // --- FAQ HANDLERS ---
  const handleSaveFaq = async (data: {
    question: string;
    answer: string;
    category: string;
    position: number;
  }) => {
    setSubmitting(true);
    try {
      if (editingFaq) {
        const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const updated = await res.json();
          setFaqs((prev) => prev.map((f) => (f.id === editingFaq.id ? updated : f)));
        }
      } else {
        const res = await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const created = await res.json();
          setFaqs((prev) => [...prev, created].sort((a, b) => a.position - b.position));
        }
      }
      setShowFaqForm(false);
      setEditingFaq(null);
    } catch (err) {
      console.error('Error saving FAQ:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
    }
  };

  // --- TESTIMONIAL HANDLERS ---
  const approveTestimonial = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_approved: !currentStatus }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_approved: !currentStatus } : t))
        );
      }
    } catch (err) {
      console.error('Error updating testimonial status:', err);
    }
  };

  // --- MESSAGE HANDLERS ---
  const updateMessageStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      }
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Content Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage blog posts, FAQs, testimonials, and user contact messages.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 flex-wrap border-b border-slate-800 pb-4">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all',
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-950 border border-slate-800 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs text-slate-400">Loading content data...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: BLOG POSTS */}
              {tab === 'blog' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setEditingBlog(null);
                        setShowBlogForm(true);
                      }}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" /> New Blog Post
                    </button>
                  </div>

                  {showBlogForm && (
                    <BlogForm
                      post={editingBlog}
                      submitting={submitting}
                      onClose={() => setShowBlogForm(false)}
                      onSave={handleSaveBlog}
                    />
                  )}

                  {blogPosts.length === 0 ? (
                    <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No blog posts found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {post.cover_image ? (
                              <img
                                src={post.cover_image}
                                alt=""
                                className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0 space-y-1">
                              <h3 className="font-bold text-sm text-white truncate">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  {formatDate(post.created_at)}
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-500" />
                                  {post.author}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                post.published
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingBlog(post);
                                setShowBlogForm(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all"
                              title="Edit Post"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBlog(post.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: FAQS */}
              {tab === 'faqs' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setEditingFaq(null);
                        setShowFaqForm(true);
                      }}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" /> New FAQ
                    </button>
                  </div>

                  {showFaqForm && (
                    <FaqForm
                      faq={editingFaq}
                      submitting={submitting}
                      onClose={() => setShowFaqForm(false)}
                      onSave={handleSaveFaq}
                    />
                  )}

                  {faqs.length === 0 ? (
                    <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No FAQs created yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {faqs.map((faq) => (
                        <div
                          key={faq.id}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4"
                        >
                          <div className="space-y-2 flex-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {faq.category || 'General'}
                            </span>
                            <h3 className="font-bold text-sm text-white">{faq.question}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingFaq(faq);
                                setShowFaqForm(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all"
                              title="Edit FAQ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFaq(faq.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Delete FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TESTIMONIALS */}
              {tab === 'testimonials' && (
                <div className="space-y-3">
                  {testimonials.length === 0 ? (
                    <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No testimonials submitted yet.</p>
                    </div>
                  ) : (
                    testimonials.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-white">{t.name}</h3>
                            <p className="text-xs text-slate-400">
                              {t.role} · {timeAgo(t.created_at)}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              t.is_approved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {t.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 italic bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                          "{t.content}"
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'w-3.5 h-3.5',
                                  i < t.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-700'
                                )}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => approveTestimonial(t.id, t.is_approved)}
                            className={cn(
                              'text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all',
                              t.is_approved
                                ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            )}
                          >
                            {t.is_approved ? 'Unapprove' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: CONTACT MESSAGES */}
              {tab === 'messages' && (
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No contact messages received yet.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-white">{m.name}</h3>
                            <p className="text-xs text-slate-400">
                              {m.email} · {timeAgo(m.created_at)}
                            </p>
                            {m.subject && (
                              <p className="text-xs font-semibold text-emerald-400 mt-1">
                                Subject: {m.subject}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider',
                              m.status === 'new' && 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                              m.status === 'read' && 'bg-slate-800 text-slate-400 border border-slate-700',
                              m.status === 'responded' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            )}
                          >
                            {m.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-900 border border-slate-800 p-3 rounded-xl whitespace-pre-wrap">
                          {m.message}
                        </p>

                        <div className="flex gap-2">
                          {m.status === 'new' && (
                            <button
                              onClick={() => updateMessageStatus(m.id, 'read')}
                              className="text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-all"
                            >
                              Mark Read
                            </button>
                          )}
                          {m.status !== 'responded' && (
                            <button
                              onClick={() => updateMessageStatus(m.id, 'responded')}
                              className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl transition-all"
                            >
                              Mark Responded
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* --- FAQ MODAL COMPONENT --- */
function FaqForm({
  faq,
  submitting,
  onClose,
  onSave,
}: {
  faq: FAQ | null;
  submitting: boolean;
  onClose: () => void;
  onSave: (data: { question: string; answer: string; category: string; position: number }) => void;
}) {
  const [question, setQuestion] = useState(faq?.question || '');
  const [answer, setAnswer] = useState(faq?.answer || '');
  const [category, setCategory] = useState(faq?.category || 'General');
  const [position, setPosition] = useState(faq?.position || 0);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-sm text-white">{faq ? 'Edit FAQ' : 'New FAQ'}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <textarea
          placeholder="Answer"
          rows={3}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          disabled={submitting}
          onClick={() => onSave({ question, answer, category, position })}
          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>Save FAQ</span>
        </button>
      </div>
    </div>
  );
}

/* --- BLOG MODAL COMPONENT --- */
function BlogForm({
  post,
  submitting,
  onClose,
  onSave,
}: {
  post: BlogPost | null;
  submitting: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    excerpt: string;
    content: string;
    cover_image: string;
    author: string;
    published: boolean;
  }) => void;
}) {
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [coverImage, setCoverImage] = useState(post?.cover_image || '');
  const [author, setAuthor] = useState(post?.author || 'Remy Real Estates');
  const [published, setPublished] = useState(post?.published || false);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-sm text-white">{post ? 'Edit Post' : 'New Blog Post'}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <textarea
          placeholder="Excerpt (short summary)"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
        />
        <textarea
          placeholder="Content (use markdown syntax)"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="url"
            placeholder="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-300">Publish immediately</span>
        </label>
        <button
          disabled={submitting}
          onClick={() =>
            onSave({ title, excerpt, content, cover_image: coverImage, author, published })
          }
          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>Save Post</span>
        </button>
      </div>
    </div>
  );
}