'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCheck, Sparkles, Briefcase, DollarSign, MessageSquare, Award } from 'lucide-react';
import { Notification } from '@/types';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
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
      loadNotifications();
    }
  }, [user, authLoading]);

  const markAllRead = async () => {
    await fetch('/api/notifications/read', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Notifications Center</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time alerts for proposals, escrow milestones, and messages.</p>
        </div>
        <button
          onClick={markAllRead}
          className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-gray-300 flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4 text-violet-400" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#0B0B0F] border border-white/[0.08]">
            <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              className={`block p-4 sm:p-5 rounded-2xl border transition-all ${
                n.isRead
                  ? 'bg-[#0B0B0F] border-white/[0.06] hover:border-white/[0.12]'
                  : 'bg-[#121218] border-violet-500/40 shadow-neon-violet'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 flex-shrink-0">{formatDate(n.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
