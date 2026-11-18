'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  Filter, 
  Sparkles,
  TrendingUp,
  Layers,
  Lock
} from 'lucide-react';
import { User, Project, Contract, Dispute, WithdrawalRequest, PlatformSettings } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [disputesList, setDisputesList] = useState<Dispute[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [commissionInput, setCommissionInput] = useState<number>(10);
  const [minWithdrawalInput, setMinWithdrawalInput] = useState<number>(20);
  const [savingSettings, setSavingSettings] = useState(false);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'projects' | 'disputes' | 'payouts'>('analytics');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.status === 403 || res.status === 401) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.analytics) {
        setAnalytics(data.analytics);
        setUsersList(data.users || []);
        setProjectsList(data.projects || []);
        setDisputesList(data.disputes || []);
      }

      // Load withdrawals and platform settings
      const [wthRes, setRes] = await Promise.all([
        fetch('/api/admin/withdrawals'),
        fetch('/api/admin/settings')
      ]);

      if (wthRes.ok) {
        const wthData = await wthRes.json();
        setWithdrawalsList(wthData.withdrawals || []);
      }

      if (setRes.ok) {
        const setData = await setRes.json();
        setPlatformSettings(setData.settings);
        if (setData.settings) {
          setCommissionInput(setData.settings.commissionPercentage);
          setMinWithdrawalInput(setData.settings.minWithdrawalAmount);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setActionMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionPercentage: commissionInput,
          minWithdrawalAmount: minWithdrawalInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPlatformSettings(data.settings);
        setActionMsg('Platform commission & withdrawal limits updated successfully!');
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExecutePayout = async (withdrawalId: string) => {
    setProcessingPayoutId(withdrawalId);
    setActionMsg('');
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          action: 'execute_payout'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Payout settled! Reference: ${data.withdrawal.paymentReference}`);
        loadAdminData();
      } else {
        alert(data.error || 'Payout execution failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const handleRejectPayout = async (withdrawalId: string) => {
    const reason = prompt('Please enter the rejection reason (amount will be restored to freelancer):');
    if (!reason) return;

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          action: 'rejected',
          failureReason: reason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg('Withdrawal rejected. Reserved balance restored to freelancer.');
        loadAdminData();
      } else {
        alert(data.error || 'Rejection failed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      loadAdminData();
    }
  }, [user, authLoading]);

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isVerified: !currentStatus })
      });
      if (res.ok) {
        setActionMsg('User verification updated successfully');
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        setActionMsg(`User role updated to ${role}`);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project as admin?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    loadAdminData();
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Verifying protocol administrator clearance...</p>
      </div>
    );
  }

  // Admin access gate
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto pt-32 pb-20 p-8 rounded-3xl bg-[#0B0B0F] border border-red-500/30 text-center space-y-4">
        <Lock className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied: Admin Clearance Required</h2>
        <p className="text-xs text-gray-400">
          This gateway is restricted to protocol operators. Log in with an administrator account to continue.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold"
        >
          Sign In as Admin (admin@gravitass.com)
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>GRAVITASS Operator Root Console</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white">Platform Administration</h1>
          <p className="text-xs text-gray-400 mt-1">Manage network accounts, verify elite credentials, moderate briefs, and monitor escrow volume.</p>
        </div>

        <div className="flex items-center gap-2">
          {actionMsg && (
            <span className="text-xs font-medium text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              {actionMsg}
            </span>
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-white/[0.08] pb-3">
        {[
          { id: 'analytics', label: 'Ecosystem Telemetry', icon: TrendingUp },
          { id: 'payouts', label: `Earnings & Payouts (${withdrawalsList.length})`, icon: DollarSign },
          { id: 'users', label: `Users & Verification (${usersList.length})`, icon: Users },
          { id: 'projects', label: `Projects Moderation (${projectsList.length})`, icon: Briefcase },
          { id: 'disputes', label: 'Disputes & Escrow Holds', icon: AlertTriangle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-gray-400 hover:text-white bg-transparent'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================== TAB 1: ANALYTICS ================== */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Network Users', value: analytics.totalUsers, color: 'text-white' },
              { label: 'Active Freelancers', value: analytics.totalFreelancers, color: 'text-cyan-400' },
              { label: 'Total Projects Posted', value: analytics.totalProjects, color: 'text-violet-400' },
              { label: 'Settled Escrow GMV', value: `$${analytics.totalGMV.toLocaleString()}`, color: 'text-emerald-400' }
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/[0.08]">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">{stat.label}</span>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Escrow Integrity & Health</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              All contract funds are backed by smart milestone reserves. Zero chargebacks or unauthorized dispute escalations detected.
            </p>
          </div>
        </div>
      )}

      {/* ================== TAB 2: USERS MANAGEMENT ================== */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white">Registered Users & Verifications</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-white/[0.08]">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://avatar.vercel.sh/user.png'}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/[0.1]"
                        />
                        <span className="font-bold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">{u.email}</td>
                    <td className="py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#121218] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-gray-200"
                      >
                        <option value="freelancer">Freelancer</option>
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isVerified 
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-white/[0.04] text-gray-400'
                      }`}>
                        {u.isVerified ? 'Verified Pro' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleVerification(u.id, Boolean(u.isVerified))}
                        className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-violet-600 hover:text-white text-[11px] font-medium text-gray-300 transition-colors"
                      >
                        {u.isVerified ? 'Revoke Badge' : 'Grant Verified'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================== TAB 3: PROJECTS MODERATION ================== */}
      {activeTab === 'projects' && (
        <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white">Live Project Briefs Moderation</h2>

          <div className="space-y-3">
            {projectsList.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#121218] border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h3 className="font-bold text-white text-sm">{p.title}</h3>
                  <p className="text-gray-400 text-[11px]">By {p.clientName} • Category: {p.category} • Budget: ${p.budgetMin}-${p.budgetMax}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="capitalize px-2 py-0.5 rounded bg-white/[0.04] text-gray-300 font-medium">
                    {p.status}
                  </span>
                  <Link
                    href={`/projects/${p.id}`}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300"
                    title="View project"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================== TAB 4: DISPUTES ================== */}
      {activeTab === 'disputes' && (
        <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4 text-xs">
          <h2 className="text-base font-bold text-white">Escrow Disputes Resolution</h2>
          {disputesList.length === 0 ? (
            <p className="text-gray-400 py-8 text-center">Zero disputes reported. All escrow contracts running smoothly.</p>
          ) : (
            <p className="text-gray-300">Managing dispute tickets...</p>
          )}
        </div>
      )}

      {/* ================== TAB 5: EARNINGS & PAYOUTS MANAGEMENT ================== */}
      {activeTab === 'payouts' && (
        <div className="space-y-8 text-xs">
          
          {/* Configurable Commission & Withdrawal Limits Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#73D8C4] block">
                  FINANCIAL POLICY CONTROLS
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Platform Commission & Withdrawal Rules</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Changes take effect immediately on all future project completions and payout validations.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#73D8C4]/15 border border-[#73D8C4]/40 text-[#73D8C4] font-mono text-[10px] uppercase">
                Active Policy
              </span>
            </div>

            <form onSubmit={handleSavePlatformSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-gray-300 uppercase block">
                  Platform Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(Number(e.target.value))}
                    className="w-full bg-[#121218] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#73D8C4]"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">%</span>
                </div>
                <p className="text-[10px] text-gray-500">
                  Default: 10%. Deducted automatically upon milestone approval.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono text-gray-300 uppercase block">
                  Minimum Withdrawal ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">$</span>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={minWithdrawalInput}
                    onChange={(e) => setMinWithdrawalInput(Number(e.target.value))}
                    className="w-full bg-[#121218] border border-white/[0.1] rounded-xl pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#73D8C4]"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-500">
                  Minimum balance a freelancer must hold to trigger a payout.
                </p>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-2.5 rounded-xl bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs font-semibold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(115,216,196,0.3)] disabled:opacity-50"
                >
                  {savingSettings ? 'Saving Policy...' : 'Save Financial Policy'}
                </button>
              </div>
            </form>
          </div>

          {/* Freelancer Withdrawal Queue */}
          <div className="p-6 rounded-3xl bg-[#0B0B0F] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Freelancer Payout Requests</h3>
                <p className="text-xs text-gray-400">Review pending payouts, dispatch through Indian Banking / UPI gateway, or reject with atomic refund.</p>
              </div>
              <span className="text-xs font-mono text-[#91A09E]">
                Total Requests: {withdrawalsList.length}
              </span>
            </div>

            {withdrawalsList.length === 0 ? (
              <p className="text-gray-400 py-12 text-center">No pending withdrawal requests in queue.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121218] text-[10px] uppercase font-mono tracking-wider text-gray-400 border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4">Withdrawal ID</th>
                      <th className="py-3 px-4">Freelancer</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {withdrawalsList.map((w) => (
                      <tr key={w.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono text-gray-300">
                          <div>{w.id}</div>
                          <div className="text-[10px] text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{w.freelancerName}</div>
                          <div className="text-[10px] text-gray-400">{w.freelancerId}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-[#73D8C4]">
                          ${w.finalAmount.toFixed(2)}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-gray-200 capitalize">{w.method.replace('_', ' ')}</div>
                          <div className="text-[10px] font-mono text-gray-400">
                            {w.payoutDetails.maskedAccount || w.payoutDetails.maskedUpi}
                            {w.payoutDetails.ifsc && ` (${w.payoutDetails.ifsc})`}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            w.status === 'paid' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : w.status === 'rejected' || w.status === 'failed'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {w.status}
                          </span>
                          {w.paymentReference && (
                            <div className="text-[9px] font-mono text-[#A5E8DE] mt-1">{w.paymentReference}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {w.status === 'requested' || w.status === 'under_review' || w.status === 'processing' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleExecutePayout(w.id)}
                                disabled={processingPayoutId === w.id}
                                className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] uppercase font-bold disabled:opacity-50"
                              >
                                {processingPayoutId === w.id ? 'Dispatching...' : 'Approve & Payout'}
                              </button>
                              <button
                                onClick={() => handleRejectPayout(w.id)}
                                className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono text-[10px] uppercase"
                              >
                                Reject & Restore
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-500 italic">Settled</span>
                          )}
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

    </div>
  );
}
