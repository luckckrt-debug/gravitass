'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Compass, Sparkles, UserCheck } from 'lucide-react';

const CLIENT_STEPS = [
  { step: '01', title: 'Discover Talent', desc: 'Browse audited dossiers, live project demonstrations, and verified skills.' },
  { step: '02', title: 'Post a Project', desc: 'Publish an exact technical brief with milestones, budget ranges, and timelines.' },
  { step: '03', title: 'Compare Proposals', desc: 'Inspect merit scores, delivery schedules, and portfolio samples side-by-side.' },
  { step: '04', title: 'Hire the Right Person', desc: 'Establish an escrow-backed contract with milestone protection.' },
  { step: '05', title: 'Build Something Extraordinary', desc: 'Collaborate inside a dedicated workspace with transparent progress.' }
];

const FREELANCER_STEPS = [
  { step: '01', title: 'Create Your Profile', desc: 'Detail your engineering or creative disciplines, experience tiers, and rates.' },
  { step: '02', title: 'Show Your Portfolio', desc: 'Verify your proof of work with live URLs, GitHub repositories, and artifacts.' },
  { step: '03', title: 'Apply to Projects', desc: 'Bid on high-budget client contracts with clear technical proposals.' },
  { step: '04', title: 'Deliver Great Work', desc: 'Submit milestones for review in real-time encrypted workspaces.' },
  { step: '05', title: 'Build Your Reputation', desc: 'Earn verified reviews and climb the global mathematical merit rankings.' }
];

export default function DualPathwaysExperience() {
  const [activePathway, setActivePathway] = useState<'clients' | 'freelancers'>('clients');

  const steps = activePathway === 'clients' ? CLIENT_STEPS : FREELANCER_STEPS;

  return (
    <div className="w-full relative">
      
      {/* Header and Toggle */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
        <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block">
          THE GRAVITASS PROTOCOL
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight">
          How It Works
        </h2>
        <p className="text-sm text-[#91A09E] font-light">
          A frictionless pathway designed for high-calibre collaboration and verifiable excellence.
        </p>

        {/* Minimalist Pathway Switcher */}
        <div className="inline-flex p-1 rounded-full bg-[#0B1719] border border-white/[0.08] mt-4">
          <button
            onClick={() => setActivePathway('clients')}
            className={`px-6 py-2.5 rounded-full text-xs tracking-wider uppercase font-medium transition-all ${
              activePathway === 'clients'
                ? 'bg-[#73D8C4] text-[#020303] shadow-[0_0_20px_rgba(115,216,196,0.35)]'
                : 'text-[#91A09E] hover:text-[#F4F5F3]'
            }`}
          >
            For Clients & Hirers
          </button>
          <button
            onClick={() => setActivePathway('freelancers')}
            className={`px-6 py-2.5 rounded-full text-xs tracking-wider uppercase font-medium transition-all ${
              activePathway === 'freelancers'
                ? 'bg-[#73D8C4] text-[#020303] shadow-[0_0_20px_rgba(115,216,196,0.35)]'
                : 'text-[#91A09E] hover:text-[#F4F5F3]'
            }`}
          >
            For Independent Talent
          </button>
        </div>
      </div>

      {/* Pathway Steps - Editorial Horizontal / Vertical Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
        {steps.map((item, idx) => (
          <div
            key={item.step}
            className="p-6 rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] hover:border-[#73D8C4]/35 transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div>
              <span className="text-3xl font-serif font-light text-[#73D8C4]/30 group-hover:text-[#73D8C4] transition-colors block mb-4">
                {item.step}
              </span>
              <h3 className="text-base font-serif text-[#F4F5F3] leading-snug group-hover:text-[#A5E8DE] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#91A09E] mt-2.5 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-[#91A09E]/50 uppercase">
                PHASE {item.step}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#73D8C4]/40 group-hover:bg-[#73D8C4] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Action link */}
      <div className="mt-12 text-center">
        {activePathway === 'clients' ? (
          <Link
            href="/dashboard/client"
            className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[#73D8C4] hover:text-[#A5E8DE] font-semibold"
          >
            <span>Post a Brief to the Network</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-[#73D8C4] hover:text-[#A5E8DE] font-semibold"
          >
            <span>Apply to Join as Freelancer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

    </div>
  );
}
