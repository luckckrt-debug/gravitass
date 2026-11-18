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
import { User, Project, Contract, Dispute } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [disputesList, setDisputesList] = useState<Dispute[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'projects' | 'disputes'>('analytics');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.status === 403 || res.status === 401) {
        // Not admin
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Verifying protocol administrator clearance...</p>
      </div>
    );
  }

  // Admin access gate
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto my-24 p-8 rounded-3xl bg-[#0B0B0F] border border-red-500/30 text-center space-y-4">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
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
      <div className="flex items-center gap-2 mb-8 border-b border-white/[0.08] pb-3">
        {[
          { id: 'analytics', label: 'Ecosystem Telemetry', icon: TrendingUp },
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

    </div>
  );
}
