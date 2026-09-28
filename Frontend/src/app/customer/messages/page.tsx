'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Search,
  Building2,
  ExternalLink,
  ChevronLeft,
  CheckCheck,
  Phone,
  X,
  Plus,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtorRef {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  realtor: RealtorRef;
  recipient_role?: 'realtor' | 'admin';
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

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  role: 'realtor' | 'admin';
}

function CustomerMessagesContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoStartedRef = useRef(false);

  // New Message Modal State
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [creatingConv, setCreatingConv] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/customer/messages/conversations', {
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

  const startConversation = useCallback(async (realtorId: string, propertyId?: string, message?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/customer/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ realtor_id: realtorId, property_id: propertyId, message }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.conversation as Conversation;
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const list = await fetchConversations();

      const realtorId = searchParams.get('realtor_id');
      if (realtorId && !autoStartedRef.current) {
        autoStartedRef.current = true;
        const propertyId = searchParams.get('property_id') || undefined;
        const existing = list.find(
          (c: Conversation) => c.realtor.id === realtorId && (c.property_id || undefined) === propertyId
        );
        if (existing) {
          setSelectedConvId(existing.id);
        } else {
          const conv = await startConversation(realtorId, propertyId);
          if (conv) {
            setConversations((prev) => [conv, ...prev]);
            setSelectedConvId(conv.id);
          }
        }
      } else if (list.length > 0) {
        setSelectedConvId(list[0].id);
      }

      setLoading(false);
    }

    init();

    async function fetchPlatformUsers() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/customer/users/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPlatformUsers(data.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch platform users:', err);
      }
    }

    fetchPlatformUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the conversation list periodically so unread badges/new threads show up
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Fetch messages when a conversation is selected, and poll while it's open
  useEffect(() => {
    if (!selectedConvId) return;
    const currentConvId = selectedConvId;

    async function fetchMessages() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/customer/messages/conversations/${currentConvId}`, {
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
      const res = await fetch(`/api/customer/messages/conversations/${selectedConvId}`, {
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

  const handleStartConversation = async () => {
    if (!selectedUser) return;
    setCreatingConv(true);

    const conv = await startConversation(selectedUser.id, undefined, initialMessage.trim() || undefined);
    if (conv) {
      setConversations((prev) => {
        const withoutDup = prev.filter((c) => c.id !== conv.id);
        return [conv, ...withoutDup];
      });
      setSelectedConvId(conv.id);
    }

    setShowNewMessageModal(false);
    setSelectedUser(null);
    setInitialMessage('');
    setCreatingConv(false);
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);

  const filteredConversations = conversations.filter((c) =>
    c.realtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.property_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = platformUsers.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            Messages
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Communicate directly with real estate agents and property managers.
          </p>
        </div>

        <button
          onClick={() => setShowNewMessageModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Start a Message
        </button>
      </div>

      {/* Messages Layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-[calc(100vh-230px)] min-h-[500px] flex flex-col md:flex-row">
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
                placeholder="Search messages or agents..."
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
              <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-500">No conversations found. Click "Start a Message" to reach out.</div>
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
                      {conv.realtor.avatar_url ? (
                        <img
                          src={conv.realtor.avatar_url}
                          alt={conv.realtor.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                          {conv.realtor.name.charAt(0)}
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
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{conv.realtor.name}</span>
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

                {selectedConversation.realtor.avatar_url ? (
                  <img
                    src={selectedConversation.realtor.avatar_url}
                    alt={selectedConversation.realtor.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                    {selectedConversation.realtor.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedConversation.realtor.name}</h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border',
                        selectedConversation.recipient_role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      )}
                    >
                      {selectedConversation.recipient_role === 'admin' ? 'Support' : 'Realtor'}
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
                {selectedConversation.property_id && (
                  <Link
                    href={`/customer/property/${selectedConversation.property_id}`}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="View Property"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                {selectedConversation.realtor.phone && (
                  <a
                    href={`tel:${selectedConversation.realtor.phone}`}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Call Agent"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-slate-600 dark:text-slate-500 py-10">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_type === 'customer';
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
                placeholder="Type your message..."
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
            Select a conversation or click "Start a Message" to reach out to an agent.
          </div>
        )}
      </div>

      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Start a Conversation
              </h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Choose a Realtor from the Platform
                </label>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email (realtors & support)..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-500 text-center py-6">No matches found.</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                          selectedUser?.id === user.id
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        )}
                      >
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0',
                                user.role === 'admin'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              )}
                            >
                              {user.role === 'admin' ? 'Support' : 'Realtor'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                        {selectedUser?.id === user.id && (
                          <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
                  Initial Message (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a brief introduction or question..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartConversation}
                  disabled={creatingConv || !selectedUser}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {creatingConv ? 'Starting...' : 'Start Conversation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 dark:text-slate-400">Loading messages...</div>}>
      <CustomerMessagesContent />
    </Suspense>
  );
}
