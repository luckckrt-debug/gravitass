'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';

const EVALUATION_FACTORS = [
  { name: 'Client Feedback Quality', weight: 25, desc: 'Verified multi-category ratings submitted upon milestone escrow release.' },
  { name: 'Completed Projects Rate', weight: 20, desc: 'Successful deliverable sign-offs with zero unresolved dispute claims.' },
  { name: 'On-Time Delivery Reliability', weight: 15, desc: 'Adherence to milestone schedules and contractual completion dates.' },
  { name: 'Code & Artifact Rigor', weight: 15, desc: 'Benchmarked technical and creative deliverable compliance.' },
  { name: 'Communication Velocity', weight: 10, desc: 'Response latency and clarity in direct project terminals.' },
  { name: 'Repeat Client Index', weight: 10, desc: 'Client re-engagement and continuous sprint extensions.' },
  { name: 'Portfolio Sample Proof', weight: 5, desc: 'Audited case studies with live URLs and inspectable repositories.' },
];

export default function PerformanceTrustVisualization() {
  const [activeFactor, setActiveFactor] = useState(0);

  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Headline & Explanation */}
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs tracking-[0.25em] text-[#73D8C4] uppercase font-semibold block">
            PROOF OF MERIT
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#F4F5F3] tracking-tight leading-tight">
            Reputation is built. <br />
            <span className="italic font-light text-[#A5E8DE]">Not claimed.</span>
          </h2>
          <p className="text-sm text-[#91A09E] leading-relaxed max-w-lg font-light">
            Conventional marketplaces rely on inflated star ratings and paid promotional boosts. GRAVITASS computes a transparent 0–100 performance score grounded strictly in verified milestone execution.
          </p>

          <div className="pt-2">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#73D8C4]/40 bg-[#73D8C4]/10 hover:bg-[#73D8C4]/20 text-[#73D8C4] hover:text-white text-xs tracking-[0.14em] uppercase font-medium transition-all shadow-[0_0_15px_rgba(115,216,196,0.15)]"
            >
              <span>Explore Talent Rankings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Interactive 0-100 Scientific Visualization */}
        <div className="lg:col-span-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0B1719]/90 border border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Background geometric circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#73D8C4]/10 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <span className="text-xs tracking-[0.2em] uppercase text-[#73D8C4] font-semibold">
                  MATHEMATICAL WEIGHT DISTRIBUTION
                </span>
                <span className="text-xs font-mono text-[#F4F5F3] font-bold">100.0% TOTAL</span>
              </div>

              {/* Factors Interactive Bars */}
              <div className="space-y-4">
                {EVALUATION_FACTORS.map((factor, i) => {
                  const isActive = activeFactor === i;
                  return (
                    <div
                      key={factor.name}
                      onMouseEnter={() => setActiveFactor(i)}
                      className="cursor-pointer space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`transition-colors ${isActive ? 'text-[#F4F5F3] font-medium' : 'text-[#91A09E]'}`}>
                          {factor.name}
                        </span>
                        <span className={`font-mono font-bold transition-colors ${isActive ? 'text-[#73D8C4]' : 'text-[#91A09E]/70'}`}>
                          {factor.weight}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#73D8C4] to-[#A5E8DE] transition-all duration-500 rounded-full"
                          style={{
                            width: `${factor.weight * 3.5}%`,
                            opacity: isActive ? 1 : 0.4
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Factor Explainer Card */}
              <div className="p-4 rounded-2xl bg-[#071011] border border-[#73D8C4]/20 text-xs text-[#91A09E] leading-relaxed transition-all duration-300">
                <span className="text-[#73D8C4] font-semibold block mb-1">
                  {EVALUATION_FACTORS[activeFactor].name} ({EVALUATION_FACTORS[activeFactor].weight}% weight)
                </span>
                {EVALUATION_FACTORS[activeFactor].desc}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
