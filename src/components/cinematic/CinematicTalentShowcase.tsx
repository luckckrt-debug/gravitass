'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, ArrowLeft, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { FreelancerProfile } from '@/types';
import { formatINR } from '@/lib/utils';

interface Props {
  freelancers: FreelancerProfile[];
}

export default function CinematicTalentShowcase({ freelancers }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative">
      
      {/* Top Header & Horizontal Scroll Arrows */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block mb-3">
            VERIFIED PRACTITIONERS
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight leading-tight">
            Talent deserves <br />
            <span className="italic font-light text-[#A5E8DE]">to be discovered.</span>
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => scroll('left')}
            className="p-3 rounded-full border border-white/[0.1] hover:border-[#73D8C4]/60 text-[#91A09E] hover:text-[#F4F5F3] transition-colors"
            aria-label="Previous talent"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-3 rounded-full border border-white/[0.1] hover:border-[#73D8C4]/60 text-[#91A09E] hover:text-[#F4F5F3] transition-colors"
            aria-label="Next talent"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {freelancers.map((f, idx) => (
          <div
            key={f.id}
            className="w-[340px] sm:w-[400px] flex-shrink-0 snap-start p-7 rounded-3xl bg-[#0B1719]/90 border border-white/[0.08] hover:border-[#73D8C4]/40 transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div>
              {/* Profile Top: Picture + Rating */}
              <div className="flex items-start justify-between gap-4">
                <div className="relative">
                  <img
                    src={f.avatarUrl}
                    alt={f.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#73D8C4]/30 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-[#071011] border border-[#73D8C4]/50">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#73D8C4]" />
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#071011] border border-white/[0.08] text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#73D8C4] text-[#73D8C4]" />
                    <span className="font-bold text-[#F4F5F3]">{f.rating}</span>
                    <span className="text-[10px] text-[#91A09E]">({f.reviewCount})</span>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase text-[#91A09E] block mt-1">
                    MERIT SCORE: <strong className="text-[#73D8C4]">{f.performanceScore.overallScore}</strong>
                  </span>
                </div>
              </div>

              {/* Title & Name */}
              <div className="mt-6 space-y-1">
                <h3 className="text-xl font-serif text-[#F4F5F3] group-hover:text-[#73D8C4] transition-colors">
                  <Link href={`/freelancers/${f.userId}`}>{f.fullName}</Link>
                </h3>
                <p className="text-xs text-[#91A09E] line-clamp-1">{f.headline}</p>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-[#91A09E] mt-3 line-clamp-2 leading-relaxed font-light">
                {f.bio}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mt-5">
                {f.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full text-[10px] bg-[#071011] border border-white/[0.06] text-[#A5E8DE]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Portfolio Preview Snapshot */}
              {f.portfolio && f.portfolio.length > 0 && f.portfolio[0].imageUrl && (
                <div className="mt-5 rounded-xl overflow-hidden border border-white/[0.06] relative h-28 bg-[#020303]">
                  <img
                    src={f.portfolio[0].imageUrl}
                    alt={f.portfolio[0].title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020303] via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] text-[#F4F5F3] font-medium truncate max-w-[90%]">
                    {f.portfolio[0].title}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Meta & View Link */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#91A09E] block">Starting at</span>
                <span className="text-sm font-extrabold text-[#73D8C4]">{formatINR(f.startingPriceINR || (f.minBudget ? f.minBudget * 83 : 1500))}</span>
              </div>

              <Link
                href={`/freelancers/${f.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-[#73D8C4] hover:text-[#A5E8DE] font-medium"
              >
                <span>View Dossier</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Dual CTA Links */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06] text-xs">
        <Link
          href="/explore"
          className="text-[#73D8C4] hover:text-[#A5E8DE] font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
        >
          <span>Explore All Talent</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/leaderboard"
          className="text-[#91A09E] hover:text-[#F4F5F3] font-medium tracking-wider uppercase transition-colors"
        >
          View Verified Merit Leaderboard →
        </Link>
      </div>

    </div>
  );
}
