'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#020303] border-t border-white/[0.06] relative overflow-hidden text-xs text-[#91A09E]">
      
      {/* Subtle Background Animated Geometry */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-[100%] border border-[#73D8C4]/[0.06] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] rounded-[100%] border border-white/[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border border-[#73D8C4]/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#73D8C4] shadow-[0_0_8px_#73D8C4]" />
              </div>
              <span className="text-base font-medium tracking-[0.22em] text-[#F4F5F3]">
                GRAVITASS
              </span>
            </Link>
            <p className="text-xs text-[#91A09E] max-w-sm leading-relaxed font-light">
              The premier decentralized intelligence and talent network. Connect with world-class engineers, AI builders, and creative visionaries through mathematical proof of merit.
            </p>
          </div>

          {/* Discover Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-[#F4F5F3] tracking-[0.2em] uppercase">Discover</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/explore" className="hover:text-[#73D8C4] transition-colors">Talent Directory</Link></li>
              <li><Link href="/projects" className="hover:text-[#73D8C4] transition-colors">Open Projects</Link></li>
              <li><Link href="/categories" className="hover:text-[#73D8C4] transition-colors">Categories</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#73D8C4] transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Community Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-[#F4F5F3] tracking-[0.2em] uppercase">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/auth/signup" className="hover:text-[#73D8C4] transition-colors">Become a Freelancer</Link></li>
              <li><Link href="/dashboard/client" className="hover:text-[#73D8C4] transition-colors">Hire Talent</Link></li>
              <li><Link href="/about" className="hover:text-[#73D8C4] transition-colors">About Gravitass</Link></li>
              <li><Link href="/messages" className="hover:text-[#73D8C4] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-[#F4F5F3] tracking-[0.2em] uppercase">Legal & Security</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#73D8C4] cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-[#73D8C4] cursor-pointer">Privacy Protocol</span></li>
              <li><span className="hover:text-[#73D8C4] cursor-pointer">Escrow Security</span></li>
              <li><span className="hover:text-[#73D8C4] cursor-pointer">Help Center</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Editorial Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#91A09E]/60">
          <p>© 2026 GRAVITASS Protocol. Built on Proof of Merit & Independent Gravity.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#91A09E] cursor-pointer">Decentralized Escrow</span>
            <span className="hover:text-[#91A09E] cursor-pointer">0–100 Transparency</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
