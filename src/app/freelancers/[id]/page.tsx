'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Star, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Clock, 
  Briefcase, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter, 
  ExternalLink, 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FreelancerProfile, Review } from '@/types';
import { getBadgeDetails } from '@/lib/utils';

export default function FreelancerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'experience'>('portfolio');

  // Contact / Hire modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetch(`/api/freelancers/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile) setProfile(d.profile);
        if (d.reviews) setReviews(d.reviews);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSendMessage = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!profile || !messageText.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: profile.userId,
          initialMessage: messageText
        })
      });
      if (res.ok) {
        setContactModalOpen(false);
        router.push('/messages');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Loading verified talent dossier...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Freelancer Not Found</h2>
        <p className="text-sm text-gray-400 mt-2">The requested talent profile does not exist or has been removed.</p>
        <Link href="/explore" className="mt-4 inline-block px-4 py-2 bg-violet-600 rounded-xl text-white text-xs font-semibold">
          Explore Talent Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Profile Hero Card */}
      <div className="p-8 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-900/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-violet-500/40 shadow-neon-violet flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile.fullName}</h1>
                {profile.badges.map((b) => {
                  const bStyle = getBadgeDetails(b);
                  return (
                    <span
                      key={b}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${bStyle.bg} ${bStyle.text} border ${bStyle.border}`}
                    >
                      {bStyle.label}
                    </span>
                  );
                })}
              </div>

              <p className="text-base text-gray-300 font-medium">{profile.headline}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  {profile.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  {profile.yearsOfExperience} years exp
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                  {profile.completedProjectsCount} projects completed
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-emerald-400" />
                  {profile.rating} ({profile.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setContactModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-neon-violet transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hire / Message</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Progress Meter */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400 font-semibold uppercase tracking-wider">Profile Completion</span>
              <span className="text-violet-400 font-bold">{profile.profileCompletionPercentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${profile.profileCompletionPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div>
              <span className="text-[10px] uppercase text-gray-500 block">Hourly Rate</span>
              <span className="text-base font-bold text-white">${profile.hourlyRate} / hr</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 block">Min Budget</span>
              <span className="text-base font-bold text-white">${profile.minBudget}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-gray-500 block">Availability</span>
              <span className="text-xs font-semibold text-emerald-400 capitalize">{profile.availability.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Bio, Tabs (Portfolio, Reviews, Experience) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Biography Box */}
          <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08]">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-3">About Elena</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
            {[
              { id: 'portfolio', label: `Portfolio (${profile.portfolio?.length || 0})` },
              { id: 'reviews', label: `Client Reviews (${reviews.length})` },
              { id: 'experience', label: 'Qualifications & Social' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-neon-violet'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PORTFOLIO SHOWCASE */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {(!profile.portfolio || profile.portfolio.length === 0) ? (
                <div className="p-10 text-center rounded-2xl bg-[#0B0B0F] border border-white/[0.08]">
                  <p className="text-sm text-gray-400">No portfolio samples published yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-[#121218] border border-white/[0.08] overflow-hidden group hover:border-violet-500/40 transition-all flex flex-col justify-between"
                    >
                      {item.imageUrl && (
                        <div className="relative h-48 w-full overflow-hidden bg-black/40">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                            {item.category}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1 group-hover:text-violet-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {item.tools?.map((tool) => (
                              <span
                                key={tool}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-gray-300 border border-white/[0.06]"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* External Links */}
                        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-3 text-xs">
                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                            >
                              <span>Live Project</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {item.githubUrl && (
                            <a
                              href={item.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-white flex items-center gap-1 font-medium"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>Repository</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLIENT REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#0B0B0F] border border-white/[0.08]">
                  <p className="text-sm text-gray-400">No client reviews submitted yet.</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-[#121218] border border-white/[0.08] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.fromUserAvatar || 'https://avatar.vercel.sh/client.png'}
                          alt={r.fromUserName}
                          className="w-10 h-10 rounded-full object-cover border border-white/[0.1]"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{r.fromUserName}</p>
                          <p className="text-[11px] text-gray-500">Verified Client</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed italic">
                      "{r.comment}"
                    </p>

                    {r.categories && (
                      <div className="pt-2 border-t border-white/[0.06] grid grid-cols-4 gap-2 text-[10px] text-gray-400">
                        <div>Quality: <strong className="text-white">{r.categories.quality}/5</strong></div>
                        <div>Comms: <strong className="text-white">{r.categories.communication}/5</strong></div>
                        <div>On-Time: <strong className="text-white">{r.categories.timeliness}/5</strong></div>
                        <div>Expertise: <strong className="text-white">{r.categories.expertise}/5</strong></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: QUALIFICATIONS & SOCIAL */}
          {activeTab === 'experience' && (
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages?.map((lang) => (
                    <span key={lang} className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-200">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Verified Connections</h3>
                <div className="flex items-center gap-3">
                  {profile.socialLinks?.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-violet-600/20 text-gray-300 hover:text-white border border-white/[0.08] transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-violet-600/20 text-gray-300 hover:text-white border border-white/[0.08] transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.website && (
                    <a
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-violet-600/20 text-gray-300 hover:text-white border border-white/[0.08] transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Performance Score Radar & Skills */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Transparent Performance Score (0-100) Section 10 */}
          <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-violet-500/30 shadow-neon-violet relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Merit Proof 0-100</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-600/20 text-violet-300 border border-violet-500/40">
                SCORE: {profile.performanceScore?.overallScore}
              </span>
            </div>

            <div className="text-center py-2 mb-4">
              <span className="text-5xl font-black text-white tracking-tight text-glow-violet">
                {profile.performanceScore?.overallScore}
              </span>
              <span className="text-sm text-gray-400 block mt-1">Global Performance Score</span>
            </div>

            {/* Score Factors Breakdown */}
            <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs">
              {[
                { label: 'Client Review Quality', weight: '25%', score: profile.performanceScore?.clientReviewQuality },
                { label: 'Project Completion Rate', weight: '20%', score: profile.performanceScore?.projectCompletionRate },
                { label: 'On-Time Delivery', weight: '15%', score: profile.performanceScore?.onTimeDelivery },
                { label: 'Quality Performance', weight: '15%', score: profile.performanceScore?.qualityPerformance },
                { label: 'Communication Velocity', weight: '10%', score: profile.performanceScore?.communication },
                { label: 'Repeat Clients Index', weight: '10%', score: profile.performanceScore?.repeatClients },
                { label: 'Portfolio Rigor', weight: '5%', score: profile.performanceScore?.profilePortfolioQuality },
              ].map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>{factor.label} <span className="text-[10px] text-gray-500">({factor.weight})</span></span>
                    <span className="font-bold text-white">{factor.score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Technical Disciplines & Skills */}
          <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Verified Technical Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-[#121218] border border-white/[0.08] text-xs font-medium text-gray-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Hire / Contact Dialog Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0B0B0F] border border-violet-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Contact & Hire {profile.fullName}</h3>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Initiate a direct conversation with {profile.fullName} to discuss project deliverables, scope, and timeline.
            </p>

            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Hi Elena, I'd like to discuss an upcoming architecture project with you..."
              className="w-full p-3.5 rounded-xl bg-[#121218] border border-white/[0.1] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs font-semibold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet disabled:opacity-50"
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
