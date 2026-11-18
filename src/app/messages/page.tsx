'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Send, 
  MessageSquare, 
  Search, 
  Paperclip, 
  Check, 
  CheckCheck, 
  Briefcase, 
  Circle,
  ExternalLink
} from 'lucide-react';
import { Conversation, Message } from '@/types';
import { formatDate } from '@/lib/utils';

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!selectedConv && data.conversations.length > 0) {
          setSelectedConv(data.conversations[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      loadConversations();
    }
  }, [user, authLoading]);

  // Load messages when selectedConv changes
  useEffect(() => {
    if (!selectedConv) return;
    fetch(`/api/conversations/${selectedConv.id}/messages`)
      .then(r => r.json())
      .then(d => {
        if (d.messages) setMessages(d.messages);
      })
      .catch(console.error);
  }, [selectedConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv || !user) return;
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setInputText('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Opening secure message terminal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Direct Communications</h1>
        <p className="text-xs text-gray-400 mt-1">Encrypted collaboration between hirers and independent talent.</p>
      </div>

      <div className="h-[75vh] rounded-3xl bg-[#0B0B0F] border border-white/[0.08] shadow-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        
        {/* Left: Conversation List */}
        <div className="md:col-span-4 border-r border-white/[0.08] flex flex-col">
          <div className="p-4 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-12">No active conversations</p>
            ) : (
              conversations.map((c) => {
                const partner = c.participants.find(p => p.id !== user?.id) || c.participants[0];
                const isSelected = selectedConv?.id === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConv(c)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-violet-600/15 border-l-2 border-violet-500' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <img
                      src={partner.avatarUrl || 'https://avatar.vercel.sh/partner.png'}
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/[0.1] flex-shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{partner.name}</p>
                        <span className="text-[10px] text-gray-500">{formatDate(c.lastMessageAt)}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{c.lastMessage || 'No messages yet'}</p>
                      {c.projectTitle && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-cyan-400 truncate mt-1">
                          {c.projectTitle}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Window */}
        <div className="md:col-span-8 flex flex-col h-full bg-[#050505]">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              {(() => {
                const partner = selectedConv.participants.find(p => p.id !== user?.id) || selectedConv.participants[0];
                return (
                  <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0B0F]">
                    <div className="flex items-center gap-3">
                      <img
                        src={partner.avatarUrl || 'https://avatar.vercel.sh/partner.png'}
                        alt={partner.name}
                        className="w-10 h-10 rounded-full object-cover border border-violet-500/30"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{partner.name}</h3>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                          <Circle className="w-2 h-2 fill-emerald-400" /> Active Now
                        </span>
                      </div>
                    </div>

                    {selectedConv.projectId && (
                      <Link
                        href={`/projects/${selectedConv.projectId}`}
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
                      >
                        <span>Project Brief</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })()}

              {/* Message Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-20">Start the conversation below.</p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isMe
                            ? 'bg-violet-600 text-white shadow-neon-violet'
                            : 'bg-[#121218] text-gray-200 border border-white/[0.08]'
                        }`}>
                          {m.content}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 px-1">
                          {formatDate(m.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/[0.08] bg-[#0B0B0F] flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type an encrypted message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
              Select a conversation to begin chatting
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
