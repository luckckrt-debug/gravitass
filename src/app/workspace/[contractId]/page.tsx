'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Send, 
  Paperclip, 
  FileText, 
  AlertCircle, 
  Star, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  ArrowRight,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Contract, ContractMilestone, ContractTask, Message } from '@/types';
import { formatDate } from '@/lib/utils';

export default function WorkspacePage({ params }: { params: { contractId: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [contract, setContract] = useState<Contract | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'tasks' | 'chat' | 'submit'>('milestones');
  const [loading, setLoading] = useState(true);

  // Chat message input
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Work Submission
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Revision Request
  const [revisionNotes, setRevisionNotes] = useState('');
  const [requestingRevision, setRequestingRevision] = useState(false);

  // Client Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Add Task
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const loadWorkspace = async () => {
    try {
      const res = await fetch(`/api/contracts/${params.contractId}`);
      const data = await res.json();
      if (data.contract) {
        setContract(data.contract);
      }

      // Load conversation for this project
      const convRes = await fetch(`/api/conversations`);
      const convData = await convRes.json();
      const currentConv = convData.conversations?.find((c: any) => c.projectId === data.contract?.projectId || c.id.includes(params.contractId));
      if (currentConv) {
        const msgRes = await fetch(`/api/conversations/${currentConv.id}/messages`);
        const msgData = await msgRes.json();
        if (msgData.messages) setMessages(msgData.messages);
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
      loadWorkspace();
    }
  }, [user, authLoading, params.contractId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !contract) return;
    setSendingMsg(true);

    try {
      const convId = `conv-${contract.projectId}-${contract.freelancerId}`;
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!contract) return;
    try {
      const res = await fetch(`/api/contracts/${contract.id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', milestoneId })
      });
      if (res.ok) {
        loadWorkspace();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    setSubmittingWork(true);

    try {
      const res = await fetch(`/api/contracts/${contract.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: submissionNotes,
          files: submissionLink ? [{ name: 'Deliverable Link', url: submissionLink }] : []
        })
      });
      if (res.ok) {
        setSubmissionSuccess(true);
        loadWorkspace();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!contract || !revisionNotes.trim()) return;
    setRequestingRevision(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'revision_requested',
          revisionNotes
        })
      });
      if (res.ok) {
        setRevisionNotes('');
        loadWorkspace();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestingRevision(false);
    }
  };

  const handleCompleteAndReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/contracts/${contract.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: reviewComment,
          categories: {
            quality: rating,
            communication: rating,
            timeliness: rating,
            expertise: rating
          }
        })
      });
      if (res.ok) {
        setReviewModalOpen(false);
        loadWorkspace();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !contract) return;
    const newTask: ContractTask = {
      id: `tsk-${Date.now()}`,
      contractId: contract.id,
      title: newTaskTitle,
      isCompleted: false,
      assignedTo: contract.freelancerId
    };
    contract.tasks = [...(contract.tasks || []), newTask];
    setContract({ ...contract });
    setNewTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    if (!contract) return;
    contract.tasks = (contract.tasks || []).map(t =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setContract({ ...contract });
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Launching encrypted workspace...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center">
        <h2 className="text-xl font-bold text-white">Workspace Not Found</h2>
        <Link href="/" className="mt-4 inline-block px-4 py-2 bg-violet-600 rounded-xl text-white text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const isClient = user?.id === contract.clientId;
  const isFreelancer = user?.id === contract.freelancerId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      {/* Top Workspace Header */}
      <div className="p-8 rounded-3xl bg-[#0B0B0F] border border-violet-500/30 shadow-neon-violet relative overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                contract.status === 'completed' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              }`}>
                {contract.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Escrow ID: {contract.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
              {contract.projectTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2">
              <span>Client: <strong className="text-white">{contract.clientName}</strong></span>
              <span>•</span>
              <span>Freelancer: <strong className="text-cyan-300">{contract.freelancerName}</strong></span>
              <span>•</span>
              <span>Target Delivery: <strong className="text-white">{formatDate(contract.completionDeadline)}</strong></span>
            </div>
          </div>

          {/* Escrow Telemetry Box */}
          <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] text-right flex-shrink-0 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Total Contract Escrow</span>
            <p className="text-2xl font-black text-emerald-400">${contract.totalAmount.toLocaleString()}</p>
            <span className="text-xs text-gray-400 block">Released: ${contract.paidAmount.toLocaleString()}</span>

            {isClient && contract.status !== 'completed' && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="mt-2 w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all"
              >
                Approve & Complete Project
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/[0.08]">
          {[
            { id: 'milestones', label: `Milestones (${contract.milestones?.length || 0})` },
            { id: 'tasks', label: `Task Checklist (${contract.tasks?.length || 0})` },
            { id: 'chat', label: `Workspace Chat (${messages.length})` },
            { id: 'submit', label: 'Deliverables & Submissions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-neon-violet'
                  : 'text-gray-400 hover:text-white bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================== TAB: MILESTONES ================== */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white">Escrow Milestones</h2>
              <p className="text-xs text-gray-400">Funds are locked securely in escrow until approved by the client.</p>
            </div>
          </div>

          <div className="space-y-3">
            {contract.milestones?.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      m.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : m.status === 'in_progress'
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                        : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'
                    }`}>
                      {m.status.replace('_', ' ')}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">Due {formatDate(m.dueDate)}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{m.title}</h3>
                  <p className="text-xs text-gray-400">{m.description}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-lg font-black text-emerald-400">${m.amount.toLocaleString()}</span>

                  {isClient && m.status !== 'approved' && (
                    <button
                      onClick={() => handleApproveMilestone(m.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      Release ${m.amount} Funds
                    </button>
                  )}

                  {m.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      Released
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================== TAB: TASKS CHECKLIST ================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
            <h2 className="text-base font-bold text-white">Sprint Tasks & Work Items</h2>

            {/* Add Task Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add next action item or deliverable requirement..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleAddTask}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet"
              >
                Add Task
              </button>
            </div>

            <div className="divide-y divide-white/[0.06] pt-2">
              {contract.tasks?.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.isCompleted}
                      onChange={() => toggleTask(t.id)}
                      className="rounded border-white/[0.2] bg-[#121218] text-violet-600 focus:ring-0"
                    />
                    <span className={t.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}>
                      {t.title}
                    </span>
                  </label>
                  <span className="text-[10px] text-gray-500">Assigned: {contract.freelancerName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================== TAB: WORKSPACE CHAT ================== */}
      {activeTab === 'chat' && (
        <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white">Direct Project Communications</h2>

          <div className="h-96 rounded-2xl bg-[#121218] border border-white/[0.06] p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-20">No messages sent yet. Say hello!</p>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-gray-400">
                      <span className="font-semibold text-white">{m.senderName}</span>
                      <span>{formatDate(m.createdAt)}</span>
                    </div>
                    <div className={`p-3 rounded-2xl max-w-lg text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-violet-600 text-white shadow-neon-violet' 
                        : 'bg-[#1a1a24] text-gray-200 border border-white/[0.08]'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message, query, or technical update..."
              className="flex-1 px-4 py-3 rounded-xl bg-[#121218] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={sendingMsg || !newMessage.trim()}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet disabled:opacity-50 flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ================== TAB: DELIVERABLES & SUBMISSION ================== */}
      {activeTab === 'submit' && (
        <div className="space-y-6">
          
          {/* Latest Submission Inspector */}
          {contract.latestSubmission && (
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-cyan-500/30 shadow-neon-cyan space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider">
                Delivered Work Submission
              </span>
              <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                {contract.latestSubmission.notes}
              </p>
              {contract.latestSubmission.files?.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{f.name} ({f.url})</span>
                </a>
              ))}

              {isClient && (
                <div className="pt-4 border-t border-white/[0.06] space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Client Decision</h4>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Optional notes if requesting revisions..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white"
                    />
                    <button
                      onClick={handleRequestRevision}
                      disabled={requestingRevision}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Accept & Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Freelancer Deliverable Upload Form */}
          {isFreelancer && (
            <div className="p-6 rounded-2xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white">Submit Work Deliverables</h3>
              <p className="text-xs text-gray-400">Provide final delivery notes, links to production repositories, staging deployments, or assets.</p>

              {submissionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  Deliverables submitted to client for inspection!
                </div>
              )}

              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Delivery Notes & Documentation
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Describe completed tasks, installation steps, or test credentials..."
                    className="w-full p-3.5 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white leading-relaxed focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Deliverable / Staging / Repository Link
                  </label>
                  <input
                    type="url"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="https://github.com/my-repo or https://staging.app"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121218] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingWork}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet disabled:opacity-50"
                >
                  {submittingWork ? 'Submitting...' : 'Submit Work for Review'}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* CLIENT COMPLETION & REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0B0B0F] border border-violet-500/30 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Complete Contract & Review {contract.freelancerName}</h3>
            <p className="text-xs text-gray-300">
              Your feedback directly updates the transparent 0-100 merit ranking algorithm and releases final completion tokens.
            </p>

            <form onSubmit={handleCompleteAndReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Star Rating: {rating} / 5
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Client Review Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Detail your experience with code quality, velocity, and architectural competence..."
                  className="w-full p-3 rounded-xl bg-[#121218] border border-white/[0.1] text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Confirm & Release Final Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
