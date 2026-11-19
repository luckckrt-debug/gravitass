'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Star, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  Heart, 
  MessageSquare, 
  Briefcase, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { FreelancerProfile } from '@/types';
import { formatINR } from '@/lib/utils';
import HireModal from './HireModal';

interface FreelancerCardProps {
  freelancer: FreelancerProfile;
  onMessage?: (freelancer: FreelancerProfile) => void;
  className?: string;
}

export default function FreelancerCard({ freelancer, onMessage, className = '' }: FreelancerCardProps) {
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);

  const portfolioItems = freelancer.portfolio || [];
  const hasPortfolio = portfolioItems.length > 0;
  const currentPortfolio = hasPortfolio ? portfolioItems[activePortfolioIndex] : null;

  const startingPrice = freelancer.startingPriceINR || (freelancer.minBudget ? freelancer.minBudget * 83 : 1500);
  const hourlyRateINR = freelancer.hourlyRateINR || (freelancer.hourlyRate ? freelancer.hourlyRate * 83 : 1200);
  const deliveryDays = freelancer.deliveryDays || 3;
  const isVerified = (freelancer.badges || []).includes('verified') || freelancer.rating >= 4.8;

  const toggleShortlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShortlisted(!isShortlisted);
    try {
      const stored = JSON.parse(localStorage.getItem('gravitass_shortlist') || '[]');
      if (!isShortlisted) {
        localStorage.setItem('gravitass_shortlist', JSON.stringify([...stored, freelancer.id]));
      } else {
        localStorage.setItem('gravitass_shortlist', JSON.stringify(stored.filter((id: string) => id !== freelancer.id)));
      }
    } catch {}
  };

  const nextPortfolio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (portfolioItems.length > 1) {
      setActivePortfolioIndex((prev) => (prev + 1) % portfolioItems.length);
    }
  };

  const prevPortfolio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (portfolioItems.length > 1) {
      setActivePortfolioIndex((prev) => (prev - 1 + portfolioItems.length) % portfolioItems.length);
    }
  };

  return (
    <>
      <div className={`group bg-[#0B1719] hover:bg-[#0D1C1F] border border-white/[0.08] hover:border-[#73D8C4]/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] ${className}`}>
        
        {/* ========================================================
            CARD HEADER / PORTFOLIO SHOWCASE PREVIEW
            ======================================================== */}
        <div className="relative aspect-[16/9] w-full bg-[#071011] overflow-hidden">
          {hasPortfolio && currentPortfolio?.imageUrl ? (
            <img
              src={currentPortfolio.imageUrl}
              alt={currentPortfolio.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0B1719] to-[#071011] text-center">
              <Zap className="w-8 h-8 text-[#73D8C4]/40 mb-2" />
              <p className="text-xs font-semibold text-[#D0DCD9]">{freelancer.headline}</p>
              <span className="text-[10px] text-[#91A09E] mt-1">{freelancer.subcategory}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1719] via-transparent to-black/30 pointer-events-none" />

          {/* Shortlist Button (Top Right) */}
          <button
            type="button"
            onClick={toggleShortlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
              isShortlisted
                ? 'bg-rose-500/90 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : 'bg-black/50 hover:bg-black/80 text-white/80 hover:text-white'
            }`}
            title={isShortlisted ? 'Saved in shortlist' : 'Save to shortlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Delivery Speed Badge (Top Left) */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.1] text-[10px] font-medium text-[#73D8C4] flex items-center gap-1 z-10">
            <Clock className="w-3 h-3 text-[#73D8C4]" />
            <span>⚡ {deliveryDays} day{deliveryDays > 1 ? 's' : ''} delivery</span>
          </div>

          {/* Portfolio Carousel Controls if multiple items */}
          {portfolioItems.length > 1 && (
            <div className="absolute inset-x-2 bottom-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={prevPortfolio}
                className="p-1 rounded-full bg-black/60 hover:bg-black/90 text-white"
                title="Previous sample"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full text-[9px] text-[#D0DCD9]">
                {activePortfolioIndex + 1}/{portfolioItems.length}
              </div>
              <button
                type="button"
                onClick={nextPortfolio}
                className="p-1 rounded-full bg-black/60 hover:bg-black/90 text-white"
                title="Next sample"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            CARD BODY: TALENT IDENTITY & METRICS
            ======================================================== */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            
            {/* Avatar & Name Row */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={freelancer.avatarUrl || 'https://avatar.vercel.sh/freelancer.png'}
                  alt={freelancer.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-[#73D8C4]/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#73D8C4] border-2 border-[#0B1719]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#F4F5F3] hover:text-[#73D8C4] transition-colors truncate">
                    {freelancer.fullName}
                  </h3>
                  {isVerified && (
                    <span title="Verified Specialist" className="flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#73D8C4] flex-shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#91A09E] truncate">
                  {freelancer.subcategory} • {freelancer.location}
                </p>
              </div>
            </div>

            {/* Headline */}
            <p className="text-xs text-[#D0DCD9] line-clamp-2 mt-2.5 font-normal leading-relaxed">
              {freelancer.headline}
            </p>

            {/* Skills Badges */}
            <div className="flex flex-wrap gap-1 mt-3">
              {(freelancer.skills || []).slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-[#91A09E] border border-white/[0.05]"
                >
                  {skill}
                </span>
              ))}
              {(freelancer.skills || []).length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-white/[0.02] text-[9px] text-[#91A09E]/70">
                  +{(freelancer.skills || []).length - 3}
                </span>
              )}
            </div>

            {/* Verified Rating & Project Stats */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06] text-xs">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-[#F4F5F3]">{freelancer.rating.toFixed(2)}</span>
                <span className="text-[10px] text-[#91A09E]">({freelancer.reviewCount || 12})</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#91A09E]">
                <CheckCircle className="w-3 h-3 text-[#73D8C4]" />
                <span>{freelancer.completedProjectsCount || 0} completed</span>
              </div>
            </div>

          </div>

          {/* ========================================================
              CARD FOOTER: INR PRICE & ACTIONS
              ======================================================== */}
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            
            {/* Price Row */}
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#91A09E] block font-light">Starting at</span>
                <span className="text-base font-extrabold text-[#73D8C4] tracking-tight">
                  {formatINR(startingPrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#91A09E] block">Hourly</span>
                <span className="text-xs font-semibold text-[#F4F5F3]">{formatINR(hourlyRateINR)}/hr</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onMessage) onMessage(freelancer);
                  else window.location.href = `/messages?to=${freelancer.userId || freelancer.id}`;
                }}
                className="py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#D0DCD9] hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#91A09E]" />
                <span>Message</span>
              </button>
              
              <button
                type="button"
                onClick={() => setIsHireModalOpen(true)}
                className="py-1.5 px-3 rounded-lg bg-[#73D8C4] hover:bg-[#5fcbb6] text-[#071011] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(115,216,196,0.25)] hover:shadow-[0_0_16px_rgba(115,216,196,0.4)]"
              >
                <Briefcase className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Hire Now</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Hire Modal */}
      {isHireModalOpen && (
        <HireModal
          freelancer={freelancer}
          onClose={() => setIsHireModalOpen(false)}
        />
      )}
    </>
  );
}
