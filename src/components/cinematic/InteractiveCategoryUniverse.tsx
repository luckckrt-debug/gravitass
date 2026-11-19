'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CategoryItem {
  number: string;
  id: string;
  slug: string;
  title: string;
  sub: string;
  description: string;
  skills: string[];
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    number: '01',
    id: 'programming-tech',
    slug: 'programming-tech',
    title: 'PROGRAMMING & TECH',
    sub: 'Full-stack engineering, distributed systems, cloud & mobile apps',
    description: 'Web development, Next.js applications, low-latency microservices, smart contracts, cybersecurity audits, databases, and enterprise cloud DevOps.',
    skills: ['Next.js', 'Python', 'Rust', 'TypeScript', 'Docker', 'iOS/Android', 'Cybersecurity']
  },
  {
    number: '02',
    id: 'ai-services',
    slug: 'ai-services',
    title: 'AI & AUTONOMOUS SYSTEMS',
    sub: 'Autonomous agents, enterprise LLMs, RAG & generative vision',
    description: 'Multi-agent swarms, custom model fine-tuning, retrieval-augmented generation (RAG), tool-use pipelines, computer vision, and cognitive workflow automation.',
    skills: ['AI Agents', 'LangChain', 'PyTorch', 'Vector DBs', 'FastAPI', 'Generative AI']
  },
  {
    number: '03',
    id: 'graphics-design',
    slug: 'graphics-design',
    title: 'GRAPHICS & DESIGN',
    sub: 'Spatial UI/UX, brand systems, 3D assets, and futuristic identities',
    description: 'High-conversion design systems, Figma component architectures, luxury visual branding, 3D interactive assets, packaging, and digital interfaces.',
    skills: ['UI/UX Design', 'Figma', 'Spline 3D', 'Three.js', 'Brand Identity', 'Design Systems']
  },
  {
    number: '04',
    id: 'digital-marketing',
    slug: 'digital-marketing',
    title: 'DIGITAL MARKETING',
    sub: 'Performance marketing, search supremacy, and viral growth funnels',
    description: 'Search engine optimization (SEO), omnichannel paid customer acquisition across Meta and Google, lifecycle funnels, and viral growth strategy.',
    skills: ['SEO', 'Google Ads', 'Meta Ads', 'Performance Marketing', 'Growth Funnels']
  },
  {
    number: '05',
    id: 'video-animation',
    slug: 'video-animation',
    title: 'VIDEO & ANIMATION',
    sub: 'Cinematic storytelling, 3D motion graphics, VFX, and viral reels',
    description: 'Cinematic commercial cutting, 3D motion design, broadcast-grade VFX, viral shorts editing, explainer animation, and calibrated color grading.',
    skills: ['After Effects', 'Premiere Pro', 'DaVinci Resolve', '3D Animation', 'Motion Graphics']
  },
  {
    number: '06',
    id: 'data-analytics',
    slug: 'data-analytics',
    title: 'DATA & ANALYTICS',
    sub: 'Enterprise BI dashboards, predictive modeling, and data pipelines',
    description: 'ETL pipelines, BigQuery analytics, Tableau/Power BI intelligence suites, predictive machine learning, and clean structured data architecture.',
    skills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Data Engineering', 'Predictive Modeling']
  },
  {
    number: '07',
    id: 'business',
    slug: 'business',
    title: 'BUSINESS & STRATEGY',
    sub: 'Fractional strategy, executive intelligence, and ops management',
    description: 'Fractional leadership, investor financial models, market intelligence dossiers, project management, and operational systems engineering.',
    skills: ['Business Plans', 'Financial Models', 'Market Research', 'Project Management']
  },
  {
    number: '08',
    id: 'engineering-architecture',
    slug: 'engineering-architecture',
    title: 'ENGINEERING & ARCHITECTURE',
    sub: 'Parametric CAD, mechanical prototyping, and architectural BIM',
    description: 'Mechanical industrial design, parametric 3D modeling, architectural blueprints, interior spatial layouts, and hardware prototyping.',
    skills: ['CAD Design', 'SolidWorks', '3D Modeling', 'Architecture', 'Interior BIM']
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
                  href={`/freelancers/${cat.slug}`}
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
                  href={`/freelancers/${activeCategory.slug}`}
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
