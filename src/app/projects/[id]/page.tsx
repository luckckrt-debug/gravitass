'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Send, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Paperclip, 
  UserCheck, 
  X, 
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Project, ProjectApplication, FreelancerProfile } from '@/types';
import { formatDate, getBadgeDetails } from '@/lib/utils';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Freelancer Apply Form
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [proposal, setProposal] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number>(0);
  const [deliveryDays, setDeliveryDays] = useState<number>(14);
  const [selectedPortfolioLinks, setSelectedPortfolioLinks] = useState<string>('');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // Client Hire Modal
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ProjectApplication | null>(null);
  const [initialMilestoneTitle, setInitialMilestoneTitle] = useState('Kickoff & Core Architecture');
  const [initialMilestoneAmount, setInitialMilestoneAmount] = useState(0);
  const [hiringSubmitting, setHiringSubmitting] = useState(false);

  const fetchProjectData = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        setProposedPrice(data.project.budgetMin);
      }
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [params.id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setApplyError('');
    setApplySubmitting(true);

    try {
      const res = await fetch(`/api/projects/${params.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal,
          coverLetter,
          proposedPrice: Number(proposedPrice),
          deliveryDays: Number(deliveryDays),
          portfolioLinks: selectedPortfolioLinks.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setApplySuccess(true);
        setApplyModalOpen(false);
        fetchProjectData();
      } else {
        setApplyError(data.error || 'Failed to submit proposal');
      }
    } catch (err: any) {
      setApplyError(err.message || 'Network error');
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: string, hirePayload?: any) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...hirePayload })
      });
      if (res.ok) {
        const data = await res.json();
        if (status === 'accepted' && data.contract) {
          router.push(`/workspace/${data.contract.id}`);
        } else {
          fetchProjectData();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openHireModal = (app: ProjectApplication) => {
    setSelectedApp(app);
    setInitialMilestoneAmount(Math.round(app.proposedPrice * 0.5));
    setHireModalOpen(true);
  };

  const confirmHire = async () => {
    if (!selectedApp) return;
    setHiringSubmitting(true);
    await handleStatusUpdate(selectedApp.id, 'accepted', {
      milestoneTitle: initialMilestoneTitle,
      milestoneAmount: initialMilestoneAmount
    });
    setHiringSubmitting(false);
    setHireModalOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Loading project specification...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Project Not Found</h2>
        <Link href="/projects" className="mt-4 inline-block px-4 py-2 bg-violet-600 rounded-xl text-white text-xs font-semibold">
          Browse Projects
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === project.clientId;
  const userHasApplied = applications.some(a => a.freelancerId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] shadow-2xl relative overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold uppercase tracking-wider">
                {project.category}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300 capitalize">{project.experienceLevel} Tier</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Posted by {project.clientName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {project.title}
            </h1>

            <p className="text-xs text-gray-400">
              Deadline: {formatDate(project.deadline)} • Proposals: {project.proposalsCount}
            </p>
          </div>

          {/* Budget & Action Box */}
          <div className="p-5 rounded-2xl bg-[#121218] border border-white/[0.08] text-left md:text-right flex-shrink-0 space-y-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
              {project.budgetType === 'fixed' ? 'Fixed Escrow Budget' : 'Hourly Budget'}
            </span>
            <p className="text-2xl font-black text-emerald-400">
              ${project.budgetMin.toLocaleString()} - ${project.budgetMax.toLocaleString()}
            </p>

            {!isOwner && (
              <div className="pt-2">
                {userHasApplied ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Proposal Submitted
                  </span>
                ) : (
                  <button
                    onClick={() => setApplyModalOpen(true)}
                    className="w-full px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet transition-all"
                  >
                    Apply for this Job
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Description & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Description & Owner's Applicant Drawer */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Detailed Brief */}
          <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Project Specification</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>

            {project.attachments && project.attachments.length > 0 && (
              <div className="pt-4 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Attachments:</span>
                <div className="flex flex-wrap gap-2">
                  {project.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-gray-300">
                      <Paperclip className="w-3.5 h-3.5 text-violet-400" />
                      <span>{att.name}</span>
                      <span className="text-[10px] text-gray-500">({att.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CLIENT OWNER VIEW: APPLICANTS COMPARISON TABLE */}
          {isOwner && (
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-violet-500/30 shadow-neon-violet space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block">Client Command Center</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    Applicant Proposals ({applications.length})
                  </h3>
                </div>
                <span className="text-xs text-gray-400">Compare merit scores, review rates & hire directly</span>
              </div>

              {applications.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No proposals submitted yet for this project.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-[#121218] border border-white/[0.08] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.freelancerAvatar}
                            alt={app.freelancerName}
                            className="w-12 h-12 rounded-full object-cover border border-violet-500/40"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white hover:text-violet-300">
                                <Link href={`/freelancers/${app.freelancerId}`}>{app.freelancerName}</Link>
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-600/20 text-violet-300 border border-violet-500/40">
                                SCORE: {app.freelancerScore}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{app.freelancerHeadline}</p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-base font-black text-emerald-400">${app.proposedPrice}</span>
                          <span className="text-xs text-gray-400 block">in {app.deliveryDays} days</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                          {app.proposal}
                        </p>
                      </div>

                      {app.portfolioLinks && app.portfolioLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-gray-500">Portfolio references:</span>
                          {app.portfolioLinks.map((link, i) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 underline text-[11px]"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Client Action Buttons */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Status: <strong className="text-white capitalize">{app.status.replace('_', ' ')}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-gray-300"
                          >
                            Shortlist
                          </button>

                          <button
                            onClick={() => openHireModal(app)}
                            className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-neon-violet"
                          >
                            Hire Candidate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Required Skills & Client Meta */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-xl bg-[#121218] border border-white/[0.08] text-xs font-medium text-gray-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">About the Hirer</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                {project.clientName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{project.clientName}</p>
                <p className="text-xs text-gray-400">Verified Client • 100% Hire Rate</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FREELANCER APPLY MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-[#0B0B0F] border border-violet-500/30 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Apply to: {project.title}</h3>
              <button onClick={() => setApplyModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {applyError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Technical Proposal & Architecture Pitch
                </label>
                <textarea
                  rows={4}
                  required
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Detail your planned approach, technology choices, and architectural steps..."
                  className="w-full p-3 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Cover Letter (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself, relevant projects, and why you are the ideal fit..."
                  className="w-full p-3 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Proposed Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Delivery Time (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Relevant Portfolio Links (Comma-separated)
                </label>
                <input
                  type="text"
                  value={selectedPortfolioLinks}
                  onChange={(e) => setSelectedPortfolioLinks(e.target.value)}
                  placeholder="https://github.com/my-repo, https://live-demo.ai"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applySubmitting}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet disabled:opacity-50"
                >
                  {applySubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT HIRE MODAL */}
      {hireModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0B0B0F] border border-violet-500/30 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Hire {selectedApp.freelancerName}</h3>
            <p className="text-xs text-gray-300">
              Contract Total: <strong className="text-emerald-400">${selectedApp.proposedPrice}</strong>. A dedicated workspace will be created immediately with real-time milestones.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Initial Milestone 1 Title
              </label>
              <input
                type="text"
                value={initialMilestoneTitle}
                onChange={(e) => setInitialMilestoneTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Milestone 1 Escrow Deposit ($)
              </label>
              <input
                type="number"
                value={initialMilestoneAmount}
                onChange={(e) => setInitialMilestoneAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setHireModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmHire}
                disabled={hiringSubmitting}
                className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet disabled:opacity-50"
              >
                {hiringSubmitting ? 'Hiring...' : 'Fund & Launch Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
