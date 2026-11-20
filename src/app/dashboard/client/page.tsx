'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  PlusCircle, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  MessageSquare, 
  Star, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  LayoutDashboard,
  Search,
  ExternalLink,
  Home,
  ShieldCheck,
  Lock,
  FileText,
  AlertTriangle,
  FileCheck,
  FileCode,
  X
} from 'lucide-react';
import { Project, ProjectApplication, Contract, Category, EscrowAccount, InvoiceRecord, DisputeRecord, Order } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ClientDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'post' | 'projects' | 'applicants' | 'contracts' | 'deliverables' | 'finance'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [escrows, setEscrows] = useState<EscrowAccount[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [escrowFeedback, setEscrowFeedback] = useState('');

  // Deliverables Review & Revision Modal
  const [revisionModalOrder, setRevisionModalOrder] = useState<Order | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [reviewProcessing, setReviewProcessing] = useState(false);

  // Dispute Modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeContractId, setDisputeContractId] = useState('');
  const [disputeReason, setDisputeReason] = useState('Deliverable does not meet specification');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Post Project Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('development');
  const [subcategory, setSubcategory] = useState('Full Stack Development');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>('fixed');
  const [budgetMin, setBudgetMin] = useState(1500);
  const [budgetMax, setBudgetMax] = useState(3500);
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'intermediate' | 'expert'>('expert');
  const [postingSubmitting, setPostingSubmitting] = useState(false);
  const [postMsg, setPostMsg] = useState('');

  const loadClientData = async () => {
    try {
      const [projRes, catRes, escRes, invRes, ordRes] = await Promise.all([
        fetch('/api/projects?status=all'),
        fetch('/api/categories'),
        fetch('/api/finance/escrow'),
        fetch('/api/finance/invoices'),
        fetch(`/api/orders?userId=${user?.id || 'user-client-1'}&role=client`)
      ]);
      const projData = await projRes.json();
      const catData = await catRes.json();
      const escData = await escRes.json();
      const invData = await invRes.json();
      const ordData = await ordRes.json();

      if (projData.projects) setProjects(projData.projects);
      if (catData.categories) setCategories(catData.categories);
      if (escData.escrows) setEscrows(escData.escrows);
      if (invData.invoices) setInvoices(invData.invoices);
      if (ordData.orders) setClientOrders(ordData.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeliverables = async (orderId: string) => {
    if (!confirm('Are you sure you want to approve these deliverables? Escrow payment will be released to the freelancer.')) return;
    setReviewProcessing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', userId: user?.id || 'user-client-1' })
      });
      const data = await res.json();
      if (res.ok) {
        setEscrowFeedback('Deliverables approved! Escrow payment released to freelancer and platform commission recorded.');
        loadClientData();
      } else {
        alert(data.error || 'Approval failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error approving deliverables');
    } finally {
      setReviewProcessing(false);
    }
  };

  const handleRequestRevisionSubmit = async () => {
    if (!revisionModalOrder || !revisionFeedback.trim()) return;
    setReviewProcessing(true);
    try {
      const res = await fetch(`/api/orders/${revisionModalOrder.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_revision',
          userId: user?.id || 'user-client-1',
          reason: revisionFeedback.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEscrowFeedback('Revision requested. Freelancer has been notified with your feedback.');
        setRevisionModalOrder(null);
        setRevisionFeedback('');
        loadClientData();
      } else {
        alert(data.error || 'Revision request failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error requesting revision');
    } finally {
      setReviewProcessing(false);
    }
  };

  const handleFundEscrow = async (contractId: string, amount: number) => {
    try {
      setEscrowFeedback('Securing funds in escrow vault...');
      const res = await fetch('/api/finance/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fund',
          contractId,
          amount,
          paymentReference: `ESC-DEP-${Date.now().toString(36).toUpperCase()}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEscrowFeedback(`Escrow successfully funded! Invoice issued: ${data.invoice?.invoiceNumber}`);
        loadClientData();
      } else {
        setEscrowFeedback(`Error funding escrow: ${data.error}`);
      }
    } catch (err: any) {
      setEscrowFeedback(err.message || 'Network error');
    }
  };

  const handleReleaseMilestone = async (contractId: string, milestoneId: string) => {
    if (!confirm('Are you sure you want to approve this milestone and release escrow funds to the freelancer?')) return;
    try {
      setEscrowFeedback('Releasing milestone funds...');
      const res = await fetch('/api/finance/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release',
          contractId,
          milestoneId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEscrowFeedback('Milestone approved! Escrow payment released to specialist.');
        loadClientData();
      } else {
        setEscrowFeedback(`Release error: ${data.error}`);
      }
    } catch (err: any) {
      setEscrowFeedback(err.message || 'Network error');
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeContractId || !disputeDesc.trim()) return;
    setSubmittingDispute(true);
    try {
      const res = await fetch('/api/finance/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: disputeContractId,
          reason: disputeReason,
          description: disputeDesc
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEscrowFeedback('Formal dispute registered. Unreleased escrow funds are locked.');
        setDisputeModalOpen(false);
        setDisputeDesc('');
        loadClientData();
      } else {
        setEscrowFeedback(`Dispute filing failed: ${data.error}`);
      }
    } catch (err: any) {
      setEscrowFeedback(err.message || 'Network error');
    } finally {
      setSubmittingDispute(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      loadClientData();
    }
  }, [user, authLoading]);

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingSubmitting(true);
    setPostMsg('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          subcategory,
          description,
          requiredSkills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
          budgetType,
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax),
          experienceLevel
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPostMsg('Project posted live to the GRAVITASS talent network!');
        setTitle('');
        setDescription('');
        setSkillsStr('');
        loadClientData();
        setActiveTab('projects');
      } else {
        setPostMsg(data.error || 'Failed to post project');
      }
    } catch (err: any) {
      setPostMsg(err.message || 'Error posting');
    } finally {
      setPostingSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to close and delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    loadClientData();
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Loading enterprise command center...</p>
      </div>
    );
  }

  const userProjects = projects.filter(p => !user || p.clientId === user.id || p.clientId === 'user-client-1');
  const activeProjectsCount = userProjects.filter(p => p.status === 'open' || p.status === 'in_progress').length;
  const completedProjectsCount = userProjects.filter(p => p.status === 'completed').length;
  const totalBidsCount = userProjects.reduce((acc, p) => acc + (p.proposalsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================== COLLAPSIBLE CLIENT SIDEBAR ================== */}
        <div className="lg:col-span-3 bg-[#0B0B0F] p-4 rounded-3xl border border-white/[0.08] space-y-2 sticky top-28">
          
          <div className="p-3 mb-2 rounded-2xl bg-[#121218] border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-sm">
              {user?.name.slice(0, 2).toUpperCase() || 'AL'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">Enterprise Hirer</span>
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
              { id: 'overview', label: 'Hirer Overview', icon: LayoutDashboard },
              { id: 'post', label: 'Post a New Project', icon: PlusCircle },
              { id: 'projects', label: `My Projects (${userProjects.length})`, icon: Briefcase },
              { id: 'contracts', label: 'Hired Talent & Escrow', icon: Users },
              { id: 'deliverables', label: `Review Deliverables (${clientOrders.filter(o => o.status === 'submitted').length})`, icon: FileCheck },
              { id: 'finance', label: 'Finance & Escrow Vaults', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-neon-cyan font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="pt-2 border-t border-white/[0.06] space-y-1">
              <Link
                href="/explore"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04]"
              >
                <Search className="w-4 h-4 text-violet-400" />
                <span>Find Freelancers</span>
              </Link>
              <Link
                href="/messages"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04]"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Messages</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* ================== MAIN CLIENT PANEL ================== */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Projects Posted', value: `${userProjects.length}`, change: 'Across all categories', color: 'text-white' },
                  { label: 'Active Sprints', value: `${activeProjectsCount}`, change: 'Open / In Progress', color: 'text-cyan-400' },
                  { label: 'Completed Deliveries', value: `${completedProjectsCount}`, change: '100% verified', color: 'text-emerald-400' },
                  { label: 'Total Escrow Spending', value: '$48,500', change: 'Escrow protected', color: 'text-violet-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/[0.08]">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">{stat.label}</span>
                    <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                    <span className="text-[10px] text-gray-500 block mt-1">{stat.change}</span>
                  </div>
                ))}
              </div>

              {/* Spending & Activity Visualization */}
              <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Enterprise Spending & Deliveries</h3>
                  <span className="text-xs text-cyan-400 font-semibold">Q1 Milestone Cadence</span>
                </div>

                <div className="h-40 flex items-end justify-between gap-3 pt-6 border-b border-white/[0.08]">
                  {[
                    { sprint: 'Sprint 1', amount: 8500, height: '45%' },
                    { sprint: 'Sprint 2', amount: 12400, height: '65%' },
                    { sprint: 'Sprint 3', amount: 9800, height: '50%' },
                    { sprint: 'Sprint 4', amount: 16200, height: '85%' },
                    { sprint: 'Sprint 5', amount: 21500, height: '100%' },
                  ].map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${s.amount}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-400 transition-all shadow-neon-cyan"
                        style={{ height: s.height }}
                      />
                      <span className="text-[10px] text-gray-500">{s.sprint}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Post Prompt Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0B0B0F] to-[#0B0B0F] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Need another specialized contractor?</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Post a detailed scope and start reviewing ranked candidates within minutes.</p>
                </div>
                <button
                  onClick={() => setActiveTab('post')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-neon-cyan transition-all flex-shrink-0"
                >
                  Create Brief
                </button>
              </div>

            </div>
          )}

          {/* TAB: POST A PROJECT */}
          {activeTab === 'post' && (
            <div className="p-8 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Create a New Project Brief</h2>
                <p className="text-xs text-gray-400 mt-1">Specify your technical requirements, deliverables, budget range, and timeline.</p>
              </div>

              {postMsg && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300">
                  {postMsg}
                </div>
              )}

              <form onSubmit={handlePostProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Real-Time Streaming LLM Analytics Pipeline"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Main Department
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. AI Workflow Automation"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Detailed Scope & Deliverables
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your technical problem, architecture expectations, milestones, and deliverables..."
                    className="w-full p-3.5 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white leading-relaxed focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    placeholder="Python, LangChain, Next.js, Redis, Docker"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Budget Type
                    </label>
                    <select
                      value={budgetType}
                      onChange={(e) => setBudgetType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="fixed">Fixed Price Escrow</option>
                      <option value="hourly">Hourly Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Min Budget ($)
                    </label>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Max Budget ($)
                    </label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={postingSubmitting}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-neon-cyan disabled:opacity-50"
                >
                  {postingSubmitting ? 'Publishing...' : 'Publish Project to Gravitass'}
                </button>
              </form>
            </div>
          )}

          {/* TAB: MY PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Published Project Briefs</h2>
                <button
                  onClick={() => setActiveTab('post')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-neon-cyan flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Another</span>
                </button>
              </div>

              {userProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/[0.04] text-cyan-300 border border-white/[0.06]">
                        {p.category}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 capitalize">{p.status}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{formatDate(p.createdAt)}</span>
                    </div>

                    <h3 className="text-base font-bold text-white hover:text-cyan-300">
                      <Link href={`/projects/${p.id}`}>{p.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right text-xs">
                      <span className="font-bold text-emerald-400 block">${p.budgetMin} - ${p.budgetMax}</span>
                      <span className="text-cyan-300 font-medium">{p.proposalsCount} Applicants</span>
                    </div>

                    <Link
                      href={`/projects/${p.id}`}
                      className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-gray-200"
                    >
                      View & Manage
                    </Link>

                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/10"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: HIRED TALENT & CONTRACTS */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Active Contracts & Workspaces</h2>
                <p className="text-xs text-gray-400 mt-0.5">Inspect deliverables, release milestone escrow, and collaborate.</p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-cyan-500/30 shadow-neon-cyan space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      Hired Talent Active
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">Elena Vance</h3>
                    <p className="text-xs text-gray-400">Autonomous Multi-Model LLM Orchestration Platform • $5,800 Total Escrow</p>
                  </div>

                  <Link
                    href="/workspace/contract-demo-1"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-neon-cyan transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEW WORK DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 uppercase">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Client Milestone Deliverable Review</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">Review & Approve Work Deliverables</h2>
                  <p className="text-xs text-gray-400">
                    Inspect submitted codebases, documents, and test benchmarks. Approving deliverables releases escrow funds to the specialist.
                  </p>
                </div>
              </div>

              {clientOrders.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-3">
                  <FileCheck className="w-10 h-10 text-gray-600 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-300">No active work deliverables</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">When your hired freelancers submit completed work, it will appear here for your review and approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientOrders.map((order) => (
                    <div key={order.id} className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                              {order.id}
                            </span>
                            <span className="text-base font-bold text-white">{order.projectTitle}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Freelancer: <strong className="text-white">{order.freelancerName}</strong> &bull; Deadline: {formatDate(order.deadline)}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-extrabold text-cyan-400">₹{order.agreedPriceINR.toLocaleString('en-IN')}</p>
                          <span className={`text-[10px] font-bold uppercase ${
                            order.status === 'submitted' ? 'text-amber-400' :
                            order.status === 'completed' ? 'text-emerald-400' : 'text-gray-400'
                          }`}>
                            Status: {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Submissions list with versions */}
                      {order.submissions && order.submissions.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Submitted Deliverables</h4>
                          {order.submissions.map((sub) => (
                            <div key={sub.id} className="p-4 rounded-2xl bg-[#121218] border border-white/[0.06] space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono font-bold text-[10px]">
                                    Version {sub.version}
                                  </span>
                                  <span className="text-xs font-bold text-white">{sub.milestoneTitle || 'Milestone Deliverable'}</span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase ${
                                  sub.status === 'approved' ? 'text-emerald-400' :
                                  sub.status === 'revision_requested' ? 'text-amber-400' : 'text-cyan-400'
                                }`}>
                                  {sub.status.replace('_', ' ')}
                                </span>
                              </div>

                              <p className="text-xs text-gray-300 leading-relaxed">{sub.description}</p>

                              {sub.files && sub.files.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {sub.files.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href={file.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-cyan-300 font-medium transition-colors"
                                    >
                                      <FileCode className="w-3.5 h-3.5" />
                                      <span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              <span className="text-[10px] text-gray-500 block pt-1">Submitted at {formatDate(sub.submittedAt)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-[#121218] text-xs text-gray-400 italic">
                          Freelancer is currently working on deliverables (Progress: {order.progressPercentage}%).
                        </div>
                      )}

                      {/* Review Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Escrow Protected &bull; Funds safe until approved</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {order.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => {
                                  setDisputeContractId(order.contractId);
                                  setDisputeModalOpen(true);
                                }}
                                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold"
                              >
                                Dispute
                              </button>
                              <button
                                onClick={() => setRevisionModalOrder(order)}
                                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                              >
                                Request Revision
                              </button>
                              <button
                                onClick={() => handleApproveDeliverables(order.id)}
                                disabled={reviewProcessing}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg disabled:opacity-50"
                              >
                                {reviewProcessing ? 'Processing...' : 'Approve Work & Release Payment'}
                              </button>
                            </>
                          )}

                          {order.status === 'completed' && (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Deliverables Approved & Payment Released</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: FINANCE & ESCROW VAULTS */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cryptographic Milestone Escrow Protection</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">Project Funding & Escrow Vaults</h2>
                  <p className="text-xs text-gray-400">
                    Funds are secured in segregated trustee vaults. Release milestones upon verification or raise formal arbitration.
                  </p>
                </div>
              </div>

              {escrowFeedback && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                  {escrowFeedback}
                </div>
              )}

              {/* Escrow Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Escrow Funded', value: `$${escrows.reduce((s, e) => s + (e.fundedAmount || 0), 0).toLocaleString()}`, color: 'text-white' },
                  { label: 'Active In Escrow', value: `$${escrows.reduce((s, e) => s + Math.max(0, (e.fundedAmount || 0) - (e.releasedAmount || 0) - (e.refundedAmount || 0)), 0).toLocaleString()}`, color: 'text-cyan-400' },
                  { label: 'Released To Talent', value: `$${escrows.reduce((s, e) => s + (e.releasedAmount || 0), 0).toLocaleString()}`, color: 'text-emerald-400' },
                  { label: 'Invoices Issued', value: `${invoices.length}`, color: 'text-violet-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/[0.08]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">{stat.label}</span>
                    <p className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Escrow Accounts Table */}
              <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Contract Vaults</h3>

                {escrows.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center">No active contract escrow vaults found.</p>
                ) : (
                  <div className="space-y-4">
                    {escrows.map((esc) => {
                      const unreleased = Math.max(0, esc.fundedAmount - esc.releasedAmount - esc.refundedAmount);
                      return (
                        <div key={esc.id} className="p-5 rounded-2xl bg-[#121218] border border-white/[0.08] space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                  esc.isDisputed 
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                }`}>
                                  {esc.isDisputed ? 'LOCKED UNDER DISPUTE' : esc.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs font-mono text-gray-500">{esc.id}</span>
                              </div>
                              <h4 className="text-base font-bold text-white mt-1">{esc.projectTitle}</h4>
                              <p className="text-xs text-gray-400">
                                Assigned Talent: <strong className="text-white">{esc.freelancerName}</strong> &bull; Total Escrow: <strong className="text-cyan-400">${esc.totalGrossAmount.toLocaleString()}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {unreleased > 0 && !esc.isDisputed && (
                                <button
                                  onClick={() => {
                                    setDisputeContractId(esc.contractId);
                                    setDisputeModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-rose-500/40 hover:bg-rose-500/10 text-rose-300 text-xs font-mono transition-all"
                                >
                                  Dispute Vault
                                </button>
                              )}
                              <a
                                href={`/api/finance/invoices?contractId=${esc.contractId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-gray-300 transition-all flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Tax Invoices</span>
                              </a>
                            </div>
                          </div>

                          {/* Milestones in this Escrow */}
                          <div className="pt-2 border-t border-white/[0.06] space-y-2">
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Milestones & Release Controls</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {esc.milestones.map((m) => (
                                <div key={m.milestoneId} className="p-3 rounded-xl bg-[#0B0B0F] border border-white/[0.04] flex items-center justify-between gap-3 text-xs">
                                  <div>
                                    <p className="font-semibold text-gray-200">{m.title}</p>
                                    <span className="text-[10px] font-mono text-gray-500 capitalize">
                                      ${m.amount.toLocaleString()} &bull; {m.status.replace(/_/g, ' ')}
                                    </span>
                                  </div>

                                  {m.status !== 'payment_released' && !esc.isDisputed && (
                                    <button
                                      onClick={() => handleReleaseMilestone(esc.contractId, m.milestoneId)}
                                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold transition-all shadow-neon-emerald"
                                    >
                                      Approve & Release
                                    </button>
                                  )}
                                  {m.status === 'payment_released' && (
                                    <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Released</span>
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Invoices & Receipts Section */}
              <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Client Billing Invoices & Receipts</h3>
                {invoices.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">No invoices issued yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[10px] font-mono text-gray-500 uppercase">
                          <th className="py-3 px-4">Invoice #</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4 text-right">View / Print</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-mono text-cyan-400 font-medium">{inv.invoiceNumber}</td>
                            <td className="py-3 px-4 text-gray-400 font-mono">{new Date(inv.issueDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-gray-300 capitalize">{inv.type.replace(/_/g, ' ')}</td>
                            <td className="py-3 px-4 font-mono font-bold text-white">${inv.grandTotal.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">
                              <a
                                href={`/api/finance/invoices/${inv.id}?format=html`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-lg border border-white/[0.1] hover:border-cyan-400 text-[10px] font-mono text-cyan-400 uppercase"
                              >
                                View PDF
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* REVISION REQUEST MODAL */}
          {revisionModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="bg-[#0B0B0F] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-wider">
                    <FileCheck className="w-4 h-4" />
                    <span>Request Deliverable Revision</span>
                  </div>
                  <button onClick={() => setRevisionModalOrder(null)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  Provide specific technical feedback for {revisionModalOrder.freelancerName} on Order {revisionModalOrder.id}.
                </p>

                <div className="space-y-4">
                  <textarea
                    rows={4}
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    placeholder="Specify the changes, missing test cases, or modifications required..."
                    className="w-full bg-[#121218] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 leading-relaxed"
                    required
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRevisionModalOrder(null)}
                      className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestRevisionSubmit}
                      disabled={reviewProcessing || !revisionFeedback.trim()}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#071011] text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {reviewProcessing ? 'Sending...' : 'Send Revision Feedback'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {disputeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-[#0B0B0F] border border-red-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Raise Formal Escrow Dispute</span>
                </div>
                <p className="text-xs text-gray-400">
                  Initiating a dispute places an immediate administrative freeze on all unreleased contract funds.
                </p>

                <form onSubmit={handleSubmitDispute} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Primary Reason</label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full bg-[#121218] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono"
                    >
                      <option value="Deliverable does not meet specification">Deliverable does not meet specification</option>
                      <option value="Unresponsive specialist">Unresponsive specialist</option>
                      <option value="Quality below agreed standard">Quality below agreed standard</option>
                      <option value="Mutual cancellation request">Mutual cancellation request</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Detailed Explanation & Evidence</label>
                    <textarea
                      rows={3}
                      value={disputeDesc}
                      onChange={(e) => setDisputeDesc(e.target.value)}
                      placeholder="Explain the milestone non-conformance or reason..."
                      className="w-full bg-[#121218] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDisputeModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDispute}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                    >
                      {submittingDispute ? 'Filing...' : 'Lock Funds & Open Dispute'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
