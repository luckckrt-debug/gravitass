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
  FileText, 
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
  Home
} from 'lucide-react';
import { Project, ProjectApplication, Contract, Category } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ClientDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'post' | 'projects' | 'applicants' | 'contracts'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [projRes, catRes] = await Promise.all([
        fetch('/api/projects?status=all'),
        fetch('/api/categories')
      ]);
      const projData = await projRes.json();
      const catData = await catRes.json();

      if (projData.projects) setProjects(projData.projects);
      if (catData.categories) setCategories(catData.categories);
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
              { id: 'contracts', label: 'Hired Talent & Escrow', icon: Users }
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

        </div>

      </div>

    </div>
  );
}
