'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Building2,
  ChevronLeft,
  CheckCheck,
  Phone,
  Mail,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface CustomerRef {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  customer: CustomerRef;
  property_title?: string;
  property_id?: string;
  last_message: string;
  last_updated: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'realtor' | 'admin';
  content: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        return data.conversations || [];
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
    return [];
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const list = await fetchConversations();
      if (list.length > 0) {
        setSelectedConvId(list[0].id);
      }
      setLoading(false);
    }
    init();
  }, [fetchConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConvId) return;
    const currentConvId = selectedConvId;

    async function fetchMessages() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/admin/messages/conversations/${currentConvId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setConversations((prev) =>
            prev.map((c) => (c.id === currentConvId ? { ...c, unread_count: 0 } : c))
          );
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/messages/conversations/${selectedConvId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        const sent = await res.json();
        setMessages((prev) => [...prev, sent]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId ? { ...c, last_message: messageText, last_updated: sent.created_at } : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);

  const filteredConversations = conversations.filter((c) =>
    c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.property_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-slate-900 dark:text-white">Messages</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-6 flex-1 min-h-0 flex flex-col">
          <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              Customer Messages
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Direct conversations customers have started with the Remy Real Estates support team.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex-1 min-h-[500px] flex flex-col md:flex-row">
            <div
              className={cn(
                'w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-100 dark:bg-slate-950/50 shrink-0',
                selectedConvId ? 'hidden md:flex' : 'flex'
              )}
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search messages or customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                {loading ? (
                  <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-500">Loading chats...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-500">
                    Customer messages will appear here when they reach out to support.
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive = conv.id === selectedConvId;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConvId(conv.id)}
                        className={cn(
                          'w-full p-4 text-left flex items-start gap-3 transition-colors',
                          isActive ? 'bg-slate-100 dark:bg-slate-800/80 border-l-4 border-emerald-500' : 'hover:bg-white dark:hover:bg-slate-900/60'
                        )}
                      >
                        <div className="relative shrink-0">
                          {conv.customer.avatar_url ? (
                            <img
                              src={conv.customer.avatar_url}
                              alt={conv.customer.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                              {conv.customer.name.charAt(0)}
                            </div>
                          )}
                          {conv.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 border-2 border-slate-950 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{conv.customer.name}</span>
                            <span className="text-[10px] text-slate-600 dark:text-slate-500 shrink-0">
                              {conv.last_updated ? new Date(conv.last_updated).toLocaleDateString() : ''}
                            </span>
                          </div>

                          {conv.property_title && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 truncate">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{conv.property_title}</span>
                            </div>
                          )}

                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-tight">
                            {conv.last_message || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {selectedConversation ? (
              <div
                className={cn(
                  'flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0',
                  !selectedConvId ? 'hidden md:flex' : 'flex'
                )}
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100 dark:bg-slate-950/40 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setSelectedConvId(null)}
                      className="md:hidden p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {selectedConversation.customer.avatar_url ? (
                      <img
                        src={selectedConversation.customer.avatar_url}
                        alt={selectedConversation.customer.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                        {selectedConversation.customer.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedConversation.customer.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Customer
                        </span>
                      </div>
                      {selectedConversation.property_title && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          Property: <span className="text-slate-700 dark:text-slate-200">{selectedConversation.property_title}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedConversation.customer.phone && (
                      <a
                        href={`tel:${selectedConversation.customer.phone}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    {selectedConversation.customer.email && (
                      <a
                        href={`mailto:${selectedConversation.customer.email}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Email Customer"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-xs text-slate-600 dark:text-slate-500 py-10">No messages yet.</div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_type === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={cn('flex flex-col max-w-[80%] md:max-w-[70%]', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}
                        >
                          <div
                            className={cn(
                              'p-3.5 rounded-2xl text-xs leading-relaxed shadow-md',
                              isMe
                                ? 'bg-emerald-500 text-white rounded-br-none'
                                : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                            )}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-slate-600 dark:text-slate-500 mt-1 flex items-center gap-1 px-1">
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/40 flex items-center gap-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center text-slate-600 dark:text-slate-500 text-xs">
                Select a conversation to view the message thread.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
