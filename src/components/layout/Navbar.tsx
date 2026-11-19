'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Briefcase, 
  User, 
  ShieldCheck, 
  LogOut, 
  ArrowRightLeft,
  Bell,
  MessageSquare,
  Search,
  Sparkles,
  Zap,
  Palette,
  Code2,
  TrendingUp,
  Video,
  FileText,
  Headphones,
  Cpu,
  BarChart3,
  Compass,
  Camera,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Category, Notification, SearchSuggestionsResult } from '@/types';
import { formatINR, slugify } from '@/lib/utils';

// Icon mapping for dynamic category icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Palette,
  Code2,
  TrendingUp,
  Video,
  FileText,
  Headphones,
  Briefcase,
  Cpu,
  BarChart3,
  Compass,
  Camera,
  Sparkles,
  Flame
};

export const DEFAULT_NAV_CATEGORIES: Category[] = [
  {
    id: 'trending',
    name: 'Trending',
    slug: 'trending',
    description: 'Fastest-growing services and viral freelancer capabilities dominating the ecosystem.',
    icon: 'Zap',
    isTrending: true,
    isFeatured: true,
    order: 1,
    subcategories: [
      'AI Agents', 'Next.js Development', 'Full Stack Development', 'UI/UX Design',
      '3D Animation', 'Video Editing', 'Search Engine Optimization', 'Logo Design',
      'Python Development', 'Cybersecurity', 'Generative AI', 'Performance Marketing'
    ],
    projectCount: 65,
    freelancerCount: 210,
    isActive: true
  },
  {
    id: 'graphics-design',
    name: 'Graphics & Design',
    slug: 'graphics-design',
    description: 'High-impact visual identity, spatial UI/UX, 3D assets and world-class branding.',
    icon: 'Palette',
    isFeatured: true,
    order: 2,
    subcategories: [
      'Logo Design', 'Brand Identity', 'Business Cards', 'UI/UX Design',
      'Website Design', 'App Design', 'Social Media Design', 'Banner Design',
      'Packaging Design', 'Illustration', '3D Design', 'Presentation Design', 'Print Design'
    ],
    projectCount: 48,
    freelancerCount: 164,
    isActive: true
  },
  {
    id: 'programming-tech',
    name: 'Programming & Tech',
    slug: 'programming-tech',
    description: 'Custom software engineering, cloud infrastructures, full-stack web and mobile apps.',
    icon: 'Code2',
    isFeatured: true,
    order: 3,
    subcategories: [
      'Website Development', 'Frontend Development', 'Backend Development', 'Full Stack Development',
      'React Development', 'Next.js Development', 'WordPress Development', 'Shopify Development',
      'E-commerce Development', 'Mobile App Development', 'Android Development', 'iOS Development',
      'Python Development', 'Java Development', 'Software Development', 'API Integration',
      'Database Development', 'Cybersecurity', 'Cloud & DevOps'
    ],
    projectCount: 82,
    freelancerCount: 295,
    isActive: true
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Data-backed customer acquisition, omni-channel campaigns and viral growth funnels.',
    icon: 'TrendingUp',
    isFeatured: true,
    order: 4,
    subcategories: [
      'Search Engine Optimization', 'Social Media Marketing', 'Google Ads', 'Meta Ads',
      'YouTube Marketing', 'Email Marketing', 'Content Marketing', 'Influencer Marketing',
      'Lead Generation', 'Performance Marketing', 'Marketing Strategy'
    ],
    projectCount: 36,
    freelancerCount: 118,
    isActive: true
  },
  {
    id: 'video-animation',
    name: 'Video & Animation',
    slug: 'video-animation',
    description: 'Cinematic visual storytelling, 3D motion graphics, viral short-form and product videos.',
    icon: 'Video',
    isFeatured: true,
    order: 5,
    subcategories: [
      'Video Editing', 'YouTube Video Editing', 'Reels and Shorts Editing', '2D Animation',
      '3D Animation', 'Motion Graphics', 'Explainer Videos', 'Logo Animation',
      'Product Videos', 'Visual Effects'
    ],
    projectCount: 42,
    freelancerCount: 135,
    isActive: true
  },
  {
    id: 'writing-translation',
    name: 'Writing & Translation',
    slug: 'writing-translation',
    description: 'Authoritative technical documentation, high-conversion copy and multi-lingual translation.',
    icon: 'FileText',
    order: 6,
    subcategories: [
      'Content Writing', 'Blog Writing', 'Copywriting', 'Technical Writing',
      'Website Content', 'Script Writing', 'Resume Writing', 'Translation',
      'Proofreading', 'Academic Writing'
    ],
    projectCount: 28,
    freelancerCount: 92,
    isActive: true
  },
  {
    id: 'music-audio',
    name: 'Music & Audio',
    slug: 'music-audio',
    description: 'Studio-grade voiceover production, custom sound design, jingles and audio mastering.',
    icon: 'Headphones',
    order: 7,
    subcategories: [
      'Voice Over', 'Podcast Editing', 'Audio Editing', 'Music Production',
      'Sound Design', 'Mixing & Mastering', 'Jingles', 'Background Music'
    ],
    projectCount: 22,
    freelancerCount: 68,
    isActive: true
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    description: 'Strategic advisory, executive financial models, market intelligence and ops management.',
    icon: 'Briefcase',
    order: 8,
    subcategories: [
      'Virtual Assistant', 'Data Entry', 'Business Plans', 'Market Research',
      'Project Management', 'Financial Analysis', 'Business Consulting',
      'Customer Support', 'Administrative Support'
    ],
    projectCount: 31,
    freelancerCount: 84,
    isActive: true
  },
  {
    id: 'ai-services',
    name: 'AI Services',
    slug: 'ai-services',
    description: 'Autonomous AI agents, enterprise LLM fine-tuning, computer vision and workflow automation.',
    icon: 'Cpu',
    isTrending: true,
    isFeatured: true,
    order: 9,
    subcategories: [
      'AI Development', 'AI Agents', 'AI Automation', 'Machine Learning',
      'Generative AI', 'ChatGPT Integration', 'LLM Integration', 'Computer Vision',
      'Natural Language Processing', 'Data Science', 'AI Chatbots'
    ],
    projectCount: 74,
    freelancerCount: 182,
    isActive: true
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    slug: 'data-analytics',
    description: 'Enterprise BI dashboards, predictive modeling, data pipelines and clean data engineering.',
    icon: 'BarChart3',
    order: 10,
    subcategories: [
      'Data Analysis', 'Data Visualization', 'Excel', 'Power BI',
      'Tableau', 'SQL', 'Data Engineering', 'Data Cleaning'
    ],
    projectCount: 34,
    freelancerCount: 96,
    isActive: true
  },
  {
    id: 'engineering-architecture',
    name: 'Engineering & Architecture',
    slug: 'engineering-architecture',
    description: 'Precision CAD modeling, industrial prototyping, interior concepts and architectural blueprints.',
    icon: 'Compass',
    order: 11,
    subcategories: [
      'CAD Design', '3D Modeling', 'Product Design', 'Architecture',
      'Interior Design', 'Mechanical Design', 'Electrical Design'
    ],
    projectCount: 26,
    freelancerCount: 72,
    isActive: true
  },
  {
    id: 'photography',
    name: 'Photography',
    slug: 'photography',
    description: 'Commercial product photography, luxury portraiture, photo retouching and color grade.',
    icon: 'Camera',
    order: 12,
    subcategories: [
      'Product Photography', 'Portrait Photography', 'Event Photography',
      'Photo Editing', 'Image Retouching', 'Commercial Photography'
    ],
    projectCount: 18,
    freelancerCount: 54,
    isActive: true
  },
  {
    id: 'lifestyle-consulting',
    name: 'Lifestyle & Consulting',
    slug: 'lifestyle-consulting',
    description: 'Executive leadership coaching, personal branding, fitness strategy and expert tutoring.',
    icon: 'Sparkles',
    order: 13,
    subcategories: [
      'Career Consulting', 'Business Coaching', 'Fitness Coaching',
      'Personal Development', 'Education & Tutoring', 'Professional Consulting'
    ],
    projectCount: 20,
    freelancerCount: 46,
    isActive: true
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, switchRole, logout } = useAuth();

  // State
  const [categories, setCategories] = useState<Category[]>(DEFAULT_NAV_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  // Refs
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live categories and notifications
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});

    if (user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(() => {});
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (
        megaMenuRef.current && 
        !megaMenuRef.current.contains(event.target as Node) &&
        categoryScrollRef.current &&
        !categoryScrollRef.current.contains(event.target as Node)
      ) {
        setActiveCategory(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions with debouncing
  useEffect(() => {
    if (!isSearchFocused && !searchQuery) {
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchFocused]);

  // Mega menu hover management
  const handleCategoryMouseEnter = (cat: Category) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveCategory(cat);
  };

  const handleCategoryMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 240);
  };

  const handleMegaMenuMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleMegaMenuMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  };

  // Horizontal scroll helpers
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Perform search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(`/freelancers?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    await fetch('/api/notifications/read', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#071011]/90 backdrop-blur-xl border-b border-white/[0.06] transition-all duration-300">
      
      {/* ========================================================
          TIER 1: LOGO, SEARCH BAR & USER/AUTH ACTIONS (H-16)
          ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo & Home Link */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-8 h-8 rounded-full border border-[#73D8C4]/40 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:border-[#73D8C4]">
            <div className="w-2 h-2 rounded-full bg-[#73D8C4] shadow-[0_0_10px_#73D8C4]" />
            <div className="absolute inset-0 rounded-full border border-[#73D8C4]/20 animate-spin-very-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-[0.22em] text-[#F4F5F3] group-hover:text-white transition-colors">
              GRAVITASS
            </span>
            <span className="text-[8px] tracking-[0.25em] text-[#91A09E] uppercase font-light -mt-0.5 hidden sm:block">
              Independent Work Protocol
            </span>
          </div>
        </Link>

        {/* Center: Fiverr-style Service Search Input */}
        <div className="flex-1 max-w-2xl mx-2 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-[#91A09E] absolute left-3.5 pointer-events-none transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="What service are you looking for?"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#0B1719]/90 border border-white/[0.1] hover:border-[#73D8C4]/50 focus:border-[#73D8C4] rounded-l-full sm:rounded-l-full text-[#F4F5F3] placeholder-[#91A09E]/70 focus:outline-none transition-all duration-200 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#73D8C4] hover:bg-[#5fcbb6] text-[#071011] rounded-r-full font-semibold text-xs tracking-wider transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(115,216,196,0.3)] hover:shadow-[0_0_20px_rgba(115,216,196,0.5)] flex-shrink-0"
              title="Search Services"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Live Search Suggestions Dropdown */}
          {isSearchFocused && suggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B1719] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Popular Searches Pills */}
              {suggestions.popularSearches && suggestions.popularSearches.length > 0 && (
                <div className="p-3 border-b border-white/[0.06] bg-white/[0.01]">
                  <p className="text-[10px] tracking-wider uppercase text-[#91A09E] font-medium mb-2 flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-[#73D8C4]" />
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.popularSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          setIsSearchFocused(false);
                          router.push(`/freelancers?query=${encodeURIComponent(term)}`);
                        }}
                        className="px-2.5 py-1 text-[11px] rounded-full bg-white/[0.04] hover:bg-[#73D8C4]/20 text-[#D0DCD9] hover:text-[#73D8C4] border border-white/[0.06] hover:border-[#73D8C4]/40 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Categories */}
              {suggestions.categories && suggestions.categories.length > 0 && (
                <div className="p-3 border-b border-white/[0.06]">
                  <p className="text-[10px] tracking-wider uppercase text-[#91A09E] font-medium mb-1.5">Categories</p>
                  <div className="space-y-1">
                    {suggestions.categories.map(cat => (
                      <Link
                        key={cat.id}
                        href={cat.url}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 text-xs text-[#F4F5F3] hover:text-[#73D8C4] hover:bg-white/[0.04] rounded-lg transition-colors group"
                      >
                        <span className="font-medium">{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#91A09E] group-hover:text-[#73D8C4] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Subcategories */}
              {suggestions.subcategories && suggestions.subcategories.length > 0 && (
                <div className="p-3 border-b border-white/[0.06]">
                  <p className="text-[10px] tracking-wider uppercase text-[#91A09E] font-medium mb-1.5">Services & Subcategories</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {suggestions.subcategories.map((sub, i) => (
                      <Link
                        key={i}
                        href={sub.url}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 text-xs text-[#D0DCD9] hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors group"
                      >
                        <div>
                          <span className="font-semibold text-[#F4F5F3] block group-hover:text-[#73D8C4]">{sub.name}</span>
                          <span className="text-[10px] text-[#91A09E]">in {sub.categoryName}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-[#91A09E] group-hover:text-[#73D8C4] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Freelancers */}
              {suggestions.freelancers && suggestions.freelancers.length > 0 && (
                <div className="p-3 border-b border-white/[0.06]">
                  <p className="text-[10px] tracking-wider uppercase text-[#91A09E] font-medium mb-1.5">Top Verified Talent</p>
                  <div className="space-y-1.5">
                    {suggestions.freelancers.map(f => (
                      <Link
                        key={f.id}
                        href={f.url}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-3 px-2.5 py-1.5 text-xs hover:bg-white/[0.04] rounded-lg transition-colors group"
                      >
                        <img
                          src={f.avatarUrl}
                          alt={f.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/[0.1]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#F4F5F3] group-hover:text-[#73D8C4] truncate">{f.name}</span>
                            <span className="text-[10px] text-[#73D8C4] font-medium">★ {f.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-[10px] text-[#91A09E] truncate">{f.headline}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[11px] font-bold text-[#73D8C4]">{formatINR(f.startingPriceINR)}</span>
                          <span className="text-[9px] text-[#91A09E] block">starting</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* View all search results link */}
              {searchQuery && (
                <div className="p-2.5 bg-[#071011] text-center border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs text-[#73D8C4] hover:underline font-semibold flex items-center justify-center gap-1.5 w-full"
                  >
                    <span>View all results for &quot;{searchQuery}&quot;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right: Actions, Navigation, Role Switcher, & Auth */}
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0" ref={dropdownRef}>
          
          {/* Main Direct Links (Hidden on small mobile) */}
          <nav className="hidden lg:flex items-center gap-5">
            <Link
              href="/"
              className={`text-xs uppercase tracking-wider transition-colors ${
                pathname === '/' ? 'text-[#73D8C4] font-semibold' : 'text-[#91A09E] hover:text-[#F4F5F3]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-xs uppercase tracking-wider transition-colors ${
                pathname === '/about' ? 'text-[#73D8C4] font-semibold' : 'text-[#91A09E] hover:text-[#F4F5F3]'
              }`}
            >
              About Us
            </Link>
            <Link
              href="/explore"
              className={`text-xs uppercase tracking-wider transition-colors ${
                pathname === '/explore' ? 'text-[#73D8C4] font-semibold' : 'text-[#91A09E] hover:text-[#F4F5F3]'
              }`}
            >
              Discover
            </Link>
            <Link
              href="/projects"
              className={`text-xs uppercase tracking-wider transition-colors ${
                pathname === '/projects' ? 'text-[#73D8C4] font-semibold' : 'text-[#91A09E] hover:text-[#F4F5F3]'
              }`}
            >
              Projects
            </Link>
            <Link
              href="/leaderboard"
              className={`text-xs uppercase tracking-wider transition-colors ${
                pathname === '/leaderboard' ? 'text-[#73D8C4] font-semibold' : 'text-[#91A09E] hover:text-[#F4F5F3]'
              }`}
            >
              Leaderboard
            </Link>
          </nav>

          {user ? (
            <>
              {/* Dual Role Pill */}
              <button
                onClick={() => switchRole(activeRole === 'freelancer' ? 'client' : 'freelancer')}
                title="Switch active role"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1719] border border-white/[0.08] hover:border-[#73D8C4]/40 text-[11px] text-[#91A09E] hover:text-[#F4F5F3] transition-all"
              >
                <ArrowRightLeft className="w-3 h-3 text-[#73D8C4]" />
                <span className="text-[10px] tracking-wider uppercase text-[#73D8C4] font-semibold">{activeRole}</span>
              </button>

              {/* Messages */}
              <Link
                href="/messages"
                className="text-[#91A09E] hover:text-[#F4F5F3] p-1.5 transition-colors hidden sm:block"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="text-[#91A09E] hover:text-[#F4F5F3] p-1.5 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#73D8C4] shadow-[0_0_8px_#73D8C4]" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#0B1719] border border-white/[0.1] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <span className="text-xs tracking-wider uppercase font-semibold text-[#F4F5F3]">Alerts</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-[#73D8C4] hover:underline">Mark read</button>
                      )}
                    </div>
                    <div className="divide-y divide-white/[0.05] max-h-64 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#91A09E] py-4 text-center">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || '#'}
                            onClick={() => setNotifDropdownOpen(false)}
                            className="block py-2.5 px-2 text-xs text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.02] rounded-lg"
                          >
                            <p className="font-semibold text-[#F4F5F3]">{n.title}</p>
                            <p className="text-[11px] truncate mt-0.5">{n.message}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full border border-white/[0.12] hover:border-[#73D8C4]/60 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://avatar.vercel.sh/user.png'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <ChevronDown className="w-3 h-3 text-[#91A09E] mr-1 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#0B1719] border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-white/[0.08]">
                      <p className="text-xs font-semibold text-[#F4F5F3] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#91A09E] truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={activeRole === 'client' ? '/dashboard/client' : '/dashboard/freelancer'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.04] rounded-lg"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-[#73D8C4]" />
                        Dashboard
                      </Link>
                      {activeRole === 'freelancer' && (
                        <Link
                          href={`/freelancers/${user.id}`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.04] rounded-lg"
                        >
                          <User className="w-3.5 h-3.5 text-[#A5E8DE]" />
                          Profile
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-[#73D8C4] hover:bg-white/[0.04] rounded-lg"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Admin Console
                        </Link>
                      )}
                    </div>
                    <div className="pt-1 border-t border-white/[0.08]">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/auth/signup?role=freelancer"
                className="hidden md:inline-block text-xs uppercase tracking-wider text-[#91A09E] hover:text-[#73D8C4] transition-colors"
              >
                Become a Freelancer
              </Link>
              <Link
                href="/auth/login"
                className="text-xs uppercase tracking-wider text-[#91A09E] hover:text-[#F4F5F3] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#73D8C4]/40 hover:border-[#73D8C4] bg-[#73D8C4]/10 hover:bg-[#73D8C4]/20 text-[#73D8C4] hover:text-white text-xs tracking-wider uppercase font-semibold transition-all shadow-[0_0_15px_rgba(115,216,196,0.15)]"
              >
                Join
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#91A09E] hover:text-[#F4F5F3]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* ========================================================
          TIER 2: HORIZONTALLY SCROLLABLE SERVICE CATEGORIES (H-11)
          ======================================================== */}
      <div className="border-t border-white/[0.04] bg-[#071011]/95 relative">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between relative">
          
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollCategories('left')}
            className="hidden sm:flex items-center justify-center w-6 h-8 text-[#91A09E] hover:text-[#73D8C4] bg-gradient-to-r from-[#071011] to-transparent z-10"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Categories List */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none scroll-smooth py-1.5 px-2 flex-1"
          >
            {categories.map(cat => {
              const IconComponent = ICON_MAP[cat.icon] || Sparkles;
              const isHovered = activeCategory?.slug === cat.slug;
              const isCurrent = pathname === `/freelancers/${cat.slug}` || pathname.startsWith(`/freelancers/${cat.slug}/`);

              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => handleCategoryMouseEnter(cat)}
                  onMouseLeave={handleCategoryMouseLeave}
                  className="relative flex-shrink-0"
                >
                  <Link
                    href={`/freelancers/${cat.slug}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all duration-150 relative ${
                      isCurrent || isHovered
                        ? 'text-[#73D8C4] font-medium bg-white/[0.04]'
                        : 'text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.02]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{cat.name}</span>
                    {cat.isTrending && (
                      <span className="text-[9px] px-1 py-0.2 rounded-full bg-[#73D8C4]/20 text-[#73D8C4] font-bold">
                        HOT
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#73D8C4] rounded-full" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollCategories('right')}
            className="hidden sm:flex items-center justify-center w-6 h-8 text-[#91A09E] hover:text-[#73D8C4] bg-gradient-to-l from-[#071011] to-transparent z-10"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

        {/* ========================================================
            INTERACTIVE MEGA MENU DROPDOWN (ON CATEGORY HOVER)
            ======================================================== */}
        {activeCategory && (
          <div
            ref={megaMenuRef}
            onMouseEnter={handleMegaMenuMouseEnter}
            onMouseLeave={handleMegaMenuMouseLeave}
            className="absolute top-full left-0 right-0 bg-[#071011]/98 border-t border-b border-white/[0.08] shadow-[0_30px_60px_rgba(0,0,0,0.95)] backdrop-blur-3xl animate-in fade-in slide-in-from-top-1 duration-150 z-40"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.06] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#F4F5F3]">{activeCategory.name}</span>
                    {activeCategory.isTrending && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#73D8C4]/15 border border-[#73D8C4]/40 text-[#73D8C4] font-semibold">
                        High Demand Category
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#91A09E] mt-0.5 max-w-2xl">{activeCategory.description}</p>
                </div>
                <Link
                  href={`/freelancers/${activeCategory.slug}`}
                  onClick={() => setActiveCategory(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#73D8C4] hover:text-white font-semibold hover:underline"
                >
                  <span>Explore all {activeCategory.name} services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subcategories Multi-Column Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-2">
                {(activeCategory.subcategories || []).map((sub, idx) => {
                  const subSlug = slugify(sub);
                  return (
                    <Link
                      key={idx}
                      href={`/freelancers/${activeCategory.slug}/${subSlug}`}
                      onClick={() => setActiveCategory(null)}
                      className="group flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="text-xs text-[#91A09E] group-hover:text-[#73D8C4] font-medium transition-colors">
                        {sub}
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#91A09E] group-hover:text-[#73D8C4] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                    </Link>
                  );
                })}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER & ACCORDIONS
          ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071011] border-b border-white/[0.08] px-4 py-4 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
          
          {/* Main Links */}
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/[0.08]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg bg-white/[0.02] text-xs font-medium text-[#F4F5F3] hover:text-[#73D8C4]"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg bg-white/[0.02] text-xs font-medium text-[#F4F5F3] hover:text-[#73D8C4]"
            >
              About Us
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg bg-white/[0.02] text-xs font-medium text-[#F4F5F3] hover:text-[#73D8C4]"
            >
              Discover
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg bg-white/[0.02] text-xs font-medium text-[#F4F5F3] hover:text-[#73D8C4]"
            >
              Projects
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg bg-white/[0.02] text-xs font-medium text-[#F4F5F3] hover:text-[#73D8C4]"
            >
              Leaderboard
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg bg-[#73D8C4]/10 text-xs font-semibold text-[#73D8C4]"
              >
                Admin Console
              </Link>
            )}
          </div>

          {/* Categories Accordion */}
          <div>
            <p className="text-[10px] tracking-wider uppercase text-[#91A09E] font-bold mb-2">Service Categories</p>
            <div className="space-y-1">
              {categories.map(cat => {
                const isExpanded = expandedMobileCategory === cat.id;
                const IconComponent = ICON_MAP[cat.icon] || Sparkles;

                return (
                  <div key={cat.id} className="border border-white/[0.04] rounded-lg overflow-hidden bg-white/[0.01]">
                    <div className="flex items-center justify-between p-2.5">
                      <Link
                        href={`/freelancers/${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-xs font-medium text-[#F4F5F3] hover:text-[#73D8C4]"
                      >
                        <IconComponent className="w-3.5 h-3.5 text-[#73D8C4]" />
                        <span>{cat.name}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                        className="p-1 text-[#91A09E] hover:text-[#F4F5F3]"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-2 pt-0 grid grid-cols-1 gap-1 border-t border-white/[0.04] bg-[#0B1719]/50">
                        {(cat.subcategories || []).map((sub, i) => (
                          <Link
                            key={i}
                            href={`/freelancers/${cat.slug}/${slugify(sub)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-1 px-2 text-[11px] text-[#91A09E] hover:text-[#73D8C4] rounded hover:bg-white/[0.02]"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Auth Bottom Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={activeRole === 'client' ? '/dashboard/client' : '/dashboard/freelancer'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-[#73D8C4]/20 border border-[#73D8C4]/40 text-[#73D8C4] text-xs font-semibold uppercase tracking-wider"
                >
                  Dashboard ({activeRole})
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full text-center py-2 text-xs text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/signup?role=freelancer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs uppercase tracking-wider text-[#73D8C4] font-medium"
                >
                  Become a Freelancer
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 rounded-full border border-white/[0.1] text-xs uppercase tracking-wider text-[#91A09E]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 rounded-full bg-[#73D8C4] text-[#071011] text-xs uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(115,216,196,0.3)]"
                  >
                    Join
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
