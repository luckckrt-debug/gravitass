'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Award, 
  Star, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  Flame
} from 'lucide-react';
import { FreelancerProfile, Category } from '@/types';
import { getBadgeDetails } from '@/lib/utils';

interface RankedFreelancer extends FreelancerProfile {
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<RankedFreelancer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('global');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    if (selectedFilter) params.set('filter', selectedFilter);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);

    fetch(`/api/leaderboard?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.leaderboard) setLeaderboard(d.leaderboard);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedFilter, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 relative">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Trophy className="w-3.5 h-3.5" />
          <span>Real-Time Decentralized Merit Rankings</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          GRAVITASS Global Leaderboard
        </h1>
        <p className="text-sm text-gray-400">
          Rankings computed dynamically from verified on-chain and milestone completion telemetry, client feedback scores, and architectural rigor.
        </p>
      </div>

      {/* Filter Tabs Bar */}
      <div className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Main Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'global', label: 'Global Merit Rank' },
              { id: 'top_rated', label: 'Top Rated Pros' },
              { id: 'rising_talent', label: 'Rising Talent' },
              { id: 'most_hired', label: 'Most Hired' },
              { id: 'best_completion', label: '100% Completion Rate' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-neon-violet'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-gray-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Departments</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#121218] border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#0B0B0F] border border-white/[0.08]">
          <p className="text-base font-bold text-white">No talent matching current filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((f) => {
            const isTop3 = f.rank <= 3;
            const primaryBadge = f.badges[0] || 'verified';
            const badgeStyle = getBadgeDetails(primaryBadge);

            return (
              <div
                key={f.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#121218] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isTop3
                    ? 'border-violet-500/40 shadow-neon-violet bg-gradient-to-r from-[#121218] via-[#151522] to-[#121218]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {/* Left: Rank & Avatar & Details */}
                <div className="flex items-center gap-4 flex-1">
                  
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    f.rank === 1
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : f.rank === 2
                      ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                      : f.rank === 3
                      ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                      : 'bg-white/[0.04] text-gray-400'
                  }`}>
                    #{f.rank}
                  </div>

                  {/* Profile Picture */}
                  <img
                    src={f.avatarUrl}
                    alt={f.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-violet-500/30 flex-shrink-0"
                  />

                  {/* Name and Headline */}
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white hover:text-violet-300 truncate">
                        <Link href={`/freelancers/${f.userId}`}>{f.fullName}</Link>
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}>
                        {badgeStyle.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{f.headline}</p>
                  </div>
                </div>

                {/* Middle: Performance Metric Pillars */}
                <div className="flex items-center gap-6 sm:gap-8 justify-between md:justify-end text-xs">
                  
                  <div className="text-center">
                    <span className="text-[10px] uppercase text-gray-500 block">Rating</span>
                    <span className="font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-emerald-400" />
                      {f.rating}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase text-gray-500 block">Delivered</span>
                    <span className="font-extrabold text-white">
                      {f.completedProjectsCount} projects
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase text-gray-500 block">Rate</span>
                    <span className="font-extrabold text-gray-300">
                      ${f.hourlyRate}/hr
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-500 block">Merit Score</span>
                    <span className="text-base font-black text-violet-400">
                      {f.performanceScore.overallScore} <span className="text-[10px] text-gray-500">/ 100</span>
                    </span>
                  </div>

                  <Link
                    href={`/freelancers/${f.userId}`}
                    className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet transition-all"
                  >
                    View
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
