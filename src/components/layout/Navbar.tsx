'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Briefcase, 
  User, 
  ShieldCheck, 
  LogOut, 
  ArrowRightLeft,
  Bell,
  MessageSquare
} from 'lucide-react';
import { Notification } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const { user, activeRole, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    await fetch('/api/notifications/read', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const navLinks = [
    { name: 'Discover', href: '/explore' },
    { name: 'Talent', href: '/explore' },
    { name: 'Projects', href: '/projects' },
    { name: 'Categories', href: '/categories' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#071011]/80 backdrop-blur-md border-b border-white/[0.05] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Logo & Small Descriptor */}
        <Link href="/" className="flex items-center gap-3.5 group">
          {/* Subtle Geometric Emblem */}
          <div className="relative w-8 h-8 rounded-full border border-[#73D8C4]/40 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:border-[#73D8C4]">
            <div className="w-2 h-2 rounded-full bg-[#73D8C4] shadow-[0_0_10px_#73D8C4]" />
            <div className="absolute inset-0 rounded-full border border-[#73D8C4]/20 animate-spin-very-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-medium tracking-[0.22em] text-[#F4F5F3] group-hover:text-white transition-colors">
              GRAVITASS
            </span>
            <span className="text-[9px] tracking-[0.25em] text-[#91A09E] uppercase font-light -mt-0.5">
              Independent Work Protocol
            </span>
          </div>
        </Link>

        {/* Center: Minimalist Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs tracking-[0.14em] uppercase transition-colors duration-200 relative py-1 ${
                  isActive
                    ? 'text-[#73D8C4] font-medium'
                    : 'text-[#91A09E] hover:text-[#F4F5F3]'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#73D8C4]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Subtle Actions / Auth */}
        <div className="hidden md:flex items-center gap-6" ref={dropdownRef}>
          {user ? (
            <>
              {/* Dual Role Pill */}
              <button
                onClick={() => switchRole(activeRole === 'freelancer' ? 'client' : 'freelancer')}
                title="Switch active role"
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1719] border border-white/[0.08] hover:border-[#73D8C4]/40 text-[11px] text-[#91A09E] hover:text-[#F4F5F3] transition-all"
              >
                <ArrowRightLeft className="w-3 h-3 text-[#73D8C4]" />
                <span className="text-[10px] tracking-wider uppercase text-[#73D8C4] font-semibold">{activeRole}</span>
              </button>

              {/* Messages */}
              <Link
                href="/messages"
                className="text-[#91A09E] hover:text-[#F4F5F3] transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="text-[#91A09E] hover:text-[#F4F5F3] transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#73D8C4] shadow-[0_0_8px_#73D8C4]" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#0B1719] border border-white/[0.1] rounded-2xl shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <span className="text-xs tracking-wider uppercase font-semibold text-[#F4F5F3]">Alerts</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-[#73D8C4]">Mark read</button>
                      )}
                    </div>
                    <div className="divide-y divide-white/[0.05] max-h-64 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#91A09E] py-4 text-center">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || '#'}
                            onClick={() => setNotifDropdownOpen(false)}
                            className="block py-2.5 px-2 text-xs text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.02] rounded-lg"
                          >
                            <p className="font-semibold text-[#F4F5F3]">{n.title}</p>
                            <p className="text-[11px] truncate mt-0.5">{n.message}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-white/[0.08] hover:border-[#73D8C4]/40 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://avatar.vercel.sh/user.png'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <ChevronDown className="w-3 h-3 text-[#91A09E] mr-1" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-[#0B1719] border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-white/[0.08]">
                      <p className="text-xs font-semibold text-[#F4F5F3] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#91A09E] truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={activeRole === 'client' ? '/dashboard/client' : '/dashboard/freelancer'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.04] rounded-lg"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-[#73D8C4]" />
                        Dashboard
                      </Link>
                      {activeRole === 'freelancer' && (
                        <Link
                          href={`/freelancers/${user.id}`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.04] rounded-lg"
                        >
                          <User className="w-3.5 h-3.5 text-[#A5E8DE]" />
                          Profile
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#73D8C4] hover:bg-white/[0.04] rounded-lg"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Console
                        </Link>
                      )}
                    </div>
                    <div className="pt-1 border-t border-white/[0.08]">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-xs tracking-[0.14em] uppercase text-[#91A09E] hover:text-[#F4F5F3] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-full border border-[#73D8C4]/40 hover:border-[#73D8C4] bg-[#73D8C4]/10 hover:bg-[#73D8C4]/20 text-[#73D8C4] hover:text-white text-xs tracking-[0.14em] uppercase font-medium transition-all shadow-[0_0_15px_rgba(115,216,196,0.15)] hover:shadow-[0_0_20px_rgba(115,216,196,0.3)]"
              >
                Join GRAVITASS
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Trigger */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <button
              onClick={() => switchRole(activeRole === 'freelancer' ? 'client' : 'freelancer')}
              className="text-[10px] px-2 py-0.5 rounded-full border border-[#73D8C4]/40 text-[#73D8C4] uppercase"
            >
              {activeRole}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#91A09E] hover:text-[#F4F5F3]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071011] border-b border-white/[0.08] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs tracking-[0.15em] uppercase text-[#91A09E] hover:text-[#F4F5F3]"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href={activeRole === 'client' ? '/dashboard/client' : '/dashboard/freelancer'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#73D8C4]/15 border border-[#73D8C4]/40 text-[#73D8C4] text-xs font-medium uppercase tracking-wider"
                >
                  Dashboard ({activeRole})
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full text-center py-2 text-xs text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs uppercase tracking-wider text-[#91A09E]"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#73D8C4]/20 border border-[#73D8C4]/50 text-[#73D8C4] text-xs uppercase tracking-wider font-semibold"
                >
                  Join GRAVITASS
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
