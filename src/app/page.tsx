'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  CheckCircle, 
  Code2, 
  Cpu, 
  Palette, 
  Video, 
  Briefcase, 
  TrendingUp, 
  Award,
  Users,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { FreelancerProfile, Project, Category } from '@/types';
import { getBadgeDetails } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [freeRes, projRes, catRes] = await Promise.all([
          fetch('/api/freelancers?sortBy=score'),
          fetch('/api/projects?status=open'),
          fetch('/api/categories')
        ]);
        const freeData = await freeRes.json();
        const projData = await projRes.json();
        const catData = await catRes.json();

        if (freeData.freelancers) setFreelancers(freeData.freelancers);
        if (projData.projects) setProjects(projData.projects);
        if (catData.categories) setCategories(catData.categories);
      } catch (e) {
        console.error('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const featuredFreelancers = freelancers.slice(0, 3);
  const risingTalent = freelancers.filter(f => f.badges.includes('rising_talent')).slice(0, 3);
  const trendingProjects = projects.slice(0, 3);

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background Ambience & Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] radial-glow-violet blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-[450px] h-[450px] radial-glow-cyan blur-[130px] pointer-events-none -z-10" />

      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/30 text-xs font-semibold text-violet-300 shadow-neon-violet">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Decentralized Autonomous Talent Protocol</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
              <span className="block text-white">THE FUTURE OF</span>
              <span className="block bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent text-glow-violet">
                FREELANCE WORK.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Discover elite talent. Build extraordinary things. Direct escrow contracts, transparent 0-100 performance scores, and zero platform friction.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto lg:mx-0">
              <div className="relative flex items-center p-1.5 rounded-2xl bg-[#121218]/90 border border-white/[0.12] focus-within:border-violet-500/80 shadow-2xl transition-all">
                <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search freelancers by skill, title, or AI discipline..."
                  className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold flex items-center gap-2 shadow-neon-violet transition-all flex-shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-3 text-xs text-gray-400">
                <span className="text-gray-500 font-medium">Trending:</span>
                {['AI Agents', 'Next.js 14', 'Cybersecurity', 'Three.js 3D', 'Rust'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => router.push(`/explore?q=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-violet-600/20 hover:text-violet-300 border border-white/[0.06] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/explore"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-center text-sm shadow-neon-violet transition-all"
              >
                Find Elite Talent
              </Link>
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#121218] hover:bg-white/[0.08] text-gray-200 hover:text-white border border-white/[0.12] font-semibold text-center text-sm transition-all"
              >
                Start Freelancing
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Orb & Floating Profile Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px]">
            
            {/* Animated 3D Futuristic Orb Core */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer Orbit Rings */}
              <div className="absolute inset-0 rounded-full border border-violet-500/25 animate-pulse-ring" />
              <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-orb-spin" style={{ animationDirection: 'reverse', animationDuration: '28s' }} />
              
              {/* Core Orb Gradient */}
              <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-violet-700 via-purple-600 to-cyan-500 opacity-90 blur-[2px] shadow-[0_0_80px_rgba(139,92,246,0.6)] animate-pulse-slow flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full bg-[#09090F]/70 backdrop-blur-md flex flex-col items-center justify-center text-center p-4">
                  <Zap className="w-10 h-10 text-cyan-300 mb-2 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-violet-300">GRAVITASS CORE</span>
                  <span className="text-xl font-black text-white mt-0.5">0-100</span>
                  <span className="text-[11px] text-gray-300">Proof of Merit</span>
                </div>
              </div>
            </div>

            {/* Floating Profile Card 1 (Top Left) */}
            <div className="absolute -top-4 -left-4 sm:-left-8 p-3.5 rounded-2xl glass-panel shadow-2xl border border-white/[0.1] max-w-[210px] animate-float-slow hidden sm:block">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Elena Vance"
                  className="w-10 h-10 rounded-full object-cover border border-violet-500/40"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Elena Vance</p>
                  <p className="text-[10px] text-cyan-400 font-medium">AI Systems Architect</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400" /> 4.98
                </span>
                <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                  SCORE 97.4
                </span>
              </div>
            </div>

            {/* Floating Profile Card 2 (Bottom Right) */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 p-3.5 rounded-2xl glass-panel shadow-2xl border border-white/[0.1] max-w-[220px] animate-float-reverse hidden sm:block">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                  alt="Marcus Thorne"
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Marcus Thorne</p>
                  <p className="text-[10px] text-violet-400 font-medium">Cybersec & Rust</p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                <span className="text-gray-300 font-semibold">$135 / hr</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  VERIFIED PRO
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Platform Metric Statistics Banner */}
        <div className="mt-20 pt-10 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Contract Escrow Volume', value: '$14.8M+', change: '+44% YoY' },
            { label: 'Verified Project Completion', value: '99.4%', change: 'Zero disputes' },
            { label: 'Average Client Rating', value: '4.98 / 5.0', change: '10k+ verified reviews' },
            { label: 'Vetted Elite Professionals', value: '1,200+', change: 'Top 3% accepted' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
              <p className="text-xs font-medium text-gray-400 mt-1">{stat.label}</p>
              <p className="text-[11px] font-semibold text-cyan-400 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 2. POPULAR CATEGORIES ---------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Specialized Departments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore High-Performance Categories
            </h2>
          </div>
          <Link
            href="/categories"
            className="mt-4 md:mt-0 text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View all 10 categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.id}`}
              className="group p-5 rounded-2xl bg-[#121218] border border-white/[0.08] hover:border-violet-500/40 hover:bg-[#161620] transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-neon-violet transition-all">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-violet-300 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-gray-500">
                <span>{cat.freelancerCount || 50}+ Experts</span>
                <span className="text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">Browse →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- 3. FEATURED FREELANCERS ---------------- */}
      <section className="py-20 bg-[#0B0B0F]/60 border-t border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Verified Talent Network</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Featured Elite Freelancers
              </h2>
            </div>
            <Link
              href="/explore"
              className="mt-4 md:mt-0 text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Explore all talent</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredFreelancers.map((f) => {
              const primaryBadge = f.badges[0] || 'verified';
              const badgeStyle = getBadgeDetails(primaryBadge);

              return (
                <div
                  key={f.id}
                  className="p-6 rounded-2xl bg-[#121218] border border-white/[0.08] hover:border-violet-500/40 glass-panel-hover flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <img
                        src={f.avatarUrl}
                        alt={f.fullName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-violet-500/30"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-white truncate">{f.fullName}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}>
                            {badgeStyle.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{f.headline}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Star className="w-3 h-3 fill-emerald-400" />
                            {f.rating}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{f.completedProjectsCount} completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-300 mt-4 line-clamp-3 leading-relaxed">
                      {f.bio}
                    </p>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {f.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.04] text-gray-300 border border-white/[0.06]"
                        >
                          {skill}
                        </span>
                      ))}
                      {f.skills.length > 4 && (
                        <span className="text-[10px] text-gray-500 self-center">
                          +{f.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom metrics and View Profile */}
                  <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">Hourly Rate</span>
                      <p className="text-base font-extrabold text-white">${f.hourlyRate} <span className="text-xs font-normal text-gray-400">/hr</span></p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">Merit Score</span>
                      <p className="text-sm font-bold text-violet-400">{f.performanceScore.overallScore} / 100</p>
                    </div>

                    <Link
                      href={`/freelancers/${f.userId}`}
                      className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet transition-all"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- 4. TRENDING PROJECTS ---------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Live Opportunities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trending Open Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="mt-4 md:mt-0 text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Browse all projects</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingProjects.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-[#121218] border border-white/[0.08] hover:border-cyan-500/40 glass-panel-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                    {p.subcategory || p.category}
                  </span>
                  <span className="capitalize">{p.experienceLevel} level</span>
                </div>

                <h3 className="text-lg font-bold text-white mt-3 line-clamp-2 leading-snug hover:text-violet-300 transition-colors">
                  <Link href={`/projects/${p.id}`}>{p.title}</Link>
                </h3>

                <p className="text-xs text-gray-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {p.requiredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.04] text-gray-300 border border-white/[0.06]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {p.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </span>
                  <p className="text-sm font-bold text-emerald-400">
                    ${p.budgetMin.toLocaleString()} - ${p.budgetMax.toLocaleString()}
                  </p>
                </div>

                <Link
                  href={`/projects/${p.id}`}
                  className="px-4 py-2 rounded-xl bg-[#1a1a24] hover:bg-violet-600 hover:text-white border border-white/[0.1] text-xs font-semibold text-gray-200 transition-all"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 5. HOW GRAVITASS WORKS ---------------- */}
      <section className="py-24 bg-[#0B0B0F]/70 border-t border-b border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
              The Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              How GRAVITASS Works
            </h2>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Designed to eliminate middleman bloat and subjective gatekeeping with cryptographic merit, smart milestone escrow, and direct collaboration workspaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Discover or Post',
                desc: 'Browse verified talent portfolios with live demos or post high-budget technical specifications with precision requirements.',
                icon: Search
              },
              {
                step: '02',
                title: 'AI & Performance Scores',
                desc: 'Compare candidates with our transparent 0-100 merit formula factoring client review quality, delivery speed, and code quality.',
                icon: Sparkles
              },
              {
                step: '03',
                title: 'Escrow Workspace',
                desc: 'Collaborate inside a dedicated workspace with milestones, task roadmaps, instant messaging, and secure deliverable review.',
                icon: ShieldCheck
              },
              {
                step: '04',
                title: 'Instant Payouts & Proof',
                desc: 'Upon milestone satisfaction, escrow funds release instantly to the freelancer with permanent reputation tokens on the leaderboard.',
                icon: CheckCircle
              }
            ].map((card, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#121218] border border-white/[0.08] relative group hover:border-violet-500/40 transition-all"
              >
                <span className="text-4xl font-black text-white/[0.07] absolute top-4 right-4 group-hover:text-violet-500/20 transition-colors">
                  {card.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 6. TESTIMONIALS ---------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Client & Talent Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Trusted by Builders & Pioneers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "GRAVITASS completely changed how we staff our AI research sprints. The 0-100 performance score accurately predicted Elena's exceptional velocity. No fluff, just pure competence.",
              name: "David Chen",
              role: "VP Engineering, Aetheria Labs",
              avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80"
            },
            {
              quote: "As a senior security auditor, I was tired of platforms flooded with low-bid spam. On Gravitass, clients appreciate deep technical rigor, and payments release without arbitrary holds.",
              name: "Marcus Thorne",
              role: "Cybersecurity Specialist",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
            },
            {
              quote: "The project workspace is the cleanest I have ever used. Milestones, tasks, code repos, and chats live in one coherent dark interface. Hiring took under 24 hours.",
              name: "Amara Okonjo",
              role: "Founder, Horizon Spatial",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            }
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#121218] border border-white/[0.08] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06]">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/[0.1]"
                />
                <div>
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 7. DUAL CALL TO ACTION ---------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Hirer CTA */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-violet-950/40 via-[#121218] to-[#0B0B0F] border border-violet-500/30 relative overflow-hidden group shadow-neon-violet">
            <div className="space-y-4 relative z-10">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                For Hirers & Enterprises
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ready to Hire Top Tier Talent?
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
                Post your project in under 2 minutes. Receive verified proposals from vetted engineers and creative leads.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/client"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-neon-violet"
                >
                  <span>Post a Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Freelancer CTA */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-[#121218] to-[#0B0B0F] border border-cyan-500/30 relative overflow-hidden group shadow-neon-cyan">
            <div className="space-y-4 relative z-10">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                For Independent Talent
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Showcase Your Proof of Work
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
                Build your portfolio, climb the global leaderboard, and get matched with high-budget enterprise contracts.
              </p>
              <div className="pt-2">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-neon-cyan"
                >
                  <span>Join as Freelancer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
