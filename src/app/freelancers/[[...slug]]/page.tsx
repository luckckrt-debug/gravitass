'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronRight, 
  Filter, 
  Star, 
  ShieldCheck, 
  Clock, 
  Search, 
  RotateCcw, 
  Sparkles, 
  Briefcase, 
  ArrowUpDown,
  Zap,
  MapPin,
  CheckCircle,
  X
} from 'lucide-react';
import { FreelancerProfile, Category, Review } from '@/types';
import { formatINR, slugify, unslugify } from '@/lib/utils';
import FreelancerCard from '@/components/freelancers/FreelancerCard';
import { DEFAULT_NAV_CATEGORIES } from '@/components/layout/Navbar';

interface PageProps {
  params: {
    slug?: string[];
  };
}

export default function FreelancersDiscoveryPage({ params }: PageProps) {
  const slug = params.slug || [];
  const isProfileView = slug.length === 1 && (slug[0].startsWith('profile-') || slug[0].startsWith('user-'));

  if (isProfileView) {
    return <FreelancerProfileDossier profileId={slug[0]} />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#071011] pt-36 text-center text-[#91A09E]">
        <div className="w-8 h-8 border-2 border-[#73D8C4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading marketplace talent...</p>
      </div>
    }>
      <FreelancerDiscoveryView slug={slug} />
    </Suspense>
  );
}

