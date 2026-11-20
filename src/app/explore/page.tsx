'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Star, 
  ShieldCheck, 
  Zap, 
  ArrowUpDown,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FreelancerProfile, Category } from '@/types';
import { formatINR } from '@/lib/utils';
import FreelancerCard from '@/components/freelancers/FreelancerCard';
import { DEFAULT_NAV_CATEGORIES } from '@/components/layout/Navbar';

function ExploreTalentContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') || searchParams?.get('query') || '';
  const initialCat = searchParams?.get('category') || 'all';

  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_NAV_CATEGORIES);
  const [search, setSearch] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedBadge, setSelectedBadge] = useState('all');
  const [maxPriceINR, setMaxPriceINR] = useState(100000);
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(true);

  const catScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkCatScroll = () => {
    if (catScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = catScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkCatScroll();
    const handleResize = () => checkCatScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  const scrollCats = (direction: 'left' | 'right') => {
    if (catScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      catScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkCatScroll, 350);
    }
  };

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => { if (d.categories) setCategories(d.categories); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('query', search);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBadge !== 'all') params.set('verifiedOnly', 'true');
    if (maxPriceINR < 100000) params.set('maxPriceINR', maxPriceINR.toString());
    if (sortBy) params.set('sortBy', sortBy);

    fetch(`/api/freelancers?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.freelancers) setFreelancers(d.freelancers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedCategory, selectedBadge, maxPriceINR, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 relative">
      
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold text-[#73D8C4] uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Zap className="w-4 h-4" />
          <span>Verified Talent Directory</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F5F3] tracking-tight">
          Explore Elite Independent Specialists
        </h1>
        <p className="text-xs sm:text-sm text-[#91A09E] mt-2 max-w-2xl">
          Browse verified talent, top-rated engineers, AI architects, cinematic creators, and consultants. Guaranteed escrow protection and transparent INR pricing.
        </p>

        {/* Categories Pill Carousel with high visibility & scroll buttons */}
        <div className="mt-5 relative">
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-3 bg-gradient-to-r from-[#071011] via-[#071011]/90 to-transparent">
              <button
                type="button"
                onClick={() => scrollCats('left')}
                className="w-7 h-7 rounded-full bg-[#0B1719] hover:bg-[#73D8C4] border border-white/[0.2] hover:border-[#73D8C4] text-[#F4F5F3] hover:text-[#071011] flex items-center justify-center transition-all shadow-xl"
                title="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div
            ref={catScrollRef}
            onScroll={checkCatScroll}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth py-1 px-1"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-[#73D8C4] text-[#071011] border-[#73D8C4] shadow-[0_0_15px_rgba(115,216,196,0.35)]'
                  : 'bg-[#0E1E22] hover:bg-[#152E34] text-[#D8E5E2] hover:text-white border-white/[0.12] hover:border-[#73D8C4]/60'
              }`}
            >
              All Categories
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border shadow-sm ${
                  selectedCategory === c.slug
                    ? 'bg-[#73D8C4] text-[#071011] border-[#73D8C4] font-bold shadow-[0_0_15px_rgba(115,216,196,0.35)]'
                    : 'bg-[#0E1E22] hover:bg-[#152E34] text-[#D8E5E2] hover:text-white border-white/[0.12] hover:border-[#73D8C4]/60'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-3 bg-gradient-to-l from-[#071011] via-[#071011]/90 to-transparent">
              <button
                type="button"
                onClick={() => scrollCats('right')}
                className="w-7 h-7 rounded-full bg-[#0B1719] hover:bg-[#73D8C4] border border-white/[0.2] hover:border-[#73D8C4] text-[#F4F5F3] hover:text-[#071011] flex items-center justify-center transition-all shadow-xl"
                title="Scroll right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1719] border border-white/[0.08] mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#91A09E] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, service (e.g. Next.js, LangChain, Logo Design)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#071011] border border-white/[0.08] text-xs sm:text-sm text-[#F4F5F3] placeholder-[#91A09E] focus:outline-none focus:border-[#73D8C4] transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#071011] border border-white/[0.08] text-xs text-[#F4F5F3] focus:outline-none focus:border-[#73D8C4]"
            >
              <option value="all">All Service Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#071011] border border-white/[0.08] text-xs text-[#F4F5F3] focus:outline-none focus:border-[#73D8C4]"
            >
              <option value="recommended">Recommended (Merit Score)</option>
              <option value="top_rated">Top Rated (5.0 ★)</option>
              <option value="price_asc">Price: Low to High (₹)</option>
              <option value="price_desc">Price: High to Low (₹)</option>
              <option value="experience">Most Experienced</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>

        </div>

        {/* Secondary Filters: Quick badges & INR budget */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.06] text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#91A09E]">Tier:</span>
            {[
              { id: 'all', label: 'All Talent' },
              { id: 'verified', label: 'Verified Specialists' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBadge(b.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedBadge === b.id
                    ? 'bg-[#73D8C4]/20 text-[#73D8C4] border border-[#73D8C4]/40'
                    : 'text-[#91A09E] hover:text-[#F4F5F3] bg-white/[0.02]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Max INR Budget Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[#91A09E]">
              Max Budget: <strong className="text-[#73D8C4] font-bold">{formatINR(maxPriceINR)}</strong>
            </span>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={maxPriceINR}
              onChange={(e) => setMaxPriceINR(Number(e.target.value))}
              className="w-32 accent-[#73D8C4] cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* Freelancers Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#0B1719] border border-white/[0.06] animate-pulse p-6" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-[#0B1719] border border-white/[0.08]">
          <p className="text-base font-bold text-[#F4F5F3]">No talent found matching your criteria</p>
          <p className="text-xs text-[#91A09E] mt-1">Try broadening your search query, adjusting rates, or clearing filters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedBadge('all'); setMaxPriceINR(100000); setSortBy('recommended'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#73D8C4] text-[#071011] text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((f) => (
            <FreelancerCard key={f.id} freelancer={f} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExploreTalentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-[#91A09E]">
        <div className="inline-block w-8 h-8 border-2 border-[#73D8C4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExploreTalentContent />
    </Suspense>
  );
}
