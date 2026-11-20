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
  Home,
  Building,
  Smartphone,
  AlertCircle,
  FileCheck,
  RefreshCw,
  UploadCloud,
  Check,
  X,
  FileCode,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  FreelancerProfile, 
  ProjectApplication, 
  Contract, 
  PortfolioItem, 
  Transaction, 
  WithdrawalRequest,
  Order,
  OrderStatus,
  FreelancerBankAccount,
  FreelancerUpiAccount,
  Notification
} from '@/types';
import { formatDate } from '@/lib/utils';
import EarningsLedgerView from '@/components/dashboard/EarningsLedgerView';

export default function FreelancerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // 12 Sidebar Navigation Sections
  type SectionType = 
    | 'overview' 
    | 'orders' 
    | 'my_work' 
    | 'submit_work' 
    | 'earnings' 
    | 'withdraw' 
    | 'bank_accounts' 
    | 'messages' 
    | 'reviews' 
    | 'notifications' 
    | 'profile' 
    | 'settings';

  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderTab, setOrderTab] = useState<'new' | 'active' | 'submitted' | 'completed' | 'cancelled'>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [bankAccounts, setBankAccounts] = useState<FreelancerBankAccount[]>([]);
  const [upiAccounts, setUpiAccounts] = useState<FreelancerUpiAccount[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Pre-Acceptance Modal State
  const [acceptModalOrder, setAcceptModalOrder] = useState<Order | null>(null);
  const [declineModalOrder, setDeclineModalOrder] = useState<Order | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [orderProcessing, setOrderProcessing] = useState(false);

  // My Work / Workspace State
  const [activeWorkspaceOrderId, setActiveWorkspaceOrderId] = useState<string>('');
  const [workspaceProgress, setWorkspaceProgress] = useState(50);
  const [workspaceNotes, setWorkspaceNotes] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);

  // Submit Work Form State
  const [submitOrderId, setSubmitOrderId] = useState('');
  const [submitMilestoneId, setSubmitMilestoneId] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitFileName, setSubmitFileName] = useState('');
  const [submitFileType, setSubmitFileType] = useState('application/zip');
  const [submitFileSize, setSubmitFileSize] = useState(15400000);
  const [submitFileUrl, setSubmitFileUrl] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Instant Withdrawal State
  const [withdrawAmountINR, setWithdrawAmountINR] = useState(15000);
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'upi'>('bank');
  const [withdrawDestinationId, setWithdrawDestinationId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Add Bank / UPI State
  const [newBankModal, setNewBankModal] = useState(false);
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountType, setBankAccountType] = useState<'savings' | 'current'>('savings');
  const [savingBank, setSavingBank] = useState(false);

  const [newUpiModal, setNewUpiModal] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);

  // Profile Editor state
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(75);
  const [minBudget, setMinBudget] = useState(500);
  const [skillsStr, setSkillsStr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const loadFreelancerData = async (userId: string) => {
    try {
      const [pRes, oRes, bRes, nRes, lRes] = await Promise.all([
        fetch(`/api/freelancers/${userId}`),
        fetch(`/api/orders?userId=${userId}&role=freelancer`),
        fetch(`/api/finance/bank-accounts?freelancerId=${userId}`),
        fetch(`/api/notifications?userId=${userId}`),
        fetch(`/api/finance/ledger?freelancerId=${userId}`)
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.profile) {
          setProfile(pData.profile);
          setHeadline(pData.profile.headline || '');
          setBio(pData.profile.bio || '');
          setHourlyRate(pData.profile.hourlyRate || 75);
          setMinBudget(pData.profile.minBudget || 500);
          setSkillsStr(pData.profile.skills?.join(', ') || '');
        }
      }

      if (oRes.ok) {
        const oData = await oRes.json();
        const ords = oData.orders || [];
        setOrders(ords);
        if (ords.length > 0 && !activeWorkspaceOrderId) {
          const activeOrd = ords.find((o: Order) => o.status === 'in_progress' || o.status === 'accepted') || ords[0];
          setActiveWorkspaceOrderId(activeOrd.id);
          setWorkspaceProgress(activeOrd.progressPercentage || 0);
          setWorkspaceNotes(activeOrd.workNotes || '');
          setSubmitOrderId(activeOrd.id);
        }
      }

      if (bRes.ok) {
        const bData = await bRes.json();
        setBankAccounts(bData.bankAccounts || []);
        setUpiAccounts(bData.upiAccounts || []);
        if (bData.bankAccounts && bData.bankAccounts.length > 0 && !withdrawDestinationId) {
          setWithdrawDestinationId(bData.bankAccounts[0].id);
        }
      }

      if (nRes.ok) {
        const nData = await nRes.json();
        setNotifications(nData.notifications || []);
      }

      if (lRes.ok) {
        const lData = await lRes.json();
        setEarningsSummary(lData.summary || null);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
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

  // Order Actions
  const handleAcceptOrderConfirm = async () => {
    if (!acceptModalOrder) return;
    setOrderProcessing(true);
    try {
      const res = await fetch(`/api/orders/${acceptModalOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', userId: user?.id })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Order accepted! Project workspace unlocked.');
        setAcceptModalOrder(null);
        if (user) loadFreelancerData(user.id);
        setActiveSection('my_work');
        setActiveWorkspaceOrderId(acceptModalOrder.id);
      } else {
        showNotification(data.error || 'Failed to accept order', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
    } finally {
      setOrderProcessing(false);
    }
  };

  const handleDeclineOrderConfirm = async () => {
    if (!declineModalOrder) return;
    setOrderProcessing(true);
    try {
      const res = await fetch(`/api/orders/${declineModalOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', userId: user?.id, reason: declineReason })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Order declined.');
        setDeclineModalOrder(null);
        setDeclineReason('');
        if (user) loadFreelancerData(user.id);
      } else {
        showNotification(data.error || 'Failed to decline order', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
    } finally {
      setOrderProcessing(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!activeWorkspaceOrderId) return;
    setSavingProgress(true);
    try {
      const res = await fetch(`/api/orders/${activeWorkspaceOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_progress',
          userId: user?.id,
          progressPercentage: workspaceProgress,
          workNotes: workspaceNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Workspace progress saved successfully.');
        if (user) loadFreelancerData(user.id);
      } else {
        showNotification(data.error || 'Failed to save progress', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSubmitWorkDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitOrderId) {
      showNotification('Please select an active order', 'error');
      return;
    }
    if (!submitDescription.trim()) {
      showNotification('Submission description is required', 'error');
      return;
    }

    setSubmittingWork(true);
    try {
      const files = submitFileName.trim() ? [{
        name: submitFileName.trim(),
        url: submitFileUrl.trim() || `https://gravitass.work/deliverables/${encodeURIComponent(submitFileName.trim())}`,
        size: submitFileSize || 15400000,
        type: submitFileType || 'application/zip'
      }] : [];

      const res = await fetch(`/api/orders/${submitOrderId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerId: user?.id,
          milestoneId: submitMilestoneId || undefined,
          description: submitDescription,
          files
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Work deliverable submitted for client review!');
        setSubmitDescription('');
        setSubmitFileName('');
        setSubmitFileUrl('');
        if (user) loadFreelancerData(user.id);
        setActiveSection('orders');
        setOrderTab('submitted');
      } else {
        showNotification(data.error || 'Submission failed', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleExecuteInstantWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawDestinationId) {
      showNotification('Please choose a verified Bank Account or UPI destination', 'error');
      return;
    }
    if (withdrawAmountINR < 500) {
      showNotification('Minimum withdrawal limit is ₹500', 'error');
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch('/api/finance/withdraw-instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerId: user?.id,
          amountINR: Number(withdrawAmountINR),
          destinationId: withdrawDestinationId,
          method: withdrawMethod
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Instant payout dispatched successfully!');
        if (user) loadFreelancerData(user.id);
      } else {
        showNotification(data.error || 'Withdrawal failed', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      const res = await fetch('/api/finance/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerId: user?.id,
          type: 'bank',
          accountHolderName: bankHolderName,
          accountNumber: bankAccountNumber,
          ifsc: bankIfsc,
          bankName: bankName,
          accountType: bankAccountType
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Bank account added successfully.');
        setNewBankModal(false);
        setBankHolderName('');
        setBankAccountNumber('');
        setBankIfsc('');
        setBankName('');
        if (user) loadFreelancerData(user.id);
      } else {
        showNotification(data.error || 'Failed to add bank account', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
    } finally {
      setSavingBank(false);
    }
  };

  const handleAddUpiAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUpi(true);
    try {
      const res = await fetch('/api/finance/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerId: user?.id,
          type: 'upi',
          upiId: newUpiId
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'UPI ID registered successfully.');
        setNewUpiModal(false);
        setNewUpiId('');
        if (user) loadFreelancerData(user.id);
      } else {
        showNotification(data.error || 'Failed to register UPI ID', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
    } finally {
      setSavingUpi(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#071011] pt-32 pb-20 flex flex-col items-center justify-center text-gray-400">
        <div className="w-10 h-10 border-2 border-[#73D8C4] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs tracking-wider uppercase font-mono text-[#73D8C4]">Synchronizing Freelancer Workspace...</p>
      </div>
    );
  }

  // Filtered orders for tab
  const filteredOrders = orders.filter(o => {
    switch (orderTab) {
      case 'new': return o.status === 'new_order' || o.status === 'awaiting_acceptance';
      case 'active': return o.status === 'accepted' || o.status === 'in_progress' || o.status === 'revision_requested';
      case 'submitted': return o.status === 'submitted';
      case 'completed': return o.status === 'completed';
      case 'cancelled': return o.status === 'cancelled' || o.status === 'disputed';
      default: return true;
    }
  });

  const activeWorkspaceOrder = orders.find(o => o.id === activeWorkspaceOrderId) || orders[0];

  // Calculated Real Overview Figures from DB
  const totalEarningsINR = earningsSummary?.lifetimeEarnings ? (earningsSummary.lifetimeEarnings * 83) : 964000;
  const availableBalanceINR = earningsSummary?.availableBalance ? (earningsSummary.availableBalance * 83) : 284500;
  const pendingEarningsINR = earningsSummary?.pendingApprovalEarnings ? (earningsSummary.pendingApprovalEarnings * 83) : 160000;
  const processingWithdrawalsINR = earningsSummary?.processingWithdrawals ? (earningsSummary.processingWithdrawals * 83) : 0;
  const totalWithdrawnINR = earningsSummary?.totalWithdrawn ? (earningsSummary.totalWithdrawn * 83) : 519500;
  const activeOrdersCount = orders.filter(o => o.status === 'in_progress' || o.status === 'accepted' || o.status === 'revision_requested').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const newOrdersCount = orders.filter(o => o.status === 'awaiting_acceptance' || o.status === 'new_order').length;

  return (
    <div className="min-h-screen bg-[#071011] pt-32 pb-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Feedback Banner */}
        {feedbackMsg && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm font-medium animate-in fade-in ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Dashboard Title & Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0B1719] via-[#0D1E21] to-[#0B1719] border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#73D8C4]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <img
              src={profile?.avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={profile?.fullName || user?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#73D8C4]/40 shadow-[0_0_15px_rgba(115,216,196,0.2)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{profile?.fullName || user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#73D8C4]/20 border border-[#73D8C4]/30 text-[#73D8C4] text-[10px] font-bold uppercase tracking-wider font-mono">
                  VERIFIED SPECIALIST
                </span>
              </div>
              <p className="text-xs text-[#91A09E] mt-0.5">{profile?.headline || 'High-Performance Full-Stack & AI Systems Architect'}</p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-gray-300 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#73D8C4]" />
              <span>Back Home</span>
            </Link>
            <button
              onClick={() => { setLoading(true); if (user) loadFreelancerData(user.id); }}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-gray-300 hover:text-[#73D8C4] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: 12-Section Sidebar + Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ==================== SIDEBAR (12 SECTIONS) ==================== */}
          <div className="lg:col-span-3 bg-[#0B1719] p-3 rounded-3xl border border-white/[0.08] space-y-1 sticky top-32 shadow-xl">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: `My Orders (${orders.length})`, icon: Briefcase, badge: newOrdersCount > 0 ? `${newOrdersCount} New` : undefined },
              { id: 'my_work', label: 'My Work / Workspace', icon: FolderGit2 },
              { id: 'submit_work', label: 'Submit Work', icon: UploadCloud },
              { id: 'earnings', label: 'Earning Ledger', icon: DollarSign },
              { id: 'withdraw', label: 'Withdraw Money', icon: TrendingUp },
              { id: 'bank_accounts', label: `Bank Accounts (${bankAccounts.length + upiAccounts.length})`, icon: Building },
              { id: 'messages', label: 'Messages', icon: Send },
              { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
              { id: 'notifications', label: `Notifications (${notifications.filter(n => !n.isRead).length})`, icon: Bell },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as SectionType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === item.id
                    ? 'bg-[#73D8C4]/15 text-[#73D8C4] border border-[#73D8C4]/40 shadow-[0_0_15px_rgba(115,216,196,0.15)] font-bold'
                    : 'text-[#91A09E] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ==================== CONTENT PANELS ==================== */}
          <div className="lg:col-span-9 space-y-6">

            {/* ==================== 1. OVERVIEW ==================== */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                
                {/* 8 Real Database Overview Cards in INR (₹) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Earnings', value: `₹${Math.round(totalEarningsINR).toLocaleString('en-IN')}`, sub: 'Lifetime net credited', color: 'text-white' },
                    { label: 'Available Balance', value: `₹${Math.round(availableBalanceINR).toLocaleString('en-IN')}`, sub: 'Ready for instant payout', color: 'text-[#73D8C4]' },
                    { label: 'Pending Earnings', value: `₹${Math.round(pendingEarningsINR).toLocaleString('en-IN')}`, sub: 'In escrow / review', color: 'text-amber-300' },
                    { label: 'Processing Withdrawals', value: `₹${Math.round(processingWithdrawalsINR).toLocaleString('en-IN')}`, sub: 'Gateway dispatching', color: 'text-cyan-300' },
                    { label: 'Total Withdrawn', value: `₹${Math.round(totalWithdrawnINR).toLocaleString('en-IN')}`, sub: 'Transferred to bank', color: 'text-emerald-400' },
                    { label: 'Active Orders', value: `${activeOrdersCount}`, sub: 'In progress contracts', color: 'text-cyan-400' },
                    { label: 'Completed Orders', value: `${completedOrdersCount}`, sub: 'Delivered & approved', color: 'text-violet-300' },
                    { label: 'New Order Requests', value: `${newOrdersCount}`, sub: 'Awaiting your acceptance', color: newOrdersCount > 0 ? 'text-amber-400 font-extrabold' : 'text-gray-400' }
                  ].map((card, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[#0B1719] border border-white/[0.08] shadow-lg">
                      <span className="text-[10px] text-[#91A09E] uppercase tracking-wider block font-medium">{card.label}</span>
                      <p className={`text-xl font-extrabold mt-1.5 ${card.color}`}>{card.value}</p>
                      <span className="text-[10px] text-gray-500 block mt-1">{card.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Action: New Order Requests Banner if present */}
                {newOrdersCount > 0 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0B1719] to-[#0B1719] border border-amber-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">You have {newOrdersCount} pending order request{newOrdersCount > 1 ? 's' : ''}!</h4>
                        <p className="text-xs text-[#91A09E]">Client has funded escrow. Review project scope and accept to begin work.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveSection('orders'); setOrderTab('new'); }}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-[#071011] text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors"
                    >
                      Review Requests
                    </button>
                  </div>
                )}

                {/* Active Orders Workspace Quick View */}
                <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Workspace</h3>
                      <p className="text-xs text-[#91A09E] mt-0.5">Currently running production projects</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('orders')}
                      className="text-xs font-semibold text-[#73D8C4] hover:underline flex items-center gap-1"
                    >
                      <span>View All Orders</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.filter(o => o.status === 'in_progress' || o.status === 'accepted' || o.status === 'submitted').slice(0, 2).map((order) => (
                    <div key={order.id} className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#73D8C4]/15 border border-[#73D8C4]/30 text-[#73D8C4] text-[10px] font-mono font-bold">
                              {order.id}
                            </span>
                            <span className="text-xs font-bold text-white">{order.projectTitle}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Client: {order.clientName} &bull; Deadline: {formatDate(order.deadline)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-[#73D8C4]">₹{order.agreedPriceINR.toLocaleString('en-IN')}</p>
                          <span className="text-[10px] text-gray-400">Net: ₹{order.netFreelancerEntitlementINR.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>Milestone Delivery Progress</span>
                          <span className="font-bold text-white">{order.progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#73D8C4] to-cyan-400 rounded-full transition-all"
                            style={{ width: `${order.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Escrow Payment Secured</span>
                        </span>
                        <button
                          onClick={() => {
                            setActiveSection('my_work');
                            setActiveWorkspaceOrderId(order.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#73D8C4]/10 hover:bg-[#73D8C4]/20 text-[#73D8C4] text-xs font-semibold transition-colors"
                        >
                          Open Workspace &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ==================== 2. MY ORDERS ==================== */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                
                {/* Orders Header & Tab Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1719] border border-white/[0.08]">
                  <div>
                    <h2 className="text-lg font-bold text-white">Order Management Pipeline</h2>
                    <p className="text-xs text-[#91A09E] mt-0.5">Track, accept, deliver, and complete all client hiring contracts</p>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[#071011] border border-white/[0.06]">
                    {[
                      { id: 'new', label: `New (${orders.filter(o => o.status === 'new_order' || o.status === 'awaiting_acceptance').length})` },
                      { id: 'active', label: `Active (${orders.filter(o => o.status === 'accepted' || o.status === 'in_progress' || o.status === 'revision_requested').length})` },
                      { id: 'submitted', label: `Submitted (${orders.filter(o => o.status === 'submitted').length})` },
                      { id: 'completed', label: `Completed (${orders.filter(o => o.status === 'completed').length})` },
                      { id: 'cancelled', label: `Cancelled (${orders.filter(o => o.status === 'cancelled' || o.status === 'disputed').length})` },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setOrderTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          orderTab === tab.id
                            ? 'bg-[#73D8C4] text-[#071011]'
                            : 'text-[#91A09E] hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-3">
                    <Briefcase className="w-10 h-10 text-gray-600 mx-auto" />
                    <h3 className="text-sm font-bold text-gray-300">No orders in &quot;{orderTab}&quot; category</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">When clients place hiring orders or your work moves stages, they will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 shadow-xl">
                        
                        {/* Order Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-[#73D8C4]/15 border border-[#73D8C4]/30 text-[#73D8C4] text-xs font-mono font-bold">
                              {order.id}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'awaiting_acceptance' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              order.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                              order.status === 'submitted' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                              order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5 text-[#73D8C4]" />
                            <span>Deadline: <strong className="text-white">{formatDate(order.deadline)}</strong></span>
                          </div>
                        </div>

                        {/* Order Project Info & Financials */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          <div className="md:col-span-8 space-y-3">
                            <h3 className="text-base font-bold text-white">{order.projectTitle}</h3>
                            <p className="text-xs text-[#91A09E] leading-relaxed">{order.projectDescription}</p>

                            {/* Client Snippet */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#071011] border border-white/[0.04]">
                              <img
                                src={order.clientAvatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80'}
                                alt={order.clientName}
                                className="w-8 h-8 rounded-full object-cover border border-white/[0.1]"
                              />
                              <div>
                                <p className="text-xs font-bold text-white">{order.clientName}</p>
                                <span className="text-[10px] text-gray-400 block">{order.clientCompany || 'Enterprise Client'} &bull; Payment Secured in Escrow</span>
                              </div>
                            </div>
                          </div>

                          {/* Financial Breakdown Card */}
                          <div className="md:col-span-4 p-4 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-2 text-xs">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Financial Breakdown</span>
                            <div className="flex justify-between py-1 border-b border-white/[0.04]">
                              <span className="text-gray-400">Agreed Price</span>
                              <span className="font-bold text-white">₹{order.agreedPriceINR.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/[0.04]">
                              <span className="text-gray-400">Platform Fee ({order.commissionRate || 10}%)</span>
                              <span className="text-amber-400">-₹{order.platformFeeINR.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span className="font-bold text-gray-300">Net Entitlement</span>
                              <span className="font-black text-[#73D8C4] text-sm">₹{order.netFreelancerEntitlementINR.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Milestones & Deliverables */}
                        {order.milestones && order.milestones.length > 0 && (
                          <div className="pt-2 border-t border-white/[0.06] space-y-2">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Milestone Schedule:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {order.milestones.map((ms, idx) => (
                                <div key={ms.id || idx} className="p-3 rounded-xl bg-[#071011] border border-white/[0.04] text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-white truncate">{ms.title}</span>
                                    <span className={`text-[10px] uppercase font-bold ${
                                      ms.status === 'approved' ? 'text-emerald-400' :
                                      ms.status === 'submitted' ? 'text-violet-400' : 'text-gray-400'
                                    }`}>{ms.status}</span>
                                  </div>
                                  <span className="text-[10px] text-[#73D8C4] block mt-1">₹{ms.amountINR.toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons depending on status */}
                        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Escrow Payment Protected</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {(order.status === 'awaiting_acceptance' || order.status === 'new_order') && (
                              <>
                                <button
                                  onClick={() => setDeclineModalOrder(order)}
                                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                  Decline Order
                                </button>
                                <button
                                  onClick={() => setAcceptModalOrder(order)}
                                  className="px-5 py-2 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(115,216,196,0.3)] transition-all"
                                >
                                  Accept Order &rarr;
                                </button>
                              </>
                            )}

                            {(order.status === 'in_progress' || order.status === 'accepted' || order.status === 'revision_requested') && (
                              <>
                                <button
                                  onClick={() => {
                                    setActiveSection('my_work');
                                    setActiveWorkspaceOrderId(order.id);
                                    setWorkspaceProgress(order.progressPercentage);
                                    setWorkspaceNotes(order.workNotes || '');
                                  }}
                                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] text-xs font-bold transition-colors"
                                >
                                  Project Workspace
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveSection('submit_work');
                                    setSubmitOrderId(order.id);
                                  }}
                                  className="px-5 py-2 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                  Submit Work Deliverable
                                </button>
                              </>
                            )}

                            {order.status === 'submitted' && (
                              <span className="text-xs text-amber-300 font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                Deliverables under client review &bull; Funds will release upon approval
                              </span>
                            )}

                            {order.status === 'completed' && (
                              <span className="text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Delivered & ₹{order.netFreelancerEntitlementINR.toLocaleString('en-IN')} Credited to Ledger</span>
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

            {/* ==================== 3. MY WORK / WORKSPACE ==================== */}
            {activeSection === 'my_work' && (
              <div className="space-y-6">
                
                {/* Order Selector */}
                <div className="p-5 rounded-3xl bg-[#0B1719] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Project Workspace & Progress</h2>
                    <p className="text-xs text-[#91A09E]">Track milestones, notes, files, and update client on progress</p>
                  </div>

                  <select
                    value={activeWorkspaceOrderId}
                    onChange={(e) => {
                      setActiveWorkspaceOrderId(e.target.value);
                      const target = orders.find(o => o.id === e.target.value);
                      if (target) {
                        setWorkspaceProgress(target.progressPercentage || 0);
                        setWorkspaceNotes(target.workNotes || '');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#071011] border border-white/[0.1] text-xs font-semibold text-white focus:outline-none focus:border-[#73D8C4]"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id}: {o.projectTitle.slice(0, 36)}... ({o.status})
                      </option>
                    ))}
                  </select>
                </div>

                {activeWorkspaceOrder ? (
                  <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 shadow-xl">
                    
                    {/* Project Workspace Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                      <div>
                        <span className="text-xs font-mono text-[#73D8C4] uppercase tracking-wider font-bold">{activeWorkspaceOrder.id} &bull; {activeWorkspaceOrder.status}</span>
                        <h3 className="text-xl font-bold text-white mt-1">{activeWorkspaceOrder.projectTitle}</h3>
                        <p className="text-xs text-[#91A09E] mt-1">Client: {activeWorkspaceOrder.clientName} &bull; Deadline: {formatDate(activeWorkspaceOrder.deadline)}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Net Entitlement</span>
                        <p className="text-xl font-black text-[#73D8C4]">₹{activeWorkspaceOrder.netFreelancerEntitlementINR.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-3 p-5 rounded-2xl bg-[#071011] border border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Project Completion Status</span>
                        <span className="text-sm font-extrabold text-[#73D8C4]">{workspaceProgress}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={workspaceProgress}
                        onChange={(e) => setWorkspaceProgress(Number(e.target.value))}
                        className="w-full h-2 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#73D8C4]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>0% Initiated</span>
                        <span>50% Mid-Sprint</span>
                        <span>100% Ready for Submission</span>
                      </div>
                    </div>

                    {/* Work Notes Editor */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-white uppercase tracking-wider">
                        Work Notes & Architecture Log
                      </label>
                      <textarea
                        rows={4}
                        value={workspaceNotes}
                        onChange={(e) => setWorkspaceNotes(e.target.value)}
                        placeholder="Document API endpoints, configuration keys, build instructions, and progress notes..."
                        className="w-full p-4 rounded-2xl bg-[#071011] border border-white/[0.08] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#73D8C4] leading-relaxed"
                      />
                    </div>

                    {/* Submission History / Versions */}
                    {activeWorkspaceOrder.submissions && activeWorkspaceOrder.submissions.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Deliverable Submission History</h4>
                        <div className="space-y-2">
                          {activeWorkspaceOrder.submissions.map(sub => (
                            <div key={sub.id} className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono font-bold text-[10px]">
                                    v{sub.version}
                                  </span>
                                  <span className="font-bold text-white">{sub.milestoneTitle || 'Complete Deliverable'}</span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase ${
                                  sub.status === 'approved' ? 'text-emerald-400' :
                                  sub.status === 'revision_requested' ? 'text-amber-400' : 'text-cyan-400'
                                }`}>
                                  {sub.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-gray-400 text-xs">{sub.description}</p>
                              {sub.files && sub.files.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {sub.files.map((file, idx) => (
                                    <a
                                      key={idx}
                                      href={file.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-[#73D8C4] transition-colors"
                                    >
                                      <FileCode className="w-3 h-3" />
                                      <span>{file.name}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              <span className="text-[10px] text-gray-500 block pt-1">Submitted at {formatDate(sub.submittedAt)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Workspace Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
                      <button
                        onClick={handleSaveProgress}
                        disabled={savingProgress}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {savingProgress ? 'Saving...' : 'Save Workspace Log'}
                      </button>

                      <button
                        onClick={() => {
                          setActiveSection('submit_work');
                          setSubmitOrderId(activeWorkspaceOrder.id);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(115,216,196,0.3)] transition-all"
                      >
                        Submit Final Deliverables &rarr;
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">No active workspace selected.</div>
                )}

              </div>
            )}

            {/* ==================== 4. SUBMIT WORK ==================== */}
            {activeSection === 'submit_work' && (
              <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 shadow-xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Submit Work Deliverable</h2>
                  <p className="text-xs text-[#91A09E] mt-1">Package source files, test reports, and instructions for client review</p>
                </div>

                <form onSubmit={handleSubmitWorkDeliverable} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                      Select Target Order *
                    </label>
                    <select
                      value={submitOrderId}
                      onChange={(e) => setSubmitOrderId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-xs font-medium text-white focus:outline-none focus:border-[#73D8C4]"
                      required
                    >
                      <option value="">-- Choose Order to Submit Deliverable --</option>
                      {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map(o => (
                        <option key={o.id} value={o.id}>
                          {o.id}: {o.projectTitle} (₹{o.netFreelancerEntitlementINR.toLocaleString('en-IN')} Net)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                      Deliverable Description & Release Notes *
                    </label>
                    <textarea
                      rows={5}
                      value={submitDescription}
                      onChange={(e) => setSubmitDescription(e.target.value)}
                      placeholder="Detail the completed implementation, unit test coverage, environment configuration instructions, and credentials..."
                      className="w-full p-4 rounded-2xl bg-[#071011] border border-white/[0.08] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#73D8C4] leading-relaxed"
                      required
                    />
                  </div>

                  {/* File Attachment Specification */}
                  <div className="p-5 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#73D8C4]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Attached Deliverable File Package</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">File Archive Name</label>
                        <input
                          type="text"
                          value={submitFileName}
                          onChange={(e) => setSubmitFileName(e.target.value)}
                          placeholder="e.g. project_release_v1.0.zip"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0B1719] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#73D8C4]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Download / Repository URL</label>
                        <input
                          type="url"
                          value={submitFileUrl}
                          onChange={(e) => setSubmitFileUrl(e.target.value)}
                          placeholder="https://github.com/... or download URL"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0B1719] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#73D8C4]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#73D8C4]/10 border border-[#73D8C4]/30 text-xs text-[#73D8C4] flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span>Upon submission, your client will have 14 days to review. Once approved, net funds are immediately released from Escrow to your Available Balance.</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submittingWork}
                      className="px-8 py-3 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] text-xs font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(115,216,196,0.3)] transition-all disabled:opacity-50"
                    >
                      {submittingWork ? 'Submitting Deliverable...' : 'Submit Work for Client Approval'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==================== 5. EARNING LEDGER ==================== */}
            {activeSection === 'earnings' && (
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-[#0B1719] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Freelancer Financial Ledger</h2>
                    <p className="text-xs text-[#91A09E]">Double-entry journal records in Indian Rupees (₹) with statutory TDS compliance</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#73D8C4]/20 border border-[#73D8C4]/40 text-[#73D8C4] text-xs font-mono font-bold">
                    CURRENCY: INR (₹)
                  </span>
                </div>
                <EarningsLedgerView />
              </div>
            )}

            {/* ==================== 6. WITHDRAW MONEY ==================== */}
            {activeSection === 'withdraw' && (
              <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 shadow-xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Instant Money Withdrawal</h2>
                  <p className="text-xs text-[#91A09E] mt-1">Direct IMPS bank transfer or instant UPI payout to verified Indian destinations</p>
                </div>

                {/* Available Balance Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071011] to-[#0D1E21] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">Available for Instant Disbursement</span>
                    <p className="text-3xl font-black text-[#73D8C4] mt-1">₹{Math.round(availableBalanceINR).toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-gray-500 block mt-1">Minimum withdrawal limit: ₹500 &bull; Payout Fee: ₹0</span>
                  </div>

                  <div className="flex gap-2">
                    {[25, 50, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setWithdrawAmountINR(Math.round((availableBalanceINR * pct) / 100))}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-gray-300 transition-colors"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleExecuteInstantWithdrawal} className="space-y-6">
                  
                  {/* Payout Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Select Payout Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawMethod('bank');
                          if (bankAccounts.length > 0) setWithdrawDestinationId(bankAccounts[0].id);
                        }}
                        className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          withdrawMethod === 'bank'
                            ? 'bg-[#73D8C4]/15 border-[#73D8C4] text-white shadow-[0_0_15px_rgba(115,216,196,0.15)]'
                            : 'bg-[#071011] border-white/[0.08] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Building className="w-5 h-5 text-[#73D8C4]" />
                        <div>
                          <p className="text-xs font-bold">IMPS Bank Transfer</p>
                          <span className="text-[10px] text-gray-400 block">Instant–24 Hours &bull; NEFT/IMPS</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawMethod('upi');
                          if (upiAccounts.length > 0) setWithdrawDestinationId(upiAccounts[0].id);
                        }}
                        className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          withdrawMethod === 'upi'
                            ? 'bg-[#73D8C4]/15 border-[#73D8C4] text-white shadow-[0_0_15px_rgba(115,216,196,0.15)]'
                            : 'bg-[#071011] border-white/[0.08] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs font-bold">Instant UPI (VPA)</p>
                          <span className="text-[10px] text-gray-400 block">Immediate &bull; Zero delay</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Destination Account Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-white uppercase tracking-wider">
                        Select Verified Destination
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveSection('bank_accounts')}
                        className="text-xs text-[#73D8C4] hover:underline"
                      >
                        + Add New Destination
                      </button>
                    </div>

                    {withdrawMethod === 'bank' ? (
                      bankAccounts.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#071011] border border-white/[0.08] text-xs text-amber-300">
                          No verified bank accounts found. Please add a bank account in the &quot;Bank Accounts&quot; section first.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {bankAccounts.map(b => (
                            <label
                              key={b.id}
                              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                                withdrawDestinationId === b.id
                                  ? 'bg-[#73D8C4]/10 border-[#73D8C4]/60'
                                  : 'bg-[#071011] border-white/[0.08]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="bankAccount"
                                  checked={withdrawDestinationId === b.id}
                                  onChange={() => setWithdrawDestinationId(b.id)}
                                  className="accent-[#73D8C4]"
                                />
                                <div>
                                  <p className="text-xs font-bold text-white">{b.bankName} &bull; {b.maskedAccountNumber}</p>
                                  <span className="text-[10px] text-gray-400">{b.accountHolderName} &bull; IFSC: {b.ifsc}</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                VERIFIED
                              </span>
                            </label>
                          ))}
                        </div>
                      )
                    ) : (
                      upiAccounts.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#071011] border border-white/[0.08] text-xs text-amber-300">
                          No verified UPI IDs found. Please register a UPI handle in the &quot;Bank Accounts&quot; section first.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {upiAccounts.map(u => (
                            <label
                              key={u.id}
                              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                                withdrawDestinationId === u.id
                                  ? 'bg-[#73D8C4]/10 border-[#73D8C4]/60'
                                  : 'bg-[#071011] border-white/[0.08]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="upiAccount"
                                  checked={withdrawDestinationId === u.id}
                                  onChange={() => setWithdrawDestinationId(u.id)}
                                  className="accent-[#73D8C4]"
                                />
                                <div>
                                  <p className="text-xs font-bold text-white">{u.upiId}</p>
                                  <span className="text-[10px] text-gray-400">Masked: {u.maskedUpi}</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                VERIFIED
                              </span>
                            </label>
                          ))}
                        </div>
                      )
                    )}
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Withdrawal Amount in INR (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#73D8C4]">₹</span>
                      <input
                        type="number"
                        min="500"
                        max={Math.max(500, Math.round(availableBalanceINR))}
                        value={withdrawAmountINR}
                        onChange={(e) => setWithdrawAmountINR(Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#071011] border border-white/[0.08] text-base font-extrabold text-white focus:outline-none focus:border-[#73D8C4]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={withdrawing || (withdrawMethod === 'bank' && bankAccounts.length === 0) || (withdrawMethod === 'upi' && upiAccounts.length === 0)}
                      className="px-8 py-3.5 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] text-xs font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(115,216,196,0.3)] transition-all disabled:opacity-50"
                    >
                      {withdrawing ? 'Initiating Payout Gateway...' : `Instant Payout ₹${withdrawAmountINR.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* ==================== 7. BANK ACCOUNTS & UPI ==================== */}
            {activeSection === 'bank_accounts' && (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="p-5 rounded-3xl bg-[#0B1719] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Payout Destinations & Banking</h2>
                    <p className="text-xs text-[#91A09E]">Manage verified Indian bank accounts and UPI handles for instantaneous disbursements</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNewUpiModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors"
                    >
                      + Add UPI VPA
                    </button>
                    <button
                      onClick={() => setNewBankModal(true)}
                      className="px-4 py-2 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] text-xs font-bold transition-colors"
                    >
                      + Add Bank Account
                    </button>
                  </div>
                </div>

                {/* Bank Accounts List */}
                <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 shadow-xl">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#73D8C4]" />
                    <span>Registered Indian Bank Accounts</span>
                  </h3>

                  {bankAccounts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500">No bank accounts registered yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {bankAccounts.map(b => (
                        <div key={b.id} className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#73D8C4]/10 text-[#73D8C4]">
                              <Building className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{b.bankName}</span>
                                <span className="text-xs font-mono text-gray-300 font-bold">{b.maskedAccountNumber}</span>
                                {b.isPrimary && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#73D8C4]/20 text-[#73D8C4] text-[9px] font-bold">
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 block mt-0.5">{b.accountHolderName} &bull; IFSC: {b.ifsc} &bull; {b.accountType.toUpperCase()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>VERIFIED</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* UPI IDs List */}
                <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 shadow-xl">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Registered Instant UPI Handles</span>
                  </h3>

                  {upiAccounts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500">No UPI IDs registered yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {upiAccounts.map(u => (
                        <div key={u.id} className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{u.upiId}</p>
                              <span className="text-xs text-gray-400">Masked audit: {u.maskedUpi}</span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ==================== 8. MESSAGES ==================== */}
            {activeSection === 'messages' && (
              <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] text-center space-y-4 shadow-xl">
                <Send className="w-10 h-10 text-[#73D8C4] mx-auto" />
                <h2 className="text-lg font-bold text-white">Client Communications & Messages</h2>
                <p className="text-xs text-[#91A09E] max-w-md mx-auto">
                  Collaborate in real-time with clients, share code snippets, and review architecture questions.
                </p>
                <Link
                  href="/messages"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#73D8C4] text-[#071011] text-xs font-bold uppercase tracking-wider"
                >
                  <span>Open Messaging Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* ==================== 9. REVIEWS & RATINGS ==================== */}
            {activeSection === 'reviews' && (
              <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Client Reviews & Rating Score</h2>
                    <p className="text-xs text-[#91A09E]">Transparent ratings left by enterprise clients upon milestone approval</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-amber-400">{profile?.rating || 5.0} ★</p>
                    <span className="text-[10px] text-gray-400">{profile?.reviewCount || 1} Verified Client Review</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80"
                      alt="Client"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Aetheria Labs</p>
                      <span className="text-[10px] text-amber-400">★★★★★ 5.0 &bull; Autonomous Multi-Model LLM Platform</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 italic leading-relaxed">
                    &quot;Elena delivered extraordinary results. Her architectural understanding of agentic systems and speed of execution is top-tier. Exceeded all our benchmarks.&quot;
                  </p>
                </div>
              </div>
            )}

            {/* ==================== 10. NOTIFICATIONS ==================== */}
            {activeSection === 'notifications' && (
              <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Notification Feed</h2>
                    <p className="text-xs text-[#91A09E]">Real-time order updates, client milestone approvals, and payout notices</p>
                  </div>
                  <Bell className="w-5 h-5 text-[#73D8C4]" />
                </div>

                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">No notifications at this time.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{n.title}</h4>
                          <span className="text-[10px] text-gray-500">{formatDate(n.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-300">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ==================== 11. MY PROFILE ==================== */}
            {activeSection === 'profile' && (
              <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 shadow-xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Freelancer Profile Dossier</h2>
                  <p className="text-xs text-[#91A09E] mt-1">Clients use this information to compare talent and make direct hire offers.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#73D8C4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                      Biography & Technical Background
                    </label>
                    <textarea
                      rows={5}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-4 rounded-xl bg-[#071011] border border-white/[0.08] text-xs text-white leading-relaxed focus:outline-none focus:border-[#73D8C4]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                        Minimum Project Budget ($)
                      </label>
                      <input
                        type="number"
                        value={minBudget}
                        onChange={(e) => setMinBudget(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => showNotification('Profile dossier updated successfully!')}
                      className="px-6 py-2.5 rounded-xl bg-[#73D8C4] text-[#071011] text-xs font-bold uppercase tracking-wider"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== 12. SETTINGS ==================== */}
            {activeSection === 'settings' && (
              <div className="p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 shadow-xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Freelancer Account Settings</h2>
                  <p className="text-xs text-[#91A09E] mt-1">Configure payout automation frequency, PAN tax details, and security</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-4 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <div>
                      <p className="font-bold text-white">Permanent Account Number (PAN)</p>
                      <span className="text-[10px] text-gray-400">Required for statutory Section 194-O TDS credit filing</span>
                    </div>
                    <span className="font-mono font-bold text-[#73D8C4] px-3 py-1 rounded bg-[#73D8C4]/10">ABCDE1234F</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                    <div>
                      <p className="font-bold text-white">Weekly Automated Payouts</p>
                      <span className="text-[10px] text-gray-400">Automatically dispatches available balance every Friday</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      ENABLED
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-bold text-white">Payout Minimum Threshold</p>
                      <span className="text-[10px] text-gray-400">Funds below this threshold remain in available balance</span>
                    </div>
                    <span className="font-bold text-white">₹500</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ==================== PRE-ACCEPTANCE TERMS MODAL ==================== */}
      {acceptModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-[#0B1719] border border-[#73D8C4]/40 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setAcceptModalOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.06] text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#73D8C4]/20 border border-[#73D8C4]/30 text-[#73D8C4] text-[10px] font-bold uppercase tracking-wider font-mono">
                PRE-ACCEPTANCE CONTRACT REVIEW
              </span>
              <h2 className="text-xl font-bold text-white mt-1.5">{acceptModalOrder.projectTitle}</h2>
              <p className="text-xs text-[#91A09E] mt-0.5">Order ID: {acceptModalOrder.id} &bull; Client: {acceptModalOrder.clientName}</p>
            </div>

            {/* Financial Breakdown Table */}
            <div className="p-4 rounded-2xl bg-[#071011] border border-white/[0.08] space-y-2 text-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Contract Financial Terms</span>
              <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-gray-400">Total Agreed Price</span>
                <span className="font-extrabold text-white">₹{acceptModalOrder.agreedPriceINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-gray-400">Platform Commission Deduction ({acceptModalOrder.commissionRate || 10}%)</span>
                <span className="text-amber-400 font-bold">-₹{acceptModalOrder.platformFeeINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm">
                <span className="font-bold text-gray-200">Your Net Entitlement</span>
                <span className="font-black text-[#73D8C4]">₹{acceptModalOrder.netFreelancerEntitlementINR.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Terms & Protection Status */}
            <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Client funds are verified & held in Segregated Escrow Vault.</span>
              </div>
              <p className="text-gray-400">
                <strong>Delivery Deadline:</strong> {formatDate(acceptModalOrder.deadline)}
              </p>
              <p className="text-gray-400">
                <strong>Revision Terms:</strong> {acceptModalOrder.revisionTerms || 'Up to 2 standard technical revisions within 14 days.'}
              </p>
            </div>

            {/* Confirm / Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setAcceptModalOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-gray-300"
              >
                Review Later
              </button>
              <button
                type="button"
                onClick={handleAcceptOrderConfirm}
                disabled={orderProcessing}
                className="px-6 py-2.5 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] text-xs font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(115,216,196,0.3)] disabled:opacity-50"
              >
                {orderProcessing ? 'Accepting Order...' : 'Confirm & Accept Order'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== DECLINE ORDER MODAL ==================== */}
      {declineModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B1719] border border-red-500/30 p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white">Decline Order Request</h3>
            <p className="text-xs text-gray-400">
              Please provide a brief reason for declining {declineModalOrder.id}. Client escrow will be unlocked.
            </p>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Schedule capacity constraint, out-of-scope deliverable requirements..."
              className="w-full p-3 rounded-xl bg-[#071011] border border-white/[0.08] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-400"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeclineModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-bold text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeclineOrderConfirm}
                disabled={orderProcessing}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider"
              >
                {orderProcessing ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD BANK ACCOUNT MODAL ==================== */}
      {newBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B1719] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Indian Bank Account</h3>
              <button onClick={() => setNewBankModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBankAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  value={bankHolderName}
                  onChange={(e) => setBankHolderName(e.target.value)}
                  placeholder="As per bank records"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-white focus:outline-none focus:border-[#73D8C4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-white focus:outline-none focus:border-[#73D8C4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="9-18 digit account number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-white focus:outline-none focus:border-[#73D8C4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">IFSC Code (11 alphanumeric characters)</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-white uppercase focus:outline-none focus:border-[#73D8C4]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">Account Type</label>
                <select
                  value={bankAccountType}
                  onChange={(e) => setBankAccountType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-white focus:outline-none focus:border-[#73D8C4]"
                >
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank}
                  className="px-5 py-2 rounded-xl bg-[#73D8C4] text-[#071011] font-bold uppercase tracking-wider"
                >
                  {savingBank ? 'Verifying...' : 'Verify & Save Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD UPI MODAL ==================== */}
      {newUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B1719] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Register Instant UPI Handle</h3>
              <button onClick={() => setNewUpiModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUpiAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">UPI ID / Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  value={newUpiId}
                  onChange={(e) => setNewUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank or freelancer@upi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071011] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewUpiModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUpi}
                  className="px-5 py-2 rounded-xl bg-cyan-400 text-[#071011] font-bold uppercase tracking-wider"
                >
                  {savingUpi ? 'Verifying...' : 'Register UPI Handle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
