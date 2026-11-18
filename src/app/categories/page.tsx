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
  Search
} from 'lucide-react';
import { Category } from '@/types';

export default function CategoriesDirectoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.categories) setCategories(d.categories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.subcategories.some(sub => sub.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Layers className="w-4 h-4" />
          <span>Talent Taxonomy</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ecosystem Disciplines & Departments
        </h1>
        <p className="text-sm text-gray-400">
          Database-driven taxonomy categorizing specialized contractors across software, intelligence, design, and operations.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search category or subdiscipline (e.g. Flutter, VFX, RAG)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Categories with Subcategories */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#121218] border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] hover:border-violet-500/40 glass-panel-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{cat.name}</h2>
                      <span className="text-xs text-gray-400">{cat.freelancerCount}+ Talent • {cat.projectCount} Projects</span>
                    </div>
                  </div>

                  <Link
                    href={`/explore?category=${cat.id}`}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-violet-600 hover:text-white text-gray-300 transition-colors"
                    title="Explore Department"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                  {cat.description}
                </p>

                {/* Subcategory Pills */}
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Subcategories & Fields:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/explore?category=${cat.id}&q=${encodeURIComponent(sub)}`}
                        className="px-2.5 py-1 rounded-lg bg-[#121218] hover:bg-violet-600/20 hover:text-violet-300 border border-white/[0.06] text-xs text-gray-300 transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <Link
                  href={`/projects?category=${cat.id}`}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Browse {cat.name} Projects →
                </Link>
                <Link
                  href={`/explore?category=${cat.id}`}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Hire {cat.name} Experts →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
