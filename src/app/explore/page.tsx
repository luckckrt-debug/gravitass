'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Star, 
  Award, 
  SlidersHorizontal, 
  ShieldCheck, 
  Zap, 
  ArrowUpDown,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { FreelancerProfile, Category } from '@/types';
import { getBadgeDetails } from '@/lib/utils';

function ExploreTalentContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') || '';
  const initialCat = searchParams?.get('category') || 'all';

  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedBadge, setSelectedBadge] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [maxRate, setMaxRate] = useState(250);
  const [sortBy, setSortBy] = useState('score');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => { if (d.categories) setCategories(d.categories); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBadge !== 'all') params.set('badge', selectedBadge);
    if (minScore > 0) params.set('minScore', minScore.toString());
    if (maxRate < 250) params.set('maxRate', maxRate.toString());
    if (sortBy) params.set('sortBy', sortBy);

    fetch(`/api/freelancers?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.freelancers) setFreelancers(d.freelancers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedCategory, selectedBadge, minScore, maxRate, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 relative">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Zap className="w-4 h-4" />
          <span>Decentralized Talent Directory</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Verified Elite Professionals
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Discover top-tier engineers, designers, AI researchers, and builders ranked by verified merit scores.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skills (e.g. Next.js, LangChain, Three.js), or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="all">All Departments</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="score">Highest Merit Score (0-100)</option>
              <option value="rating">Top Client Rating</option>
              <option value="completed">Most Projects Completed</option>
              <option value="rate_low">Hourly Rate: Low to High</option>
              <option value="rate_high">Hourly Rate: High to Low</option>
            </select>
          </div>

        </div>

        {/* Secondary Filters: Badges & Sliders */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.06] text-xs">
          
          {/* Badges Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-gray-500 font-semibold uppercase tracking-wider mr-1">Badge:</span>
            {[
              { id: 'all', label: 'All Badges' },
              { id: 'elite_talent', label: 'Elite Talent' },
              { id: 'top_rated', label: 'Top Rated' },
              { id: 'rising_talent', label: 'Rising Talent' },
              { id: 'verified', label: 'Verified Pro' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBadge(b.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedBadge === b.id
                    ? 'bg-violet-600 text-white shadow-neon-violet'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Max Hourly Rate Filter */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Max Rate: <strong className="text-white">${maxRate}/hr</strong></span>
            <input
              type="range"
              min={30}
              max={250}
              step={10}
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-28 accent-violet-500 cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* Freelancers Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#121218] border border-white/[0.06] animate-pulse p-6" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-[#0B0B0F] border border-white/[0.08]">
          <p className="text-lg font-bold text-white">No talent found matching your criteria</p>
          <p className="text-xs text-gray-400 mt-1">Try broadening your search query, adjusting rates, or clearing filters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedBadge('all'); setMaxRate(250); }}
            className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((f) => {
            const primaryBadge = f.badges[0] || 'verified';
            const badgeStyle = getBadgeDetails(primaryBadge);

            return (
              <div
                key={f.id}
                className="p-6 rounded-2xl bg-[#121218] border border-white/[0.08] hover:border-violet-500/40 glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={f.avatarUrl}
                      alt={f.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-violet-500/30 flex-shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white truncate hover:text-violet-300">
                          <Link href={`/freelancers/${f.userId}`}>{f.fullName}</Link>
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}>
                          {badgeStyle.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{f.headline}</p>
                      
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-emerald-400" />
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

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {f.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.04] text-gray-300 border border-white/[0.06]"
                      >
                        {s}
                      </span>
                    ))}
                    {f.skills.length > 4 && (
                      <span className="text-[10px] text-gray-500 self-center">
                        +{f.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Location & Experience meta */}
                  <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      {f.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {f.yearsOfExperience} yrs exp
                    </span>
                  </div>
                </div>

                {/* Score & Action bar */}
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Rate</span>
                    <p className="text-sm font-extrabold text-white">
                      ${f.hourlyRate} <span className="text-[11px] font-normal text-gray-400">/hr</span>
                    </p>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Merit Score</span>
                    <p className="text-xs font-bold text-violet-400">
                      {f.performanceScore.overallScore} / 100
                    </p>
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
      )}
    </div>
  );
}

export default function ExploreTalentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExploreTalentContent />
    </Suspense>
  );
}
