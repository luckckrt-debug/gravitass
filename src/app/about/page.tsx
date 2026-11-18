'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Lock, 
  Users, 
  ArrowRight, 
  Award, 
  Cpu, 
  Compass, 
  CheckCircle2,
  TrendingUp,
  Globe2,
  Home
} from 'lucide-react';

export default function AboutPage() {
  const pillars = [
    {
      icon: Award,
      title: 'Mathematical Proof of Merit',
      badge: '0–100 Proof Engine',
      description: 'Traditional marketplaces allow fake reviews and pay-to-win profile boosts. GRAVITASS calculates an ungameable 0–100 Merit Score based on code audit depth, verified milestone completion rates, and cryptographic feedback.'
    },
    {
      icon: Lock,
      title: 'Cryptographic Escrow Security',
      badge: 'Milestone Protected',
      description: 'Client funds are locked securely in decentralized escrow vaults before work starts. Capital is released only when inspectable deliverables meet agreed specifications, protecting both parties unconditionally.'
    },
    {
      icon: Cpu,
      title: 'AI & Elite Technical Alignment',
      badge: 'Sovereign Specialists',
      description: 'A sanctuary for autonomous software architects, AI researchers, creative directors, and systems engineers. Direct encrypted collaboration terminals replace bloated agency layers.'
    },
    {
      icon: Globe2,
      title: 'Decentralized Sovereign Work',
      badge: 'Border-Free Protocol',
      description: 'Talent is universally distributed; corporate monopolies shouldn’t be the gatekeepers. GRAVITASS provides the global gravity that directly links premier builders with high-impact opportunities.'
    }
  ];

  const milestones = [
    {
      year: 'Phase 01',
      title: 'The Monolith Fracture',
      detail: 'Traditional consulting agencies take up to 50% margins while stalling innovation. GRAVITASS was conceptualized to give sovereign freelancers and ambitious clients direct, frictionless alignment.'
    },
    {
      year: 'Phase 02',
      title: 'Proof-of-Merit Engine',
      detail: 'Developed the deterministic 0–100 rating algorithm incorporating delivery timeliness, dispute-free records, complexity weighting, and verified client endorsements.'
    },
    {
      year: 'Phase 03',
      title: 'Multi-Milestone Escrow Vaults',
      detail: 'Introduced automated financial rails that eliminate non-payment risks for freelancers and non-delivery risks for clients worldwide.'
    },
    {
      year: 'Phase 04',
      title: 'Global Ecosystem Expansion',
      detail: 'Over $14.8M in milestone contracts completed with a 99.4% satisfaction index across 6 core technical and creative disciplines.'
    }
  ];

  const stats = [
    { label: 'ESCROW VOLUME SECURED', val: '$14.8M+', color: 'text-[#F4F5F3]' },
    { label: 'VERIFIED COMPLETION RATE', val: '99.4%', color: 'text-[#73D8C4]' },
    { label: 'GLOBAL SPECIALISTS', val: '2,400+', color: 'text-[#A5E8DE]' },
    { label: 'AVERAGE DISPUTE RATE', val: '< 0.3%', color: 'text-[#73D8C4]' }
  ];

  return (
    <div className="w-full bg-[#071011] text-[#F4F5F3] min-h-screen pt-28 sm:pt-32 pb-20 selection:bg-[#73D8C4] selection:text-[#020303] relative overflow-hidden">
      
      {/* Ambient Celestial Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#73D8C4]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-[#A5E8DE]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10 space-y-24">
        
        {/* =========================================================================
            HEADER & HERO SECTION
        ========================================================================= */}
        <div className="max-w-4xl space-y-6">
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.1] bg-[#0B1719]/80 hover:bg-[#0B1719] text-[#91A09E] hover:text-[#73D8C4] text-[11px] font-mono tracking-wider transition-all"
            >
              <Home className="w-3.5 h-3.5 text-[#73D8C4]" />
              <span>RETURN TO HOME</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-[#0B1719]/70 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#73D8C4] shadow-[0_0_8px_#73D8C4]" />
              <span className="text-[10px] tracking-[0.25em] text-[#A5E8DE] uppercase font-light">
                PROTOCOL ORIGIN & ARCHITECTURE
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-[#F4F5F3] tracking-tight leading-[1.08]">
            We are the gravity <br />
            that connects <span className="italic text-[#73D8C4] font-normal">talent</span> with <span className="text-[#A5E8DE] font-normal">opportunity.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#91A09E] max-w-2xl font-light leading-relaxed">
            GRAVITASS is a premier talent infrastructure built around mathematical merit, cryptographic escrow, and uncompromising craftsmanship. We replace agency markups and platform noise with direct access to vetted practitioners.
          </p>
        </div>

        {/* =========================================================================
            KEY PLATFORM METRICS
        ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] backdrop-blur-xl">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#91A09E]/70 font-mono block">
                {s.label}
              </span>
              <span className={`text-2xl sm:text-4xl font-bold font-mono tracking-tight ${s.color}`}>
                {s.val}
              </span>
            </div>
          ))}
        </div>

        {/* =========================================================================
            OUR CORE PILLARS
        ========================================================================= */}
        <div className="space-y-12">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block mb-2">
              FOUNDATIONAL PILLARS
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight">
              Why GRAVITASS Exists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((p, idx) => (
              <div 
                key={idx}
                className="p-8 sm:p-10 rounded-3xl bg-[#0B1719]/60 border border-white/[0.08] hover:border-[#73D8C4]/40 transition-all duration-300 space-y-5 group backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#73D8C4]/10 border border-[#73D8C4]/30 flex items-center justify-center text-[#73D8C4] group-hover:scale-110 transition-transform">
                    <p.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-white/[0.04] text-[#A5E8DE] border border-white/[0.08]">
                    {p.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif text-[#F4F5F3]">
                  {p.title}
                </h3>

                <p className="text-sm text-[#91A09E] leading-relaxed font-light">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            HOW GRAVITASS PROTECTS CLIENTS & FREELANCERS
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0B1719] via-[#071011] to-[#04090A] border border-[#73D8C4]/20 relative overflow-hidden">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block">
              SYMMETRICAL PROTECTION
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif text-[#F4F5F3] leading-tight">
              Neither party risks their capital <br />
              <span className="italic text-[#A5E8DE] font-light">or their craft.</span>
            </h2>

            <div className="space-y-4 text-sm text-[#91A09E] font-light">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#73D8C4] mt-1 flex-shrink-0" />
                <p><strong className="text-[#F4F5F3] font-medium">For Clients:</strong> Zero upfront risk. Payments remain buffered in escrow and are released only after you test and inspect milestone deliverables.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#A5E8DE] mt-1 flex-shrink-0" />
                <p><strong className="text-[#F4F5F3] font-medium">For Freelancers:</strong> Guaranteed payment. Never begin development on promises. Work commences only after the client deposits funds into the verified milestone escrow.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#73D8C4] mt-1 flex-shrink-0" />
                <p><strong className="text-[#F4F5F3] font-medium">Neutral Resolution:</strong> Transparent technical arbitration with access to timestamped contract checkpoints and encrypted workrooms.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#071011]/90 border border-white/[0.08] space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#73D8C4] uppercase block">
              WORKFLOW INTEGRITY
            </span>
            <div className="space-y-3 font-mono text-xs text-[#91A09E]">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                <span>1. Agreement & Specs</span>
                <span className="text-[#73D8C4]">LOCKED</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                <span>2. Escrow Deposit</span>
                <span className="text-[#73D8C4]">FUNDED</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                <span>3. Build & Deliver</span>
                <span className="text-[#A5E8DE]">INSPECTED</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                <span>4. Payout Release</span>
                <span className="text-[#73D8C4]">INSTANT</span>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            PROTOCOL ROADMAP
        ========================================================================= */}
        <div className="space-y-12">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block mb-2">
              EVOLUTION & MILESTONES
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight">
              The Protocol Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-[#0B1719]/40 border border-white/[0.06] hover:border-[#73D8C4]/30 transition-all space-y-3"
              >
                <span className="text-xs font-mono text-[#73D8C4] font-semibold tracking-wider">
                  {m.year}
                </span>
                <h3 className="text-base font-semibold text-[#F4F5F3]">
                  {m.title}
                </h3>
                <p className="text-xs text-[#91A09E] leading-relaxed font-light">
                  {m.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            CALL TO ACTION
        ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-8 py-12">
          <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight">
            Ready to experience the future <br />
            <span className="italic text-[#73D8C4] font-light">of independent work?</span>
          </h2>

          <p className="text-sm text-[#91A09E] font-light max-w-lg mx-auto">
            Join thousands of premier developers, designers, and hiring clients operating with mathematical certainty and zero gatekeeping.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/[0.15] bg-[#0B1719] hover:bg-[#0B1719]/80 text-[#F4F5F3] hover:text-[#73D8C4] text-xs tracking-[0.16em] uppercase font-medium transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-[#73D8C4]" />
              <span>Explore Homepage</span>
            </Link>

            <Link
              href="/explore"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs tracking-[0.16em] uppercase font-semibold transition-all shadow-[0_0_20px_rgba(115,216,196,0.35)] flex items-center justify-center gap-2"
            >
              <span>Discover Talent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
