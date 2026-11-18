'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CategoryItem {
  number: string;
  id: string;
  title: string;
  sub: string;
  description: string;
  skills: string[];
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    number: '01',
    id: 'development',
    title: 'DEVELOPMENT & TECHNOLOGY',
    sub: 'Full-stack engineering, distributed systems, AI & autonomous agents',
    description: 'Web development, mobile ecosystems, software architecture, LLM pipelines, smart contracts, cybersecurity, databases, and low-latency APIs.',
    skills: ['Next.js', 'Python', 'Rust', 'LangChain', 'Docker', 'iOS/Android']
  },
  {
    number: '02',
    id: 'design',
    title: 'DESIGN & CREATIVE',
    sub: 'Spatial UI, brand systems, interactive 3D, and visual design',
    description: 'Graphic design, holistic branding identities, design tokens, responsive web interfaces, app interaction systems, and 3D product renders.',
    skills: ['Figma', 'Spline 3D', 'Three.js', 'Design Systems', 'Prototyping']
  },
  {
    number: '03',
    id: 'video',
    title: 'VIDEO & MOTION',
    sub: 'Cinematic storytelling, 3D motion graphics, VFX, and reels',
    description: 'Video editing, narrative cutting, high-end YouTube production, motion typography, visual effects, and calibrated color grading.',
    skills: ['After Effects', 'Premiere Pro', 'DaVinci Resolve', 'Cinema 4D', 'Blender']
  },
  {
    number: '04',
    id: 'marketing',
    title: 'DIGITAL & MARKETING',
    sub: 'Performance marketing, search supremacy, and viral growth',
    description: 'SEO strategy, paid customer acquisition across Meta and Google, lifecycle email sequences, viral content funnels, and marketing operations.',
    skills: ['SEO Architecture', 'Paid Media', 'Growth Hacking', 'Lifecycle Ads']
  },
  {
    number: '05',
    id: 'writing',
    title: 'WRITING & CONTENT',
    sub: 'Technical whitepapers, high-conversion copy, and narratives',
    description: 'Engineering documentation, research papers, brand messaging, landing page copywriting, technical articles, and multilingual localization.',
    skills: ['Technical Writing', 'Copywriting', 'Whitepapers', 'Speechwriting']
  },
  {
    number: '06',
    id: 'business',
    title: 'BUSINESS & PROFESSIONAL',
    sub: 'Fractional strategy, intelligence, and operations management',
    description: 'Executive advisory, financial modeling, deep industry research, project management leadership, and operational automation.',
    skills: ['Market Intelligence', 'Operations', 'Financial Models', 'Fractional Exec']
  },
  {
    number: '07',
    id: 'audio',
    title: 'AUDIO & PRODUCTION',
    sub: 'Spatial sound design, original composition, and voiceover',
    description: 'Commercial voice artistry, podcast production, cinematic sound design, foley, original scoring, mixing, and mastering.',
    skills: ['Sound Design', 'Voice-Over', 'Ableton Live', 'Mastering']
  },
  {
    number: '08',
    id: 'other',
    title: 'ENGINEERING & SPECIALIZED',
    sub: 'Parametric CAD, architectural visualization, and BIM',
    description: 'Mechanical prototyping, architectural schematics, structural analysis, hardware firmware development, and bespoke technical consulting.',
    skills: ['AutoCAD', 'SolidWorks', 'BIM Architecture', 'Parametric 3D']
  }
];

export default function InteractiveCategoryUniverse() {
  const [hoveredIdx, setHoveredIdx] = useState<number>(0);

  const activeCategory = CATEGORIES_DATA[hoveredIdx];

  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Interactive Large Typography List */}
        <div className="lg:col-span-8 space-y-0 divide-y divide-white/[0.08]">
          {CATEGORIES_DATA.map((cat, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={cat.number}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="py-7 group cursor-pointer transition-all duration-300 relative"
              >
                <Link
                  href={`/explore?category=${cat.id}`}
                  className="flex items-baseline justify-between gap-6"
                >
                  <div className="flex items-baseline gap-6 sm:gap-8 flex-1">
                    {/* Category Index Number */}
                    <span className={`text-xs tracking-[0.25em] font-light transition-colors ${
                      isHovered ? 'text-[#73D8C4]' : 'text-[#91A09E]/60'
                    }`}>
                      {cat.number}
                    </span>

                    {/* Headline in Elegant Typography */}
                    <div>
                      <h3 className={`text-xl sm:text-2xl md:text-3xl tracking-tight transition-all duration-300 ${
                        isHovered 
                          ? 'text-[#F4F5F3] font-serif translate-x-2' 
                          : 'text-[#91A09E] font-sans font-light hover:text-[#F4F5F3]'
                      }`}>
                        {cat.title}
                      </h3>
                      <p className={`text-xs mt-1.5 transition-all duration-300 max-w-xl ${
                        isHovered 
                          ? 'text-[#73D8C4] opacity-100 translate-x-2' 
                          : 'text-[#91A09E]/50 opacity-0 group-hover:opacity-80'
                      }`}>
                        {cat.sub}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className={`p-2 rounded-full border transition-all duration-300 ${
                    isHovered
                      ? 'border-[#73D8C4] text-[#73D8C4] rotate-45 scale-110 shadow-[0_0_15px_rgba(115,216,196,0.3)]'
                      : 'border-white/[0.08] text-[#91A09E] opacity-30 group-hover:opacity-100'
                  }`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right: Floating Editorial Dossier Preview */}
        <div className="lg:col-span-4 sticky top-32 hidden lg:block">
          <div className="p-8 rounded-3xl bg-[#0B1719]/80 border border-[#73D8C4]/25 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#73D8C4]/15 rounded-full blur-[70px] pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <span className="text-xs tracking-[0.25em] text-[#73D8C4] font-semibold uppercase">
                  DEPARTMENT {activeCategory.number}
                </span>
                <span className="text-[10px] tracking-widest text-[#91A09E] uppercase">
                  VERIFIED NETWORK
                </span>
              </div>

              <div>
                <h4 className="text-xl font-serif text-[#F4F5F3] leading-snug">
                  {activeCategory.title}
                </h4>
                <p className="text-xs text-[#91A09E] mt-3 leading-relaxed">
                  {activeCategory.description}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#91A09E] block mb-2 font-medium">
                  Core Technical Disciplines:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategory.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-[#071011] border border-white/[0.08] text-[#A5E8DE]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08]">
                <Link
                  href={`/explore?category=${activeCategory.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-[#73D8C4]/40 bg-[#73D8C4]/10 hover:bg-[#73D8C4]/20 text-[#73D8C4] text-xs tracking-wider uppercase font-medium transition-all"
                >
                  <span>Explore Department Talent</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
