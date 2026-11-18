'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  User, 
  FileText, 
  Search, 
  DollarSign, 
  Star, 
  Trophy, 
  Bell, 
  Settings, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Send,
  Eye,
  Sliders,
  FolderGit2,
  Home
} from 'lucide-react';
import { FreelancerProfile, ProjectApplication, Contract, PortfolioItem, Transaction, WithdrawalRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import EarningsLedgerView from '@/components/dashboard/EarningsLedgerView';

export default function FreelancerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'portfolio' | 'applications' | 'projects' | 'earnings'>('overview');
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Editor state
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(75);
  const [minBudget, setMinBudget] = useState(500);
  const [skillsStr, setSkillsStr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Portfolio Add Modal
  const [addPortModal, setAddPortModal] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portImg, setPortImg] = useState('');
  const [portExternal, setPortExternal] = useState('');
  const [portGithub, setPortGithub] = useState('');
  const [portTools, setPortTools] = useState('');
  const [portSubmitting, setPortSubmitting] = useState(false);

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState(250);
  const [withdrawMethod, setWithdrawMethod] = useState<'bank_transfer' | 'crypto' | 'paypal' | 'stripe'>('crypto');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const loadFreelancerData = async (userId: string) => {
    try {
      const [pRes, aRes, cRes, tRes] = await Promise.all([
        fetch(`/api/freelancers/${userId}`),
        fetch(`/api/projects`),
        fetch(`/api/contracts`),
        fetch(`/api/payments/transactions`)
      ]);

      const pData = await pRes.json();
      if (pData.profile) {
        setProfile(pData.profile);
        setHeadline(pData.profile.headline || '');
        setBio(pData.profile.bio || '');
        setHourlyRate(pData.profile.hourlyRate || 75);
        setMinBudget(pData.profile.minBudget || 500);
        setSkillsStr(pData.profile.skills?.join(', ') || '');
      }

      // Fetch user's proposals
      const userAppsRes = await fetch(`/api/applications/${userId}`);
      // Or filter from contracts & apps
      if (tRes.ok) {
        const tData = await tRes.json();
        setTransactions(tData.transactions || []);
        setWithdrawals(tData.withdrawals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      loadFreelancerData(user.id);
    }
  }, [user, authLoading]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileMsg('');

    try {
      const res = await fetch(`/api/freelancers/${profile.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          bio,
          hourlyRate: Number(hourlyRate),
          minBudget: Number(minBudget),
          skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setProfileMsg('Profile updated successfully!');
      }
    } catch (e: any) {
      setProfileMsg(e.message || 'Save error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setPortSubmitting(true);

    try {
      const res = await fetch(`/api/freelancers/${profile.userId}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: portTitle,
          description: portDesc,
          imageUrl: portImg || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
          externalUrl: portExternal,
          githubUrl: portGithub,
          tools: portTools.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        setAddPortModal(false);
        setPortTitle('');
        setPortDesc('');
        setPortImg('');
        setPortExternal('');
        setPortGithub('');
        setPortTools('');
        loadFreelancerData(profile.userId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPortSubmitting(false);
    }
  };

  const handleDeletePortfolio = async (itemId: string) => {
    if (!profile) return;
    await fetch(`/api/freelancers/${profile.userId}/portfolio?itemId=${itemId}`, { method: 'DELETE' });
    loadFreelancerData(profile.userId);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSubmitting(true);
    setWithdrawMsg('');
    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          method: withdrawMethod,
          accountDetails: withdrawDetails
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg('Withdrawal request successfully queued!');
        setWithdrawDetails('');
        if (user) loadFreelancerData(user.id);
      } else {
        setWithdrawMsg(data.error || 'Withdrawal failed');
      }
    } catch (e: any) {
      setWithdrawMsg(e.message || 'Error submitting');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Synchronizing talent workspace...</p>
      </div>
    );
  }

  const availableEarnings = profile?.totalEarnings || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================== COLLAPSIBLE SIDEBAR ================== */}
        <div className="lg:col-span-3 bg-[#0B0B0F] p-4 rounded-3xl border border-white/[0.08] space-y-2 sticky top-28">
          
          {/* User Mini Card */}
          <div className="p-3 mb-2 rounded-2xl bg-[#121218] border border-white/[0.06] flex items-center gap-3">
            <img
              src={profile?.avatarUrl || user?.avatarUrl || 'https://avatar.vercel.sh/user.png'}
              alt={profile?.fullName || user?.name}
              className="w-10 h-10 rounded-full object-cover border border-violet-500/40"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{profile?.fullName || user?.name}</p>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">Freelancer Tier</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs">
            {/* Direct Home Navigation Link */}
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-gray-300 hover:text-[#73D8C4] hover:bg-[#73D8C4]/10 border border-white/[0.04] transition-colors mb-2 group"
            >
              <Home className="w-4 h-4 text-[#73D8C4] group-hover:scale-110 transition-transform" />
              <span className="font-semibold tracking-wide">Home</span>
            </Link>

            {[
              { id: 'overview', label: 'Overview & Metrics', icon: LayoutDashboard },
              { id: 'profile', label: 'My Profile Editor', icon: User },
              { id: 'portfolio', label: `Portfolio Samples (${profile?.portfolio?.length || 0})`, icon: FolderGit2 },
              { id: 'applications', label: 'My Applications', icon: FileText },
              { id: 'projects', label: 'Active Contracts', icon: Briefcase },
              { id: 'earnings', label: 'Earnings & Ledger', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  activeSection === tab.id
                    ? 'bg-violet-600 text-white shadow-neon-violet font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="pt-2 border-t border-white/[0.06] space-y-1">
              <Link
                href="/projects"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04]"
              >
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Browse Jobs</span>
              </Link>
              <Link
                href="/messages"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04]"
              >
                <Send className="w-4 h-4 text-violet-400" />
                <span>Messages</span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04]"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Leaderboard</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* ================== MAIN CONTENT PANEL ================== */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* SECTION: OVERVIEW & METRICS */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              
              {/* Profile Completion Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/30 via-[#0B0B0F] to-[#0B0B0F] border border-violet-500/20 shadow-neon-violet">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Profile Readiness Index</h2>
                    <p className="text-xs text-gray-400">Complete all milestones to become eligible for verified elite contracts</p>
                  </div>
                  <span className="text-xl font-black text-violet-300">{profile?.profileCompletionPercentage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${profile?.profileCompletionPercentage}%` }}
                  />
                </div>
              </div>

              {/* 8 Overview Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Rating', value: `${profile?.rating || 5.0} ★`, change: '100% 5-Star', color: 'text-amber-400' },
                  { label: 'Merit Score', value: `${profile?.performanceScore?.overallScore || 95}/100`, change: 'Top 3% Platform', color: 'text-violet-400' },
                  { label: 'Completed', value: `${profile?.completedProjectsCount || 0}`, change: '100% on-time', color: 'text-emerald-400' },
                  { label: 'Active Projects', value: '1', change: 'In progress', color: 'text-cyan-400' },
                  { label: 'Total Earnings', value: `$${(profile?.totalEarnings || 0).toLocaleString()}`, change: 'Escrow released', color: 'text-white' },
                  { label: 'Pending Escrow', value: '$2,000', change: 'Milestone 2', color: 'text-gray-300' },
                  { label: 'Profile Views', value: '412', change: '+28% this week', color: 'text-violet-300' },
                  { label: 'Proposals Sent', value: '6', change: '4 Shortlisted', color: 'text-cyan-300' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/[0.08]">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{stat.label}</span>
                    <p className={`text-xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
                    <span className="text-[10px] text-gray-500 block mt-1">{stat.change}</span>
                  </div>
                ))}
              </div>

              {/* Earnings Telemetry Chart Preview */}
              <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Earnings Velocity (Last 6 Months)</h3>
                  <span className="text-xs text-emerald-400 font-semibold">+64% growth</span>
                </div>

                {/* Styled CSS Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-white/[0.08]">
                  {[
                    { month: 'Sep', amount: 4500, height: '40%' },
                    { month: 'Oct', amount: 6200, height: '55%' },
                    { month: 'Nov', amount: 8400, height: '70%' },
                    { month: 'Dec', amount: 11200, height: '85%' },
                    { month: 'Jan', amount: 14800, height: '95%' },
                    { month: 'Feb', amount: 18200, height: '100%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${bar.amount}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-500 group-hover:from-violet-500 group-hover:to-cyan-400 transition-all shadow-neon-violet"
                        style={{ height: bar.height }}
                      />
                      <span className="text-[10px] text-gray-500">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SECTION: PROFILE EDITOR */}
          {activeSection === 'profile' && (
            <div className="p-8 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Freelancer Profile Dossier</h2>
                <p className="text-xs text-gray-400 mt-1">Clients use this information to compare talent and make direct hire offers.</p>
              </div>

              {profileMsg && (
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300">
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Biography & Experience Narrative
                  </label>
                  <textarea
                    rows={5}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white leading-relaxed focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Minimum Project Budget ($)
                    </label>
                    <input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Skills & Tech Stack (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* SECTION: PORTFOLIO MANAGER */}
          {activeSection === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Portfolio Showcase</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Required: At least 1 verified project sample to apply for jobs.</p>
                </div>
                <button
                  onClick={() => setAddPortModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-neon-violet"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project Sample</span>
                </button>
              </div>

              {(!profile?.portfolio || profile.portfolio.length === 0) ? (
                <div className="p-12 text-center rounded-3xl bg-[#0B0B0F] border border-white/[0.08]">
                  <p className="text-sm font-semibold text-white">No portfolio items published</p>
                  <p className="text-xs text-gray-400 mt-1">Add your first project sample to unlock project proposals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-36 object-cover rounded-xl mb-3"
                          />
                        )}
                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] text-cyan-400">{item.category}</span>
                        <button
                          onClick={() => handleDeletePortfolio(item.id)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: ACTIVE CONTRACTS */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Active Projects & Workspaces</h2>
                <p className="text-xs text-gray-400 mt-0.5">Manage deliverables, submit milestones, and chat with clients.</p>
              </div>

              {/* Demo Active Contract */}
              <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-violet-500/30 shadow-neon-violet space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      Active Contract
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">Autonomous Multi-Model LLM Orchestration Platform</h3>
                    <p className="text-xs text-gray-400">Client: Aetheria Labs • Total Escrow: $5,800</p>
                  </div>

                  <Link
                    href="/workspace/contract-demo-1"
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.06] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Milestones</span>
                    <strong className="text-white">1 of 3 Delivered</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Released</span>
                    <strong className="text-emerald-400">$2,000</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Next Due Date</span>
                    <strong className="text-violet-300">Mar 5, 2026</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: EARNINGS & LEDGER */}
          {activeSection === 'earnings' && (
            <EarningsLedgerView />
          )}

        </div>

      </div>

      {/* ADD PORTFOLIO MODAL */}
      {addPortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0B0B0F] border border-violet-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Portfolio Sample</h3>
              <button onClick={() => setAddPortModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddPortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={portTitle}
                  onChange={(e) => setPortTitle(e.target.value)}
                  placeholder="e.g. Synthetix AI Orchestration Engine"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={portDesc}
                  onChange={(e) => setPortDesc(e.target.value)}
                  placeholder="Architecture, technical challenges solved, outcomes..."
                  className="w-full p-3 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={portImg}
                  onChange={(e) => setPortImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Live URL</label>
                  <input
                    type="url"
                    value={portExternal}
                    onChange={(e) => setPortExternal(e.target.value)}
                    placeholder="https://myproject.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">GitHub Repo</label>
                  <input
                    type="url"
                    value={portGithub}
                    onChange={(e) => setPortGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Tools & Tech (Comma separated)</label>
                <input
                  type="text"
                  value={portTools}
                  onChange={(e) => setPortTools(e.target.value)}
                  placeholder="Next.js, Python, Tailwind, Docker"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddPortModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={portSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet disabled:opacity-50"
                >
                  {portSubmitting ? 'Adding...' : 'Save Portfolio Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
