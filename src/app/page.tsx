'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FreelancerProfile } from '@/types';
import FixedIntroSphereCanvas from '@/components/cinematic/FixedIntroSphereCanvas';
import EcosystemNetworkCanvas from '@/components/cinematic/EcosystemNetworkCanvas';
import InteractiveCategoryUniverse from '@/components/cinematic/InteractiveCategoryUniverse';
import CinematicTalentShowcase from '@/components/cinematic/CinematicTalentShowcase';
import PerformanceTrustVisualization from '@/components/cinematic/PerformanceTrustVisualization';
import DualPathwaysExperience from '@/components/cinematic/DualPathwaysExperience';

// Register GSAP ScrollTrigger plugin on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CinematicHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Intro Pinned Timeline Refs
  const introWrapperRef = useRef<HTMLDivElement>(null);
  const introPinRef = useRef<HTMLDivElement>(null);
  const introProgressRef = useRef<number>(0);
  const scrollPromptRef = useRef<HTMLDivElement>(null);
  const contentOverlayRef = useRef<HTMLDivElement>(null);
  const brandTagRef = useRef<HTMLDivElement>(null);
  const brandNameRef = useRef<HTMLDivElement>(null);
  const mainHeadlineRef = useRef<HTMLDivElement>(null);
  const subHeadlineRef = useRef<HTMLDivElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);
  const bottomMetricsRef = useRef<HTMLDivElement>(null);

  // Single Fixed Full-Screen GSAP ScrollTrigger Pinning & Orchestration
  useEffect(() => {
    if (!introPinRef.current || !introWrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Coordinated master timeline scrubbed across pinned distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: introPinRef.current,
          start: 'top top',
          end: '+=2200',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          onUpdate: (self) => {
            introProgressRef.current = self.progress;
          }
        }
      });

      // 1. Initial State: "SCROLL TO EXPLORE" indicator fades out immediately on first scroll
      tl.to(scrollPromptRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.10,
        ease: 'power1.out'
      }, 0);

      // 2. Protocol Badge (fades in as sphere begins opening, ~0.42 to 0.56)
      tl.fromTo(brandTagRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' },
        0.42
      );

      // 3. GRAVITASS Brand Label (fades in as cluster forms, ~0.50 to 0.65)
      tl.fromTo(brandNameRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' },
        0.50
      );

      // 4. Main Headline: "Where talent meets opportunity." (~0.58 to 0.74)
      tl.fromTo(mainHeadlineRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' },
        0.58
      );

      // 5. Supporting Text: "Discover exceptional freelancers. Build something extraordinary." (~0.70 to 0.84)
      tl.fromTo(subHeadlineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' },
        0.70
      );

      // 6. Action Buttons & Search (~0.78 to 0.90)
      tl.fromTo(ctaButtonsRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' },
        0.78
      );

      // 7. Bottom Verified Metrics (~0.82 to 0.92)
      tl.fromTo(bottomMetricsRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.10, ease: 'power2.out' },
        0.82
      );

      // 8. Intro Completion Hand-off (~0.94 to 1.00)
      // Content gently dissolves as the pin releases smoothly into Scene 2
      tl.to(contentOverlayRef.current, {
        opacity: 0,
        duration: 0.06,
        ease: 'power1.in'
      }, 0.94);

    }, introWrapperRef);

    return () => ctx.revert();
  }, []);

  // Fetch real talent from database
  useEffect(() => {
    fetch('/api/freelancers?sortBy=score')
      .then(res => res.json())
      .then(data => {
        if (data.freelancers) setFreelancers(data.freelancers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  return (
    <div className="w-full bg-[#071011] text-[#F4F5F3] relative overflow-hidden selection:bg-[#73D8C4] selection:text-[#020303]">
      
      {/* =========================================================================
          STEP 1 TO 6: SINGLE FIXED FULL-SCREEN PINNED INTRO EXPERIENCE
          - Viewport remains completely locked & pinned to this screen.
          - Closed sphere centered on initial load with "SCROLL TO EXPLORE".
          - Scrolling scrub-progresses the opening sequence, glass cluster formation,
            and GRAVITASS headline reveal inside this fixed viewport.
          - Only upon completion (100% progress) does scrolling unlock to the next section.
      ========================================================================= */}
      <div ref={introWrapperRef} className="relative w-full">
        <div 
          ref={introPinRef} 
          className="relative w-full h-screen overflow-hidden bg-[#071011] flex flex-col justify-between"
        >
          {/* Hardware-Accelerated 3D WebGL Canvas */}
          <FixedIntroSphereCanvas progressRef={introProgressRef} />

          {/* STEP 1: INITIAL STATE PROMPT (Fades out immediately on first scroll) */}
          <div 
            ref={scrollPromptRef}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 pointer-events-none transition-transform duration-200"
          >
            <span className="text-[10px] tracking-[0.35em] uppercase text-[#91A09E]/90 font-light">
              SCROLL TO EXPLORE
            </span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[#73D8C4] via-[#73D8C4]/60 to-transparent animate-pulse" />
          </div>

          {/* PINNED CONTENT OVERLAY (Anchored inside the fixed viewport) */}
          <div 
            ref={contentOverlayRef}
            className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-between pt-24 pb-10 pointer-events-none"
          >
            {/* Top Protocol Tag */}
            <div ref={brandTagRef} className="opacity-0 pt-2 pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-[#0B1719]/70 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#73D8C4] shadow-[0_0_8px_#73D8C4]" />
                <span className="text-[10px] tracking-[0.25em] text-[#A5E8DE] uppercase font-light">
                  THE FUTURE OF INDEPENDENT WORK
                </span>
              </div>
            </div>

            {/* Center Editorial Headlines (Revealed when glass cluster forms) */}
            <div className="my-auto max-w-3xl space-y-5">
              
              {/* Brand Label */}
              <div ref={brandNameRef} className="opacity-0">
                <span className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#73D8C4] font-medium block">
                  GRAVITASS
                </span>
              </div>

              {/* Main Headline */}
              <div ref={mainHeadlineRef} className="opacity-0">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-[#F4F5F3] tracking-tight leading-[1.06]">
                  Where talent <br />
                  <span className="italic text-[#73D8C4] font-normal">meets opportunity.</span>
                </h1>
              </div>

              {/* Supporting Text */}
              <div ref={subHeadlineRef} className="opacity-0">
                <p className="text-lg sm:text-2xl text-[#F4F5F3] font-light leading-snug">
                  Discover exceptional freelancers. <br />
                  <span className="text-[#A5E8DE]">Build something extraordinary.</span>
                </p>
              </div>

              {/* Action Buttons & Minimal Search */}
              <div ref={ctaButtonsRef} className="opacity-0 pt-3 space-y-5 pointer-events-auto">
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/explore"
                    className="px-8 py-3.5 rounded-full bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs tracking-[0.2em] uppercase font-semibold flex items-center gap-2.5 transition-all shadow-[0_0_24px_rgba(115,216,196,0.4)] group"
                  >
                    <span>EXPLORE TALENT</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/auth/signup"
                    className="px-8 py-3.5 rounded-full border border-white/[0.18] bg-[#0B1719]/80 hover:bg-[#0B1719] hover:border-[#73D8C4]/60 text-[#F4F5F3] hover:text-[#73D8C4] text-xs tracking-[0.2em] uppercase font-medium transition-all backdrop-blur-md"
                  >
                    <span>START YOUR JOURNEY</span>
                  </Link>
                </div>

                <form onSubmit={handleSearchSubmit} className="max-w-md">
                  <div className="relative flex items-center p-1 rounded-full bg-[#0B1719]/85 border border-white/[0.12] focus-within:border-[#73D8C4]/70 backdrop-blur-xl transition-all shadow-2xl">
                    <Search className="w-4 h-4 text-[#91A09E] ml-4 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search discipline, skill, or specialist..."
                      className="w-full bg-transparent px-3 py-2 text-xs text-[#F4F5F3] placeholder-[#91A09E]/60 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-[#73D8C4]/20 hover:bg-[#73D8C4] text-[#73D8C4] hover:text-[#020303] text-[11px] tracking-wider uppercase font-semibold transition-all flex-shrink-0"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Bottom Row: Verified Platform Metrics */}
            <div 
              ref={bottomMetricsRef} 
              className="opacity-0 border-t border-white/[0.06] pt-4 flex flex-wrap items-center gap-8 text-xs text-[#91A09E] pointer-events-auto"
            >
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#91A09E]/60 block">ESCROW VOLUME</span>
                <span className="text-sm font-semibold text-[#F4F5F3] font-mono">$14.8M+</span>
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#91A09E]/60 block">VERIFIED COMPLETION</span>
                <span className="text-sm font-semibold text-[#73D8C4] font-mono">99.4%</span>
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#91A09E]/60 block">GLOBAL MERIT</span>
                <span className="text-sm font-semibold text-[#A5E8DE] font-mono">0–100 PROOF</span>
              </div>
            </div>

          </div>
        </div>
      </div>


      {/* =========================================================================
          SCENE 2: THE TRANSFORMATION (Revealed ONLY after Intro completes)
          When scrolling unlocks, the page moves naturally into the rest of the website.
      ========================================================================= */}
      <section className="relative py-32 px-6 sm:px-8 max-w-7xl mx-auto z-10 border-t border-white/[0.05]">
        
        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block">
              THE FRAGMENTATION OF MONOLITHS
            </span>

            <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight leading-tight">
              Talent is everywhere. <br />
              <span className="italic font-light text-[#73D8C4]">Opportunity should be too.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#91A09E] max-w-xl leading-relaxed font-light">
              When rigid corporate structures break apart, what remains is pure sovereign capability: engineers, architects, designers, and innovators unbound by geographic boundaries or artificial gatekeeping.
            </p>
          </div>

          {/* Symbolic Floating Orbit Constellation */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[320px]">
            {/* Concentric Geometric Rings */}
            <div className="w-72 h-72 rounded-full border border-[#73D8C4]/20 absolute flex items-center justify-center animate-spin-very-slow">
              <div className="w-52 h-52 rounded-full border border-white/[0.08] absolute" />
            </div>

            {/* Floating Talent Symbol Pills */}
            <div className="relative z-10 grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { label: 'PEOPLE', color: 'border-[#73D8C4]/40 text-[#73D8C4]' },
                { label: 'TALENT', color: 'border-white/[0.15] text-[#F4F5F3]' },
                { label: 'CREATIVITY', color: 'border-[#A5E8DE]/40 text-[#A5E8DE]' },
                { label: 'IDEAS', color: 'border-white/[0.15] text-[#91A09E]' },
                { label: 'SKILLS', color: 'border-[#73D8C4]/40 text-[#73D8C4]' },
                { label: 'OPPORTUNITIES', color: 'border-white/[0.15] text-[#F4F5F3]' },
              ].map((sym) => (
                <div
                  key={sym.label}
                  className={`p-3 rounded-2xl bg-[#0B1719]/80 border ${sym.color} text-center backdrop-blur-md transition-transform duration-300 hover:scale-105`}
                >
                  <span className="text-[10px] tracking-[0.2em] uppercase font-mono font-medium block">
                    {sym.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>


      {/* =========================================================================
          SCENE 3: THE GRAVITASS ECOSYSTEM
          Floating glass-like spheres representing Video, Design, Code, AI, Business.
      ========================================================================= */}
      <section className="relative py-36 px-6 sm:px-8 max-w-7xl mx-auto z-10">
        
        {/* Interactive 3D Ecosystem Canvas */}
        <EcosystemNetworkCanvas />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block">
            THE CONNECTED UNIVERSE
          </span>

          <h2 className="text-3xl sm:text-6xl font-serif text-[#F4F5F3] tracking-tight leading-tight">
            An ecosystem of people. <br />
            <span className="italic font-light text-[#A5E8DE]">A universe of possibilities.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#91A09E] leading-relaxed max-w-2xl mx-auto font-light">
            GRAVITASS connects ambitious businesses, creators, independent professionals, and innovators with the talent they need to build extraordinary things.
          </p>
        </div>

        {/* Subtle Node Legends */}
        <div className="relative z-10 mt-20 pt-10 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {[
            { label: 'AI & Automation', count: '94 Researchers' },
            { label: 'Code & Tech', count: '156 Architects' },
            { label: 'Design & Visual', count: '120 Designers' },
            { label: 'Video & Motion', count: '88 Directors' },
            { label: 'Business & Ops', count: '52 Executives' },
            { label: 'Audio & Music', count: '45 Composers' },
          ].map((item, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-[#0B1719]/50 border border-white/[0.05]">
              <span className="text-xs text-[#F4F5F3] font-medium block">{item.label}</span>
              <span className="text-[10px] text-[#73D8C4] font-mono mt-0.5 block">{item.count}</span>
            </div>
          ))}
        </div>

      </section>


      {/* =========================================================================
          SCENE 4: OUR VALUE PROPOSITION
          Minimal editorial section: Left statement, Right planetary geometry & links
      ========================================================================= */}
      <section className="relative py-32 px-6 sm:px-8 max-w-7xl mx-auto z-10 border-t border-white/[0.05]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Our Purpose & Large Statement */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block">
              OUR PURPOSE
            </span>

            <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight leading-tight">
              Great work happens <br />
              when the right people <br />
              <span className="italic font-light text-[#73D8C4]">find each other.</span>
            </h2>

            <p className="text-sm text-[#91A09E] leading-relaxed max-w-lg font-light">
              GRAVITASS is a talent marketplace built around skills, creativity, trust, and performance. We replace guesswork and agency markups with direct access to vetted practitioners.
            </p>
          </div>

          {/* Right: Thin geometric orbit circles & proposition pillar */}
          <div className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] relative overflow-hidden backdrop-blur-xl space-y-6">
            <div className="space-y-4 text-xs font-light text-[#91A09E]">
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#73D8C4] mt-1.5 flex-shrink-0" />
                <p><strong className="text-[#F4F5F3] font-normal">Discover professionals:</strong> Evaluate past deliverables, code repositories, and mathematical merit rankings.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A5E8DE] mt-1.5 flex-shrink-0" />
                <p><strong className="text-[#F4F5F3] font-normal">Create opportunities:</strong> Fund protected milestones where payments release only upon inspected approval.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#73D8C4] mt-1.5 flex-shrink-0" />
                <p><strong className="text-[#F4F5F3] font-normal">Build together:</strong> Direct encrypted project terminals for frictionless technical alignment.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[#73D8C4] hover:text-[#A5E8DE] font-semibold transition-colors"
              >
                <span>Discover Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SCENE 5: EXPLORE THE CATEGORIES
          Large typography-driven interactive list (01 to 08) with live previews
      ========================================================================= */}
      <section className="relative py-32 px-6 sm:px-8 max-w-7xl mx-auto z-10 border-t border-white/[0.05]">
        <div className="mb-12">
          <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block mb-2">
            TAXONOMY OF EXPERTISE
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight">
            Explore the Disciplines
          </h2>
        </div>

        <InteractiveCategoryUniverse />
      </section>


      {/* =========================================================================
          SCENE 6: TALENT
          Cinematic horizontal scrolling talent showcase with verified scores & portfolios
      ========================================================================= */}
      <section className="relative py-32 px-6 sm:px-8 max-w-7xl mx-auto z-10 border-t border-white/[0.05]">
        <CinematicTalentShowcase freelancers={freelancers} />
      </section>


      {/* =========================================================================
          SCENE 7: PERFORMANCE & TRUST
          "Reputation is built. Not claimed."
          Mathematical 0-100 merit formula breakdown
      ========================================================================= */}
      <section className="relative py-32 px-6 sm:px-8 max-w-7xl mx-auto z-10 border-t border-white/[0.05]">
        <PerformanceTrustVisualization />
      </section>


      {/* =========================================================================
          SCENE 8: HOW IT WORKS
          Two distinct pathways for Clients and Freelancers
      ========================================================================= */}
      <section className="relative py-32 px-6 sm:px-8 max-w-7xl mx-auto z-10 border-t border-white/[0.05]">
        <DualPathwaysExperience />
      </section>


      {/* =========================================================================
          SCENE 9: COMMUNITY & OPPORTUNITY
          Unexpected background color transition to deep atmospheric obsidian teal
      ========================================================================= */}
      <section className="relative py-36 px-6 sm:px-8 my-12 z-10 bg-gradient-to-b from-[#071011] via-[#051C1A] to-[#020303] border-y border-[#73D8C4]/20 overflow-hidden">
        
        {/* Subtle Ambient Mist */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#73D8C4]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <span className="text-xs tracking-[0.3em] text-[#73D8C4] uppercase font-semibold block">
            GRAVITATIONAL CONVERGENCE
          </span>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-[#F4F5F3] tracking-tight leading-tight">
            Your next opportunity <br />
            <span className="italic font-light text-[#A5E8DE]">could change everything.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#91A09E] max-w-xl mx-auto leading-relaxed font-light">
            Whether you are building the next foundational platform or seeking contracts worthy of your highest abilities, enter the network today.
          </p>

          {/* Two Clear Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Link
              href="/projects"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#73D8C4]/50 bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs tracking-[0.16em] uppercase font-semibold transition-all shadow-[0_0_25px_rgba(115,216,196,0.35)]"
            >
              Find Your Next Project
            </Link>

            <Link
              href="/dashboard/client"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/[0.15] bg-[#071011]/80 hover:bg-[#071011] text-[#F4F5F3] hover:text-[#73D8C4] text-xs tracking-[0.16em] uppercase font-medium transition-all"
            >
              Hire Exceptional Talent
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
}
