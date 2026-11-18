'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  Search, 
  Bell, 
  MessageSquare, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Briefcase, 
  Layers, 
  Award, 
  ShieldCheck, 
  LogOut, 
  ArrowRightLeft,
  Sparkles
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

  // Close dropdown on outside click
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
    { name: 'Explore Talent', href: '/explore' },
    { name: 'Find Projects', href: '/projects' },
    { name: 'Categories', href: '/categories' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/85 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#0B0B0F] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-gray-100 to-violet-300 bg-clip-text text-transparent">
              GRAVITASS
            </span>
            <span className="text-[10px] tracking-widest text-cyan-400 font-semibold uppercase -mt-1">
              Autonomous Talent
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-white bg-white/[0.08] border border-white/[0.06]'
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Auth State / Switcher / Actions */}
        <div className="hidden md:flex items-center gap-3" ref={dropdownRef}>
          {user ? (
            <>
              {/* Dual Role Switcher Pill */}
              <button
                onClick={() => switchRole(activeRole === 'freelancer' ? 'client' : 'freelancer')}
                title="Switch active dashboard mode"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121218] border border-violet-500/30 text-xs font-semibold text-gray-200 hover:border-violet-400 hover:text-white transition-all shadow-sm"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400" />
                <span>Mode:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  activeRole === 'client' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                    : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                }`}>
                  {activeRole}
                </span>
              </button>

              {/* Messages Link */}
              <Link
                href="/messages"
                className="p-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-gray-300 hover:text-white hover:border-violet-500/50 transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-gray-300 hover:text-white hover:border-violet-500/50 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#121218] border border-white/[0.1] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-violet-400 hover:text-violet-300 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-white/[0.05] max-h-72 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No notifications yet</p>
                      ) : (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            href={notif.link || '#'}
                            onClick={() => setNotifDropdownOpen(false)}
                            className={`block py-2.5 px-2 rounded-lg transition-colors ${
                              notif.isRead ? 'hover:bg-white/[0.03]' : 'bg-violet-950/20 hover:bg-violet-950/30'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-gray-200">{notif.title}</p>
                                <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{notif.message}</p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full bg-[#121218] border border-white/[0.1] hover:border-violet-500/50 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://avatar.vercel.sh/user.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-1" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#121218] border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/[0.08]">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={activeRole === 'client' ? '/dashboard/client' : '/dashboard/freelancer'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:text-white hover:bg-violet-600/15 rounded-lg transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-violet-400" />
                        Dashboard
                      </Link>

                      {activeRole === 'freelancer' && (
                        <Link
                          href={`/freelancers/${user.id}`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:text-white hover:bg-violet-600/15 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 text-cyan-400" />
                          Public Profile
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/15 rounded-lg transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-white/[0.08]">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-semibold rounded-xl group bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:to-cyan-400 text-white shadow-neon-violet hover:shadow-neon-cyan transition-all"
              >
                <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-[#0B0B0F] rounded-[10px] group-hover:bg-opacity-0">
                  Get Started
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={() => switchRole(activeRole === 'freelancer' ? 'client' : 'freelancer')}
              className="text-[10px] px-2 py-1 rounded bg-[#121218] border border-violet-500/40 text-violet-300"
            >
              {activeRole.toUpperCase()}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white bg-[#121218] border border-white/[0.08]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#050505] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.04]"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            {user ? (
              <>
                <Link
                  href={activeRole === 'client' ? '/dashboard/client' : '/dashboard/freelancer'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm shadow-neon-violet"
                >
                  Dashboard ({activeRole})
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-gray-300"
                >
                  Messages
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-center px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-xl bg-[#121218] text-sm font-medium text-gray-300 border border-white/[0.08]"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-sm font-semibold text-white shadow-neon-violet"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