// =========================================================================
// 1. DISCOVERY & CATEGORY BROWSE VIEW
// =========================================================================
function FreelancerDiscoveryView({ slug }: { slug: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = slug.length > 0 ? slug[0] : '';
  const subcategorySlug = slug.length > 1 ? slug[1] : '';

  // State
  const [categories, setCategories] = useState<Category[]>(DEFAULT_NAV_CATEGORIES);
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active Category & Subcategory resolution
  const activeCategory = categories.find(
    c => c.slug.toLowerCase() === categorySlug.toLowerCase() || c.id.toLowerCase() === categorySlug.toLowerCase()
  );
  const activeSubcategoryName = subcategorySlug ? unslugify(subcategorySlug) : '';

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || searchParams.get('q') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [minPriceINR, setMinPriceINR] = useState<number>(Number(searchParams.get('minPriceINR')) || 500);
  const [maxPriceINR, setMaxPriceINR] = useState<number>(Number(searchParams.get('maxPriceINR')) || 100000);
  const [minRating, setMinRating] = useState<number>(Number(searchParams.get('minRating')) || 0);
  const [deliveryDays, setDeliveryDays] = useState<number>(Number(searchParams.get('deliveryDays')) || 0);
  const [availability, setAvailability] = useState<string>(searchParams.get('availability') || 'all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(searchParams.get('verifiedOnly') === 'true');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'recommended');

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch freelancers whenever filters or route change
  useEffect(() => {
    setLoading(true);
    const queryParts = new URLSearchParams();

    if (categorySlug) queryParts.set('category', categorySlug);
    if (activeSubcategoryName) queryParts.set('subcategory', activeSubcategoryName);
    if (searchQuery) queryParts.set('query', searchQuery);
    if (selectedSkill) queryParts.set('skill', selectedSkill);
    if (minPriceINR > 500) queryParts.set('minPriceINR', String(minPriceINR));
    if (maxPriceINR < 100000) queryParts.set('maxPriceINR', String(maxPriceINR));
    if (minRating > 0) queryParts.set('minRating', String(minRating));
    if (deliveryDays > 0) queryParts.set('deliveryDays', String(deliveryDays));
    if (availability && availability !== 'all') queryParts.set('availability', availability);
    if (verifiedOnly) queryParts.set('verifiedOnly', 'true');
    if (sortBy) queryParts.set('sortBy', sortBy);

    fetch(`/api/freelancers?${queryParts.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.freelancers) {
          setFreelancers(data.freelancers);
          setTotal(data.total || data.freelancers.length);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categorySlug, subcategorySlug, searchQuery, selectedSkill, minPriceINR, maxPriceINR, minRating, deliveryDays, availability, verifiedOnly, sortBy, activeSubcategoryName]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('');
    setMinPriceINR(500);
    setMaxPriceINR(100000);
    setMinRating(0);
    setDeliveryDays(0);
    setAvailability('all');
    setVerifiedOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-[#071011] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#91A09E] mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#73D8C4] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/freelancers" className="hover:text-[#73D8C4] transition-colors">Categories</Link>
          {activeCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <Link
                href={`/freelancers/${activeCategory.slug}`}
                className={`transition-colors ${!subcategorySlug ? 'text-[#73D8C4] font-semibold' : 'hover:text-[#73D8C4]'}`}
              >
                {activeCategory.name}
              </Link>
            </>
          )}
          {activeSubcategoryName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[#73D8C4] font-semibold">{activeSubcategoryName}</span>
            </>
          )}
        </nav>

        {/* Category Header / Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1719] via-[#0D1E21] to-[#0B1719] border border-white/[0.08] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#73D8C4]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#73D8C4] px-2.5 py-0.5 rounded-full bg-[#73D8C4]/10 border border-[#73D8C4]/30">
                {activeCategory ? activeCategory.name : 'Talent Ecosystem'}
              </span>
              {activeCategory?.isTrending && (
                <span className="text-[10px] font-bold uppercase text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  Trending High Demand
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F4F5F3] tracking-tight">
              {activeSubcategoryName 
                ? `${activeSubcategoryName} Specialists`
                : activeCategory 
                  ? activeCategory.name 
                  : 'Explore All Independent Specialists'}
            </h1>

            <p className="text-xs sm:text-sm text-[#91A09E] mt-2 leading-relaxed">
              {activeCategory?.description ||
                'Connect with verified elite freelancers, architects, designers, and AI specialists. Transparent INR pricing, protected milestone escrow, and guaranteed delivery standards.'}
            </p>
          </div>

          {/* Subcategory Pill Carousel for active category */}
          {activeCategory && (activeCategory.subcategories || []).length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <Link
                href={`/freelancers/${activeCategory.slug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  !subcategorySlug
                    ? 'bg-[#73D8C4] text-[#071011] shadow-[0_0_15px_rgba(115,216,196,0.4)]'
                    : 'bg-white/[0.04] text-[#D0DCD9] hover:bg-white/[0.08] hover:text-[#73D8C4]'
                }`}
              >
                All {activeCategory.name}
              </Link>
              {activeCategory.subcategories.map((sub, i) => {
                const subSlug = slugify(sub);
                const isSelected = subcategorySlug.toLowerCase() === subSlug.toLowerCase();
                return (
                  <Link
                    key={i}
                    href={`/freelancers/${activeCategory.slug}/${subSlug}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-[#73D8C4] text-[#071011] border-[#73D8C4] font-bold shadow-[0_0_15px_rgba(115,216,196,0.3)]'
                        : 'bg-[#071011]/60 text-[#91A09E] hover:text-[#F4F5F3] border-white/[0.06] hover:border-[#73D8C4]/40'
                    }`}
                  >
                    {sub}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Layout: Filter Sidebar & Talent Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar: Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 bg-[#0B1719] p-5 rounded-3xl border border-white/[0.08] h-fit sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs uppercase font-bold tracking-wider text-[#F4F5F3] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#73D8C4]" />
                Filters
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-[#91A09E] hover:text-[#73D8C4] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Keyword / Skill Search */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D0DCD9] uppercase tracking-wider mb-1.5">
                Search Skill or Keyword
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#91A09E] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. Next.js, Figma, SEO..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#071011] border border-white/[0.1] rounded-xl text-[#F4F5F3] focus:border-[#73D8C4] focus:outline-none"
                />
              </div>
            </div>

            {/* INR Budget Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-[#D0DCD9] uppercase tracking-wider">
                  INR (₹) Budget Range
                </label>
                <span className="text-[10px] text-[#73D8C4] font-bold">
                  {formatINR(minPriceINR)} - {formatINR(maxPriceINR)}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min={500}
                  max={100000}
                  step={500}
                  value={maxPriceINR}
                  onChange={e => setMaxPriceINR(Number(e.target.value))}
                  className="w-full accent-[#73D8C4] bg-white/[0.08] h-1.5 rounded-lg cursor-pointer"
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#071011] p-2 rounded-lg border border-white/[0.06]">
                    <span className="text-[9px] text-[#91A09E] block">Min</span>
                    <span className="text-[#F4F5F3] font-semibold">{formatINR(minPriceINR)}</span>
                  </div>
                  <div className="bg-[#071011] p-2 rounded-lg border border-white/[0.06]">
                    <span className="text-[9px] text-[#91A09E] block">Max</span>
                    <span className="text-[#F4F5F3] font-semibold">{formatINR(maxPriceINR)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D0DCD9] uppercase tracking-wider mb-1.5">
                Rating
              </label>
              <div className="space-y-1">
                {[
                  { label: 'Any Rating', value: 0 },
                  { label: '4.8 & Above ★', value: 4.8 },
                  { label: '4.5 & Above ★', value: 4.5 },
                  { label: '4.0 & Above ★', value: 4.0 }
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setMinRating(r.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      minRating === r.value
                        ? 'bg-[#73D8C4]/15 text-[#73D8C4] font-bold border border-[#73D8C4]/30'
                        : 'text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.02]'
                    }`}
                  >
                    <span>{r.label}</span>
                    {minRating === r.value && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Speed Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D0DCD9] uppercase tracking-wider mb-1.5">
                Delivery Time
              </label>
              <div className="space-y-1">
                {[
                  { label: 'Anytime', value: 0 },
                  { label: '⚡ Up to 24 Hours', value: 1 },
                  { label: '⚡ Up to 3 Days', value: 3 },
                  { label: '⚡ Up to 7 Days', value: 7 }
                ].map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDeliveryDays(d.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      deliveryDays === d.value
                        ? 'bg-[#73D8C4]/15 text-[#73D8C4] font-bold border border-[#73D8C4]/30'
                        : 'text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.02]'
                    }`}
                  >
                    <span>{d.label}</span>
                    {deliveryDays === d.value && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="pt-3 border-t border-white/[0.08]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#F4F5F3] block">Verified Specialists</span>
                  <span className="text-[10px] text-[#91A09E]">Identity & merit checked</span>
                </div>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={e => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#73D8C4] rounded cursor-pointer"
                />
              </label>
            </div>

          </div>

          {/* Right Main Area: Results Grid */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1719] p-4 rounded-2xl border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-[#73D8C4] flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                </button>
                <p className="text-xs text-[#91A09E]">
                  Showing <strong className="text-[#73D8C4]">{freelancers.length}</strong> verified specialist{freelancers.length === 1 ? '' : 's'}
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#91A09E] flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#73D8C4]" />
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#071011] border border-white/[0.1] text-xs text-[#F4F5F3] font-medium focus:border-[#73D8C4] focus:outline-none"
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

            {loading ? (
              <div className="py-24 text-center text-[#91A09E]">
                <div className="w-8 h-8 border-2 border-[#73D8C4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Locating elite marketplace talent...</p>
              </div>
            ) : freelancers.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0B1719] border border-white/[0.08] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#73D8C4]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#F4F5F3]">No Specialists Match Your Exact Criteria</h3>
                <p className="text-xs text-[#91A09E] max-w-md mx-auto leading-relaxed">
                  We could not find active freelancers matching this budget or filter set in {activeSubcategoryName || activeCategory?.name || 'this category'}. Try broadening your budget range or clearing some filters.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-full bg-[#73D8C4] text-[#071011] font-bold text-xs uppercase tracking-wider"
                  >
                    Reset Filters
                  </button>
                  {activeCategory && subcategorySlug && (
                    <Link
                      href={`/freelancers/${activeCategory.slug}`}
                      className="px-4 py-2 rounded-full bg-white/[0.04] text-[#F4F5F3] hover:text-[#73D8C4] border border-white/[0.08] text-xs font-semibold"
                    >
                      Browse All {activeCategory.name}
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {freelancers.map(freelancer => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-[#0B1719] border-l border-white/[0.1] h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#73D8C4]" />
                Filter Talent
              </span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-[#91A09E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#F4F5F3]">Max Budget</label>
                <span className="text-xs text-[#73D8C4] font-bold">{formatINR(maxPriceINR)}</span>
              </div>
              <input
                type="range"
                min={500}
                max={100000}
                step={500}
                value={maxPriceINR}
                onChange={e => setMaxPriceINR(Number(e.target.value))}
                className="w-full accent-[#73D8C4]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#F4F5F3] block mb-2">Rating</label>
              <div className="space-y-1">
                {[0, 4.0, 4.5, 4.8].map(r => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                      minRating === r ? 'bg-[#73D8C4] text-[#071011] font-bold' : 'text-[#91A09E]'
                    }`}
                  >
                    {r === 0 ? 'Any Rating' : `${r}+ Stars`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#73D8C4] text-[#071011] font-bold text-xs uppercase"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// 2. SINGLE FREELANCER PROFILE DOSSIER VIEW
// =========================================================================
function FreelancerProfileDossier({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/freelancers/${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile) setProfile(d.profile);
        if (d.reviews) setReviews(d.reviews);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071011] pt-36 text-center text-[#91A09E]">
        <div className="w-8 h-8 border-2 border-[#73D8C4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading verified talent dossier...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#071011] pt-36 text-center px-4">
        <h2 className="text-2xl font-bold text-[#F4F5F3]">Specialist Not Found</h2>
        <p className="text-xs text-[#91A09E] mt-2">The requested talent profile does not exist.</p>
        <Link href="/freelancers" className="mt-4 inline-block px-5 py-2 bg-[#73D8C4] text-[#071011] rounded-full text-xs font-bold">
          Explore Discovery Directory
        </Link>
      </div>
    );
  }

  const startingPrice = profile.startingPriceINR || (profile.minBudget ? profile.minBudget * 83 : 1500);

  return (
    <div className="min-h-screen bg-[#071011] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Hero Dossier */}
        <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#73D8C4]/50 shadow-[0_0_20px_rgba(115,216,196,0.3)]"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F3]">{profile.fullName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#73D8C4]/15 border border-[#73D8C4]/30 text-[#73D8C4]">
                    Verified Specialist
                  </span>
                </div>
                <p className="text-sm text-[#D0DCD9] font-medium">{profile.headline}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#91A09E] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#73D8C4]" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#73D8C4]" />
                    {profile.yearsOfExperience} yrs experience
                  </span>
                  <span className="flex items-center gap-1 text-[#73D8C4] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#73D8C4]" />
                    {profile.rating.toFixed(2)} ({profile.reviewCount || 12} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] uppercase text-[#91A09E] block">Starting at</span>
              <span className="text-2xl font-extrabold text-[#73D8C4]">{formatINR(startingPrice)}</span>
            </div>
          </div>
        </div>

        {/* Portfolio & Bio Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F5F3] mb-3">About the Specialist</h3>
              <p className="text-xs text-[#D0DCD9] leading-relaxed">{profile.bio}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F5F3] mb-4">Portfolio & Showcase</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(profile.portfolio || []).map(p => (
                  <div key={p.id} className="rounded-xl overflow-hidden bg-[#071011] border border-white/[0.06]">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-36 object-cover" />}
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-[#F4F5F3]">{p.title}</h4>
                      <p className="text-[11px] text-[#91A09E] line-clamp-2 mt-1">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0B1719] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F5F3]">Skills & Capabilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {(profile.skills || []).map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-[#91A09E]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
