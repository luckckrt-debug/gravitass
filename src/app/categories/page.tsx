'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Code2, 
  Cpu, 
  Palette, 
  Video, 
  FileText, 
  TrendingUp, 
  Briefcase, 
  Headphones, 
  Camera, 
  ArrowRight,
  Search,
  Zap,
  Compass,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Category } from '@/types';
import { slugify } from '@/lib/utils';
import { DEFAULT_NAV_CATEGORIES } from '@/components/layout/Navbar';

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
  Sparkles
};

export default function CategoriesDirectoryPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_NAV_CATEGORIES);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.categories && d.categories.length > 0) setCategories(d.categories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (c.subcategories || []).some(sub => sub.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-bold text-[#73D8C4] uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Layers className="w-4 h-4" />
          <span>Talent Taxonomy</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#F4F5F3] tracking-tight">
          Ecosystem Disciplines & Departments
        </h1>
        <p className="text-xs sm:text-sm text-[#91A09E] max-w-xl mx-auto">
          Explore all 13 specialized service departments on GRAVITASS. From generative AI to luxury branding and full-stack software architecture.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#91A09E] absolute left-3.5 top-3" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search category or subdiscipline (e.g. Next.js, 3D, SEO, Python)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1719] border border-white/[0.08] text-xs text-[#F4F5F3] placeholder-[#91A09E] focus:outline-none focus:border-[#73D8C4]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Categories with Subcategories */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#0B1719] border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Sparkles;

            return (
              <div
                key={cat.id}
                className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] hover:border-[#73D8C4]/40 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#73D8C4]/10 border border-[#73D8C4]/30 flex items-center justify-center text-[#73D8C4]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#F4F5F3] group-hover:text-[#73D8C4] transition-colors">
                          {cat.name}
                        </h2>
                        <span className="text-[11px] text-[#91A09E]">{cat.freelancerCount || 50}+ Talent • {cat.projectCount || 20} Projects</span>
                      </div>
                    </div>

                    <Link
                      href={`/freelancers/${cat.slug}`}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#73D8C4] hover:text-[#071011] text-[#91A09E] transition-colors"
                      title="Explore Category"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <p className="text-xs text-[#D0DCD9] mt-3 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Subcategory Pills */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <span className="text-[10px] font-bold text-[#91A09E] uppercase tracking-wider block mb-2">
                      Popular Services:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(cat.subcategories || []).slice(0, 6).map((sub) => (
                        <Link
                          key={sub}
                          href={`/freelancers/${cat.slug}/${slugify(sub)}`}
                          className="px-2.5 py-1 rounded-lg bg-[#071011] hover:bg-[#73D8C4]/20 hover:text-[#73D8C4] border border-white/[0.06] text-[11px] text-[#D0DCD9] transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
                      {(cat.subcategories || []).length > 6 && (
                        <Link
                          href={`/freelancers/${cat.slug}`}
                          className="px-2 py-1 text-[11px] text-[#73D8C4] hover:underline"
                        >
                          +{(cat.subcategories || []).length - 6} more
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <Link
                    href={`/projects?category=${cat.slug}`}
                    className="text-[#91A09E] hover:text-[#F4F5F3] font-medium"
                  >
                    View Projects →
                  </Link>
                  <Link
                    href={`/freelancers/${cat.slug}`}
                    className="text-[#73D8C4] hover:underline font-semibold"
                  >
                    Explore Talent →
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
