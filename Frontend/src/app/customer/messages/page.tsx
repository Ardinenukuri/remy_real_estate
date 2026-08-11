'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Building2,
  ExternalLink,
  ChevronLeft,
  CheckCheck,
  Phone,
  Mail,
  X,
  Plus,
  Users,
  AtSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  realtor: Realtor;
  property_title?: string;
  property_id?: string;
  last_message: string;
  last_updated: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'realtor';
  content: string;
  created_at: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'realtor' | 'admin';
}

function CustomerMessagesContent() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Message Modal State
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [creatingConv, setCreatingConv] = useState(false);

  // Auto-scroll chat body to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/customer/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
          if (data.conversations?.length > 0) {
            setSelectedConvId(data.conversations[0].id);
          }
        } else {
          // Fallback mock data for testing
          const mockConversations: Conversation[] = [
            {
              id: 'conv-1',
              realtor: {
                id: 'agent-1',
                name: 'Eric Manzi',
                email: 'eric.m@remy.com',
                phone: '+250 788 123 456',
              },
              property_title: 'Modern Luxury Villa in Kiyovu',
              property_id: '1',
              last_message: 'Hi! Yes, tomorrow at 10:00 AM works perfectly for the tour.',
              last_updated: '10:42 AM',
              unread_count: 1,
            },
            {
              id: 'conv-2',
              realtor: {
                id: 'agent-2',
                name: 'Aline Uwase',
                email: 'aline.u@remy.com',
                phone: '+250 788 987 654',
              },
              property_title: 'Executive High-Rise Apartment',
              property_id: '2',
              last_message: 'Can you please confirm if the utilities are included in the price?',
              last_updated: 'Yesterday',
              unread_count: 0,
            },
          ];
          setConversations(mockConversations);
          setSelectedConvId(mockConversations[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();

    // Fetch platform users (realtors) for the new message picker
    async function fetchPlatformUsers() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/customer/users/contacts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setPlatformUsers(data.users || []);
        } else {
          // Fallback available realtors
          setPlatformUsers([
            { id: 'agent-1', name: 'Eric Manzi', email: 'eric.m@remy.com', phone: '+250 788 123 456', role: 'realtor' },
            { id: 'agent-2', name: 'Aline Uwase', email: 'aline.u@remy.com', phone: '+250 788 987 654', role: 'realtor' },
            { id: 'agent-3', name: 'Jean Bosco', email: 'jean.b@remy.com', phone: '+250 788 555 666', role: 'realtor' },
            { id: 'agent-4', name: 'Claudine Uwimana', email: 'claudine.u@remy.com', phone: '+250 788 222 333', role: 'realtor' },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch platform users:', err);
      }
    }

    fetchPlatformUsers();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConvId) return;

    async function fetchMessages() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/customer/messages/conversations/${selectedConvId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        } else {
          // Fallback mock messages
          if (selectedConvId === 'conv-1') {
            setMessages([
              {
                id: 'msg-1',
                conversation_id: 'conv-1',
                sender_type: 'customer',
                content: 'Hello Eric! Is the Modern Villa in Kiyovu still available for viewing this week?',
                created_at: '10:15 AM',
              },
              {
                id: 'msg-2',
                conversation_id: 'conv-1',
                sender_type: 'realtor',
                content: 'Hello! Yes, it is currently available. Would Tuesday or Wednesday suit you best?',
                created_at: '10:28 AM',
              },
              {
                id: 'msg-3',
                conversation_id: 'conv-1',
                sender_type: 'customer',
                content: 'Tuesday morning would be great for me.',
                created_at: '10:35 AM',
              },
              {
                id: 'msg-4',
                conversation_id: 'conv-1',
                sender_type: 'realtor',
                content: 'Hi! Yes, tomorrow at 10:00 AM works perfectly for the tour.',
                created_at: '10:42 AM',
              },
            ]);
          } else {
            setMessages([
              {
                id: 'msg-5',
                conversation_id: 'conv-2',
                sender_type: 'realtor',
                content: 'Hello! Let me know if you have any questions regarding the high-rise apartment in Gacuriro.',
                created_at: 'Yesterday 3:10 PM',
              },
              {
                id: 'msg-6',
                conversation_id: 'conv-2',
                sender_type: 'customer',
                content: 'Can you please confirm if the utilities are included in the price?',
                created_at: 'Yesterday 4:05 PM',
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    }

    fetchMessages();
  }, [selectedConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConvId,
      sender_type: 'customer',
      content: messageText,
      created_at: 'Just now',
    };

    setMessages((prev) => [...prev, tempMessage]);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? { ...c, last_message: messageText, last_updated: 'Just now' }
          : c
      )
    );

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/customer/messages/conversations/${selectedConvId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageText }),
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStartConversation = async () => {
    if (!selectedUser && !customEmail.trim()) return;
    setCreatingConv(true);

    const realtor: Realtor = selectedUser
      ? {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          phone: selectedUser.phone,
        }
      : {
          id: 'external-' + Date.now(),
          name: customEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: customEmail,
          phone: '',
        };

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      realtor,
      last_message: initialMessage.trim() || 'Start a conversation...',
      last_updated: 'Just now',
      unread_count: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedConvId(newConv.id);
    setMessages(
      initialMessage.trim()
        ? [{
            id: `msg-${Date.now()}`,
            conversation_id: newConv.id,
            sender_type: 'customer',
            content: initialMessage.trim(),
            created_at: 'Just now',
          }]
        : []
    );

    // Reset modal state
    setShowNewMessageModal(false);
    setSelectedUser(null);
    setCustomEmail('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            Messages
          </h1>
          <p className="text-sm text-slate-400 mt-1">
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

      {/* Messages Main Layout Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[calc(100vh-230px)] min-h-[500px] flex flex-col md:flex-row">
        {/* Left Panel: Conversation List */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/50 shrink-0',
            selectedConvId ? 'hidden md:flex' : 'flex'
          )}
        >
          {/* Search Box Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search messages or agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Conversations Item List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No conversations found. Click "Start a Message" to reach out.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn(
                      'w-full p-4 text-left flex items-start gap-3 transition-colors',
                      isActive ? 'bg-slate-800/80 border-l-4 border-emerald-500' : 'hover:bg-slate-900/60'
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                        {conv.realtor.name.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{conv.realtor.name}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">{conv.last_updated}</span>
                      </div>

                      {conv.property_title && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 truncate">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{conv.property_title}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 truncate leading-tight">{conv.last_message}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Window */}
        {selectedConversation ? (
          <div
            className={cn(
              'flex-1 flex flex-col bg-slate-900 min-w-0',
              !selectedConvId ? 'hidden md:flex' : 'flex'
            )}
          >
            {/* Active Conversation Topbar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedConvId(null)}
                  className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                  {selectedConversation.realtor.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{selectedConversation.realtor.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Realtor
                    </span>
                  </div>
                  {selectedConversation.property_title && (
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      Property: <span className="text-slate-200">{selectedConversation.property_title}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedConversation.property_id && (
                  <Link
                    href={`/customer/property/${selectedConversation.property_id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="View Property"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <a
                  href={`tel:${selectedConversation.realtor.phone}`}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Call Agent"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
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
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none'
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 px-1">
                      {msg.created_at}
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3 shrink-0">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
          <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center text-slate-500 text-xs">
            Select a conversation or click "Start a Message" to reach out to an agent.
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Start a Conversation
              </h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Option 1: Pick from platform realtors */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Choose a Realtor from the Platform
                </label>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search realtors..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setCustomEmail('');
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                        selectedUser?.id === user.id && !customEmail
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      )}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      {selectedUser?.id === user.id && !customEmail && (
                        <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Option 2: Enter custom email */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  <AtSign className="w-4 h-4 text-emerald-400" />
                  Message Someone by Email
                </label>

                {selectedUser && (
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 mb-2 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear selection and use email instead
                  </button>
                )}

                <input
                  type="email"
                  placeholder="Enter anyone's email address..."
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (e.target.value) setSelectedUser(null);
                  }}
                  disabled={!!selectedUser}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                />
              </div>

              {/* Initial Message */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  Initial Message (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a brief introduction or question..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartConversation}
                  disabled={creatingConv || (!selectedUser && !customEmail.trim())}
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
    <Suspense fallback={<div className="p-8 text-slate-400">Loading messages...</div>}>
      <CustomerMessagesContent />
    </Suspense>
  );
}