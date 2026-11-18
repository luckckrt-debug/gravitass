'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Shield, Sparkles, Terminal, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.08] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-violet-950/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#0B0B0F] rounded-[11px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-gray-100 to-violet-300 bg-clip-text text-transparent">
                GRAVITASS
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              The premier decentralized intelligence and talent network. Connect with world-class engineers, AI builders, and creative visionaries.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                Escrow Protected
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                AI Ranked
              </span>
            </div>
          </div>

          {/* Column 1: For Clients */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">For Hirers</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/explore" className="hover:text-violet-400 transition-colors">Explore Talent</Link></li>
              <li><Link href="/projects" className="hover:text-violet-400 transition-colors">Browse Projects</Link></li>
              <li><Link href="/dashboard/client" className="hover:text-violet-400 transition-colors">Post a Project</Link></li>
              <li><Link href="/leaderboard" className="hover:text-violet-400 transition-colors">Top Rated Talent</Link></li>
            </ul>
          </div>

          {/* Column 2: For Freelancers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">For Talent</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/projects" className="hover:text-cyan-400 transition-colors">Find Projects</Link></li>
              <li><Link href="/dashboard/freelancer" className="hover:text-cyan-400 transition-colors">Talent Dashboard</Link></li>
              <li><Link href="/auth/signup" className="hover:text-cyan-400 transition-colors">Join as Freelancer</Link></li>
              <li><Link href="/leaderboard" className="hover:text-cyan-400 transition-colors">Performance Rankings</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/categories" className="hover:text-white transition-colors">All Categories</Link></li>
              <li><Link href="/explore" className="hover:text-white transition-colors">AI & Automation</Link></li>
              <li><Link href="/explore" className="hover:text-white transition-colors">Full-Stack Tech</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Gateway</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 GRAVITASS Freelance Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-gray-400 cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
