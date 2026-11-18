'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Star,
  Users,
  Layers,
  ChevronDown
} from 'lucide-react';
import { FreelancerProfile, Project } from '@/types';
import CelestialSphereCanvas from '@/components/cinematic/CelestialSphereCanvas';
import EcosystemNetworkCanvas from '@/components/cinematic/EcosystemNetworkCanvas';
import InteractiveCategoryUniverse from '@/components/cinematic/InteractiveCategoryUniverse';
import CinematicTalentShowcase from '@/components/cinematic/CinematicTalentShowcase';
import PerformanceTrustVisualization from '@/components/cinematic/PerformanceTrustVisualization';
import DualPathwaysExperience from '@/components/cinematic/DualPathwaysExperience';

export default function CinematicHomePage() {
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Track window scroll progress for 3D sphere transformation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
          SCENE 1: CINEMATIC INTRODUCTION
          Full-screen hero with 3D organic sphere, mouse parallax, and asymmetric text
      ========================================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-16 px-6 sm:px-8 max-w-7xl mx-auto z-10">
        
        {/* 3D Celestial Sphere Canvas in background */}
        <CelestialSphereCanvas scrollProgress={scrollProgress} />

        {/* Hero Top: Label */}
        <div className="relative z-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0B1719]/60 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#73D8C4] shadow-[0_0_8px_#73D8C4]" />
            <span className="text-[10px] tracking-[0.25em] text-[#A5E8DE] uppercase font-light">
              THE FUTURE OF INDEPENDENT WORK
            </span>
          </div>
        </div>

        {/* Hero Middle: Asymmetric Editorial Composition */}
        <div className="relative z-10 py-12 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-[#F4F5F3] tracking-tight leading-[1.08]">
            We are the <span className="italic text-[#73D8C4] font-normal">gravity</span> <br />
            that connects talent <br />
            with <span className="text-[#A5E8DE]">opportunity.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#91A09E] mt-8 max-w-xl leading-relaxed font-light">
            A sanctuary for autonomous engineers, designers, researchers, and creators. Connect through mathematical proof of merit, cryptographic escrow, and uncompromised craftsmanship.
          </p>

          {/* Minimal Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-md">
            <div className="relative flex items-center p-1 rounded-full bg-[#0B1719]/80 border border-white/[0.1] focus-within:border-[#73D8C4]/60 backdrop-blur-xl transition-all shadow-2xl">
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
                className="px-5 py-2.5 rounded-full bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(115,216,196,0.3)] flex-shrink-0"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Hero Bottom: Floating Metrics & Subtle Scroll Prompt */}
        <div className="relative z-10 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-[#91A09E]">
          <div className="flex items-center gap-8 font-light">
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

          <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#91A09E]/70 animate-pulse">
            <span>Scroll to Enter Orbit</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

      </section>


      {/* =========================================================================
          SCENE 2: THE TRANSFORMATION
          The central sphere transforms into floating translucent fragments representing
          People, Talent, Creativity, Ideas, Skills, Opportunities.
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
              ].map((sym, i) => (
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
