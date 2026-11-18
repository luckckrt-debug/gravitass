'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Calendar, 
  Layers, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Project, Category } from '@/types';
import { formatDate } from '@/lib/utils';

function ProjectsDirectoryContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') || '';
  const initialCat = searchParams?.get('category') || 'all';

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [minBudget, setMinBudget] = useState(0);
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
    if (selectedLevel !== 'all') params.set('level', selectedLevel);
    if (minBudget > 0) params.set('minBudget', minBudget.toString());

    fetch(`/api/projects?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.projects) setProjects(d.projects);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedCategory, selectedLevel, minBudget]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Briefcase className="w-4 h-4" />
            <span>Open Engineering & Creative Contracts</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Find High-Velocity Projects
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Explore active client briefs with protected milestone escrow and direct client collaboration.
          </p>
        </div>

        <Link
          href="/dashboard/client"
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <span>Post a New Project</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, required tech stack, or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-gray-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Disciplines</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-gray-200 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate Level</option>
              <option value="expert">Expert Level</option>
            </select>
          </div>

        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#121218] border border-white/[0.06] animate-pulse p-6" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-[#0B0B0F] border border-white/[0.08]">
          <p className="text-base font-bold text-white">No projects found matching your criteria</p>
          <p className="text-xs text-gray-400 mt-1">Try clearing your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-[#121218] border border-white/[0.08] hover:border-violet-500/40 glass-panel-hover transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-medium">
                      {p.subcategory || p.category}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 capitalize">{p.experienceLevel} Tier</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">Posted {formatDate(p.createdAt)}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white hover:text-violet-300 transition-colors">
                    <Link href={`/projects/${p.id}`}>{p.title}</Link>
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 max-w-3xl leading-relaxed">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {p.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.04] text-gray-300 border border-white/[0.06]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Right Column: Budget, Proposals, Apply */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                      {p.budgetType === 'fixed' ? 'Fixed Escrow' : 'Hourly Rate'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-400">
                      ${p.budgetMin.toLocaleString()} - ${p.budgetMax.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {p.proposalsCount} proposals submitted
                    </span>
                  </div>

                  <Link
                    href={`/projects/${p.id}`}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet transition-all"
                  >
                    View & Apply
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default function ProjectsDirectoryPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProjectsDirectoryContent />
    </Suspense>
  );
}
