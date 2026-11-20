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
  Lock,
  FileText,
  Scale,
  RefreshCw,
  ExternalLink,
  Play,
  Plus,
  Edit2,
  Tag,
  Zap,
  Search,
  Percent,
  Calculator,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Ban,
  Award,
  HelpCircle,
  Activity,
  ChevronRight,
  X,
  CreditCard,
  Building,
  Check
} from 'lucide-react';
import {
  User,
  Project,
  Contract,
  Dispute,
  WithdrawalRequest,
  PlatformSettings,
  EscrowAccount,
  InvoiceRecord,
  FinancialJournalEntry,
  DisputeRecord,
  DisputeResolutionAction,
  Category,
  CommissionRule
} from '@/types';
import { formatDate, formatINR } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Root Navigation Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'commission' | 'users' | 'payouts' | 'escrows' | 'disputes' | 'taxes' | 'invoices' | 'categories' | 'projects'>('analytics');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // 1. Super Admin Overview Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [disputesList, setDisputesList] = useState<Dispute[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [escrowsList, setEscrowsList] = useState<EscrowAccount[]>([]);
  const [invoicesList, setInvoicesList] = useState<InvoiceRecord[]>([]);
  const [disputeRecords, setDisputeRecords] = useState<DisputeRecord[]>([]);
  const [taxData, setTaxData] = useState<any>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  // 2. User Management State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userTab, setUserTab] = useState<'all' | 'freelancers' | 'clients' | 'verified' | 'pending' | 'suspended'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userCounts, setUserCounts] = useState<{ all: number; freelancers: number; clients: number; verified: number; pending: number; suspended: number }>({
    all: 0, freelancers: 0, clients: 0, verified: 0, pending: 0, suspended: 0
  });
  const [selectedAuditUser, setSelectedAuditUser] = useState<any | null>(null);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  // User Action Modals
  const [suspensionModal, setSuspensionModal] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: '', userName: '' });
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('');
  const [rejectionModal, setRejectionModal] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: '', userName: '' });
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // 3. Commission Management State (MOST IMPORTANT)
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [activeCommissionRule, setActiveCommissionRule] = useState<CommissionRule | null>(null);
  const [commissionSummary, setCommissionSummary] = useState<any>(null);
  const [savingCommission, setSavingCommission] = useState(false);

  // Commission Rule Form Inputs
  const [ruleVersionInput, setRuleVersionInput] = useState('v2026.2');
  const [defaultCommInput, setDefaultCommInput] = useState<number>(10);
  const [categoryRatesInput, setCategoryRatesInput] = useState<Record<string, number>>({});
  const [freelancerRatesInput, setFreelancerRatesInput] = useState<Record<string, number>>({});
  const [minFeeInput, setMinFeeInput] = useState<number>(50);
  const [maxFeeInput, setMaxFeeInput] = useState<number>(25000);
  const [effectiveDateInput, setEffectiveDateInput] = useState<string>('2026-01-01');
  const [ruleDescInput, setRuleDescInput] = useState('Master Tiered Platform Commission Rule');

  // Promotional Commission Inputs
  const [promoPercentageInput, setPromoPercentageInput] = useState<number>(5);
  const [promoCodeInput, setPromoCodeInput] = useState('GRAVITASS2026');
  const [promoStartDateInput, setPromoStartDateInput] = useState('2026-01-01');
  const [promoEndDateInput, setPromoEndDateInput] = useState('2026-12-31');
  const [promoEnabled, setPromoEnabled] = useState(true);

  // Freelancer Override Add Inputs
  const [overrideFreelancerId, setOverrideFreelancerId] = useState('');
  const [overrideFreelancerRate, setOverrideFreelancerRate] = useState<number>(6);

  // Commission Live Simulator / Calculator Sandbox
  const [simGrossAmount, setSimGrossAmount] = useState<number>(10000);
  const [simCategory, setSimCategory] = useState<string>('programming-tech');
  const [simPromoCode, setSimPromoCode] = useState<string>('');
  const [simFreelancerId, setSimFreelancerId] = useState<string>('');
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Policy Form State
  const [minWithdrawalInput, setMinWithdrawalInput] = useState<number>(20);
  const [gstInput, setGstInput] = useState<number>(18);
  const [tdsInput, setTdsInput] = useState<number>(1);
  const [legalNameInput, setLegalNameInput] = useState('GRAVITASS TECHNOLOGIES PRIVATE LIMITED');
  const [gstinInput, setGstinInput] = useState('07AAACG9928K1Z5');
  const [savingSettings, setSavingSettings] = useState(false);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);
  const [runningSchedule, setRunningSchedule] = useState(false);

  // Categories Taxonomy State
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [addCatModalOpen, setAddCatModalOpen] = useState(false);
  const [editCatModalOpen, setEditCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catNameInput, setCatNameInput] = useState('');
  const [catSlugInput, setCatSlugInput] = useState('');
  const [catDescInput, setCatDescInput] = useState('');
  const [catIconInput, setCatIconInput] = useState('Sparkles');
  const [catSubcategoriesInput, setCatSubcategoriesInput] = useState('');
  const [catFeaturedInput, setCatFeaturedInput] = useState(false);
  const [catTrendingInput, setCatTrendingInput] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  // Admin Commission Finance & Corporate Withdrawal State
  const [adminFinanceSummary, setAdminFinanceSummary] = useState<any>(null);
  const [adminCommissionLedger, setAdminCommissionLedger] = useState<any[]>([]);
  const [adminBankAccounts, setAdminBankAccounts] = useState<any[]>([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>([]);
  const [adminWithdrawAmount, setAdminWithdrawAmount] = useState<number>(25000);
  const [adminWithdrawBankId, setAdminWithdrawBankId] = useState<string>('');
  const [withdrawingAdminComm, setWithdrawingAdminComm] = useState<boolean>(false);

  // Load Main Dashboard Data
  const loadAdminData = async () => {
    try {
      const [anRes, wthRes, setRes, escRes, invRes, taxRes, dspRes, catRes, commRes, userRes, admFinRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/withdrawals'),
        fetch('/api/admin/settings'),
        fetch('/api/finance/escrow'),
        fetch('/api/finance/invoices'),
        fetch('/api/finance/tax'),
        fetch('/api/finance/disputes'),
        fetch('/api/categories?includeInactive=true'),
        fetch('/api/admin/commission'),
        fetch(`/api/admin/users?tab=${userTab}&search=${encodeURIComponent(userSearch)}`),
        fetch('/api/admin/commission/withdraw')
      ]);

      if (anRes.status === 403 || anRes.status === 401) {
        setLoading(false);
        return;
      }

      if (anRes.ok) {
        const data = await anRes.json();
        setAnalytics(data.analytics);
        setProjectsList(data.projects || []);
        setDisputesList(data.disputes || []);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoriesList(catData.categories || []);
      }

      if (wthRes.ok) {
        const wthData = await wthRes.json();
        setWithdrawalsList(wthData.withdrawals || []);
      }

      if (escRes.ok) {
        const escData = await escRes.json();
        setEscrowsList(escData.escrows || []);
      }

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoicesList(invData.invoices || []);
      }

      if (taxRes.ok) {
        const tData = await taxRes.json();
        setTaxData(tData);
      }

      if (dspRes.ok) {
        const dData = await dspRes.json();
        setDisputeRecords(dData.disputes || []);
      }

      if (commRes.ok) {
        const cData = await commRes.json();
        setCommissionRules(cData.rules || []);
        setActiveCommissionRule(cData.activeRule || null);
        setCommissionSummary(cData.revenueSummary || null);

        if (cData.activeRule) {
          setDefaultCommInput(cData.activeRule.defaultPercentage || 10);
          setRuleVersionInput(cData.activeRule.version || 'v2026.2');
          setCategoryRatesInput(cData.activeRule.categoryRates || {});
          setFreelancerRatesInput(cData.activeRule.freelancerRates || {});
          setMinFeeInput(cData.activeRule.minFee ?? 50);
          setMaxFeeInput(cData.activeRule.maxFee ?? 25000);
          setEffectiveDateInput(cData.activeRule.effectiveDate ? cData.activeRule.effectiveDate.split('T')[0] : '2026-01-01');
          setRuleDescInput(cData.activeRule.description || '');

          if (cData.activeRule.promotionalPercentage !== undefined) {
            setPromoPercentageInput(cData.activeRule.promotionalPercentage);
            setPromoCodeInput(cData.activeRule.promotionalCode || 'GRAVITASS2026');
            setPromoStartDateInput(cData.activeRule.promotionalStartDate ? cData.activeRule.promotionalStartDate.split('T')[0] : '2026-01-01');
            setPromoEndDateInput(cData.activeRule.promotionalEndDate ? cData.activeRule.promotionalEndDate.split('T')[0] : '2026-12-31');
            setPromoEnabled(true);
          }
        }
      }

      if (userRes.ok) {
        const uData = await userRes.json();
        setUsersList(uData.users || []);
        if (uData.counts) setUserCounts(uData.counts);
      }

      if (setRes.ok) {
        const setData = await setRes.json();
        setPlatformSettings(setData.settings);
        if (setData.settings) {
          setMinWithdrawalInput(setData.settings.minWithdrawalAmount || 20);
          setGstInput(setData.settings.gstPercentage || 18);
          setTdsInput(setData.settings.tdsPercentage || 1);
          if (setData.settings.legalBusinessName) setLegalNameInput(setData.settings.legalBusinessName);
          if (setData.settings.platformGstin) setGstinInput(setData.settings.platformGstin);
        }
      }

      if (admFinRes.ok) {
        const afData = await admFinRes.json();
        setAdminFinanceSummary(afData.summary);
        setAdminCommissionLedger(afData.ledger || []);
        setAdminBankAccounts(afData.bankAccounts || []);
        setAdminWithdrawals(afData.withdrawals || []);
        if (afData.bankAccounts && afData.bankAccounts.length > 0) {
          setAdminWithdrawBankId(afData.bankAccounts[0].id);
        }
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch filtered users when tab or search changes
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/admin/users?tab=${userTab}&search=${encodeURIComponent(userSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setUsersList(data.users || []);
          if (data.counts) setUserCounts(data.counts);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [userTab, userSearch]);

  // Run live commission calculation simulation
  const runLiveSimulation = async (amount: number, category: string, promo: string, freelancerId: string) => {
    setSimLoading(true);
    try {
      const q = new URLSearchParams({
        testAmount: String(amount),
        testCategory: category,
        testPromoCode: promo,
        testFreelancerId: freelancerId
      });
      const res = await fetch(`/api/admin/commission?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSimResult(data.calculationSimulation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'commission') {
      runLiveSimulation(simGrossAmount, simCategory, simPromoCode, simFreelancerId);
    }
  }, [simGrossAmount, simCategory, simPromoCode, simFreelancerId, activeTab]);

  // Open Full User Audit Dossier
  const handleInspectUser = async (userId: string) => {
    setAuditLoading(true);
    setAuditDrawerOpen(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAuditUser(data.auditDetails);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  // User Management Handlers
  const handleVerifyUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'verify' })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || 'User verified successfully!');
        loadAdminData();
      } else {
        alert(data.error || 'Failed to verify user');
      }
    } catch (err: any) {
      alert(err.message || 'Error verifying user');
    }
  };

  const handleOpenRejectModal = (u: User) => {
    setRejectionModal({ open: true, userId: u.id, userName: u.name });
    setRejectionReasonInput('');
  };

  const handleConfirmRejectVerification = async () => {
    if (!rejectionReasonInput.trim()) {
      alert('Please specify a rejection reason for the audit trail.');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: rejectionModal.userId,
          action: 'reject_verification',
          reason: rejectionReasonInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Verification rejected for ${rejectionModal.userName}`);
        setRejectionModal({ open: false, userId: '', userName: '' });
        loadAdminData();
      } else {
        alert(data.error || 'Failed to reject verification');
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting verification');
    }
  };

  const handleOpenSuspendModal = (u: User) => {
    setSuspensionModal({ open: true, userId: u.id, userName: u.name });
    setSuspensionReasonInput('');
  };

  const handleConfirmSuspendUser = async () => {
    if (!suspensionReasonInput.trim()) {
      alert('Please provide a mandatory suspension rationale for compliance.');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: suspensionModal.userId,
          action: 'suspend',
          reason: suspensionReasonInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`User account suspended: ${suspensionModal.userName}`);
        setSuspensionModal({ open: false, userId: '', userName: '' });
        loadAdminData();
      } else {
        alert(data.error || 'Failed to suspend account');
      }
    } catch (err: any) {
      alert(err.message || 'Error suspending account');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reactivate' })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || 'User reactivated successfully!');
        loadAdminData();
      } else {
        alert(data.error || 'Failed to reactivate user');
      }
    } catch (err: any) {
      alert(err.message || 'Error reactivating user');
    }
  };

  const handleDismissComplaint = async (userId: string, complaintId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'dismiss_complaint', complaintId })
      });
      if (res.ok) {
        setActionMsg('Complaint marked as reviewed and dismissed.');
        handleInspectUser(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Commission Rule Handlers
  const handleSaveCommissionRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCommission(true);
    setActionMsg('');
    try {
      const payload = {
        version: ruleVersionInput,
        defaultPercentage: Number(defaultCommInput),
        categoryRates: categoryRatesInput,
        freelancerRates: freelancerRatesInput,
        minFee: Number(minFeeInput),
        maxFee: Number(maxFeeInput),
        effectiveDate: new Date(effectiveDateInput).toISOString(),
        description: ruleDescInput,
        promotionalPercentage: promoEnabled ? Number(promoPercentageInput) : undefined,
        promotionalCode: promoEnabled ? promoCodeInput.trim().toUpperCase() : undefined,
        promotionalStartDate: promoEnabled ? new Date(promoStartDateInput).toISOString() : undefined,
        promotionalEndDate: promoEnabled ? new Date(promoEndDateInput).toISOString() : undefined,
        isActive: true
      };

      const res = await fetch('/api/admin/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Commission rule ${data.rule.version} saved and activated protocol-wide!`);
        loadAdminData();
      } else {
        alert(data.error || 'Failed to save commission rule');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving commission rule');
    } finally {
      setSavingCommission(false);
    }
  };

  const handleActivateRule = async (ruleId: string) => {
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, action: 'activate' })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || 'Rule activated successfully!');
        loadAdminData();
      } else {
        alert(data.error || 'Failed to activate rule');
      }
    } catch (err: any) {
      alert(err.message || 'Error activating rule');
    }
  };

  const handleAddFreelancerOverride = () => {
    if (!overrideFreelancerId.trim()) return;
    setFreelancerRatesInput(prev => ({
      ...prev,
      [overrideFreelancerId.trim()]: Number(overrideFreelancerRate)
    }));
    setOverrideFreelancerId('');
  };

  const handleRemoveFreelancerOverride = (fId: string) => {
    setFreelancerRatesInput(prev => {
      const copy = { ...prev };
      delete copy[fId];
      return copy;
    });
  };

  const handleUpdateCategoryRate = (catSlug: string, rate: number) => {
    setCategoryRatesInput(prev => ({
      ...prev,
      [catSlug]: Number(rate)
    }));
  };

  // Payout & Platform Settings Handlers
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
        setActionMsg(`Payout settled! Gateway Reference: ${data.withdrawal.paymentReference}`);
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

  const handleWithdrawAdminCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminWithdrawBankId) {
      alert('Please select a corporate bank account');
      return;
    }
    setWithdrawingAdminComm(true);
    try {
      const res = await fetch('/api/admin/commission/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId: user?.id || 'user-admin-1',
          amountINR: Number(adminWithdrawAmount),
          bankAccountId: adminWithdrawBankId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || 'Corporate commission withdrawal processed successfully!');
        loadAdminData();
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error processing withdrawal');
    } finally {
      setWithdrawingAdminComm(false);
    }
  };

  const handleRunAutoPayoutSchedule = async () => {
    if (!confirm('Run automated scheduled payout sweep for all eligible freelancer balances?')) return;
    setRunningSchedule(true);
    setActionMsg('');
    try {
      const res = await fetch('/api/finance/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: 'weekly' })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || 'Automated payout runner finished!');
        loadAdminData();
      } else {
        alert(data.error || 'Scheduler runner failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error running scheduler');
    } finally {
      setRunningSchedule(false);
    }
  };

  const handleArbitrateDispute = async (disputeId: string, resolution: DisputeResolutionAction, splitPercent?: number) => {
    const notes = prompt(`Enter arbitration memorandum for decision "${resolution}":`, 'Arbitrated according to milestone deliverables verification.');
    if (!notes) return;

    try {
      const res = await fetch('/api/finance/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          resolution,
          notes,
          splitPercentageFreelancer: splitPercent
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Dispute arbitrated successfully. Resolution: ${resolution}. Double-entry settlement logged.`);
        loadAdminData();
      } else {
        alert(data.error || 'Arbitration failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error communicating with server');
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#071011] pt-36 pb-20 flex flex-col items-center justify-center text-[#91A09E]">
        <div className="w-10 h-10 border-2 border-[#73D8C4] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs tracking-wider uppercase font-mono">Loading Super Admin Command Center...</p>
      </div>
    );
  }

  // Admin access gate
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#071011] pt-36 pb-20 px-4">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#0B1719] border border-red-500/30 text-center space-y-4 shadow-2xl">
          <Lock className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied: Super Admin Clearance Required</h2>
          <p className="text-xs text-[#91A09E] leading-relaxed">
            This gateway is restricted to platform operators. Authenticate with an administrator account to proceed.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#73D8C4] text-[#071011] text-xs font-bold uppercase tracking-wider"
          >
            Sign In as Admin (admin@gravitass.com)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071011] pt-36 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ========================================================
            SUPER ADMIN HEADER & PROTOCOL BADGE
            ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1719] via-[#0D1E21] to-[#0B1719] border border-white/[0.08] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#73D8C4]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ROOT OPERATOR CLEARANCE &bull; LEVEL 4</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#73D8C4]/15 border border-[#73D8C4]/30 text-[#73D8C4] text-[10px] font-mono">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>LIVE ECOSYSTEM</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Super Admin Command Center</h1>
            <p className="text-xs text-[#91A09E] mt-1 max-w-2xl leading-relaxed">
              Real-time marketplace control, dynamic commission revenue management, verified talent compliance, and double-entry escrow supervision.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            {actionMsg && (
              <span className="text-xs font-medium text-emerald-300 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" />
                {actionMsg}
              </span>
            )}
            <button
              onClick={() => { setLoading(true); loadAdminData(); }}
              className="p-2.5 rounded-xl bg-[#0B1719] hover:bg-[#122226] border border-white/[0.1] text-[#91A09E] hover:text-[#73D8C4] transition-all"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS (INCL. COMMISSION REVENUE & USER MANAGEMENT)
            ======================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-white/[0.08] pb-3">
          {[
            { id: 'analytics', label: 'Overview Telemetry', icon: TrendingUp },
            { id: 'commission', label: 'Commission & Revenue', icon: Percent, badge: 'CORE' },
            { id: 'users', label: `User Management (${userCounts.all || usersList.length})`, icon: Users },
            { id: 'payouts', label: `Earnings & Payouts (${withdrawalsList.length})`, icon: DollarSign },
            { id: 'escrows', label: `Escrow Vaults (${escrowsList.length})`, icon: Lock },
            { id: 'disputes', label: `Disputes (${disputeRecords.length})`, icon: AlertTriangle },
            { id: 'taxes', label: 'Statutory Taxes (GST/TDS)', icon: Scale },
            { id: 'invoices', label: `Invoices (${invoicesList.length})`, icon: FileText },
            { id: 'categories', label: `Taxonomy (${categoriesList.length})`, icon: Layers },
            { id: 'projects', label: `Projects (${projectsList.length})`, icon: Briefcase }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 relative ${activeTab === tab.id
                ? 'bg-[#73D8C4]/15 text-[#73D8C4] border border-[#73D8C4]/40 shadow-[0_0_20px_rgba(115,216,196,0.15)]'
                : 'text-[#91A09E] hover:text-white bg-transparent hover:bg-white/[0.02]'
                }`}
            >
              <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#73D8C4] text-[#071011] font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========================================================
            TAB 1: SUPER ADMIN OVERVIEW & 15 REAL METRICS
            ======================================================== */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* Top 4 Hero Financial Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-[#0B1719] border border-white/[0.08] relative overflow-hidden group hover:border-[#73D8C4]/40 transition-all">
                <div className="flex items-center justify-between text-[#91A09E] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Gross Payment Volume (GMV)</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {formatINR(analytics.totalProjectVolume)}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Real Escrow & Contract Flow</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1719] border border-[#73D8C4]/30 relative overflow-hidden group shadow-[0_0_25px_rgba(115,216,196,0.1)]">
                <div className="flex items-center justify-between text-[#91A09E] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-[#73D8C4]">Platform Revenue (Net Fee)</span>
                  <div className="w-8 h-8 rounded-lg bg-[#73D8C4]/15 text-[#73D8C4] flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#73D8C4] tracking-tight">
                  {formatINR(analytics.totalCommissionRevenue)}
                </p>
                <div className="mt-2 text-[11px] text-[#A5E8DE] font-mono">
                  Recognized Commission Profit
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1719] border border-white/[0.08] relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between text-[#91A09E] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Pending Commission</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {formatINR(analytics.pendingCommission)}
                </p>
                <div className="mt-2 text-[11px] text-amber-300 font-mono">
                  Locked in Active Escrows
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1719] border border-white/[0.08] relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between text-[#91A09E] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Total Client Refunds</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {formatINR(analytics.totalRefunds || 0)}
                </p>
                <div className="mt-2 text-[11px] text-[#91A09E]">
                  Dispute & Cancellation Returns
                </div>
              </div>
            </div>

            {/* Second Tier: User Ecosystem & Project Delivery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Registered Users', value: analytics.totalUsers, sub: 'Total Accounts', color: 'text-white' },
                { label: 'Freelancers', value: analytics.totalFreelancers, sub: 'Talent Network', color: 'text-[#73D8C4]' },
                { label: 'Verified Talent', value: analytics.verifiedFreelancers, sub: 'Vetted Pro Badge', color: 'text-emerald-400' },
                { label: 'Clients', value: analytics.totalClients, sub: 'Hiring Companies', color: 'text-cyan-400' },
                { label: 'Active Projects', value: analytics.activeProjects, sub: 'In Progress / Open', color: 'text-amber-300' },
                { label: 'Completed Deliveries', value: analytics.completedProjects, sub: 'Finished Work', color: 'text-purple-300' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0B1719] border border-white/[0.06]">
                  <span className="text-[10px] text-[#91A09E] uppercase tracking-wider block truncate font-mono">{item.label}</span>
                  <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                  <span className="text-[10px] text-white/[0.4] mt-0.5 block">{item.sub}</span>
                </div>
              ))}
            </div>

            {/* Third Tier: Withdrawals, Payouts & Disputes Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#91A09E]">Pending Withdrawals</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {analytics.pendingWithdrawals?.count || 0} In Queue
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{formatINR(analytics.pendingWithdrawals?.amount || 0)}</p>
                <p className="text-[11px] text-[#91A09E] mt-1">Awaiting bank / UPI automated execution</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#91A09E]">Successful Payouts</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    {analytics.successfulPayouts?.count || 0} Settled
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{formatINR(analytics.successfulPayouts?.amount || 0)}</p>
                <p className="text-[11px] text-[#91A09E] mt-1">Total disbursed to verified freelancers</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#91A09E]">Escrow Disputes</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${analytics.disputes?.open > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/10 text-emerald-300'
                    }`}>
                    {analytics.disputes?.open || 0} Open
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {analytics.disputes?.total || 0} <span className="text-xs font-normal text-[#91A09E]">Total Logged</span>
                </p>
                <p className="text-[11px] text-[#91A09E] mt-1">{analytics.disputes?.resolved || 0} arbitrated through double-entry ledger</p>
              </div>
            </div>

            {/* Monthly Revenue & Volume Telemetry Visualization */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#73D8C4]" />
                    <span>Real Monthly Platform Revenue & GMV Breakdown</span>
                  </h3>
                  <p className="text-xs text-[#91A09E] mt-0.5">
                    Aggregated directly from immutable double-entry ledger transactions. Only recognized commission counts toward platform earnings.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-white/[0.7]">
                    <span className="w-3 h-3 rounded bg-white/[0.2]" />
                    Gross Volume
                  </span>
                  <span className="flex items-center gap-1.5 text-[#73D8C4]">
                    <span className="w-3 h-3 rounded bg-[#73D8C4]" />
                    Platform Commission (Net)
                  </span>
                </div>
              </div>

              {/* Monthly Visual Bar Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4">
                {(analytics.monthlyRevenue || []).map((m: any, idx: number) => {
                  const maxGross = Math.max(...(analytics.monthlyRevenue || []).map((x: any) => x.grossVolume || 1), 1000);
                  const barHeightPercent = Math.min(100, Math.max(12, Math.round(((m.grossVolume || 0) / maxGross) * 100)));
                  const commHeightPercent = Math.min(100, Math.max(8, Math.round(((m.commissionRevenue || 0) / maxGross) * 100)));

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 group">
                      <div className="w-full h-36 bg-[#071011] rounded-xl p-1 flex items-end justify-center gap-1 border border-white/[0.04] relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#071011] border border-white/[0.12] rounded-lg p-1.5 text-[10px] font-mono whitespace-nowrap z-20 pointer-events-none shadow-xl">
                          <div>Gross: {formatINR(m.grossVolume || 0)}</div>
                          <div className="text-[#73D8C4]">Rev: {formatINR(m.commissionRevenue || 0)}</div>
                        </div>

                        {/* GMV Bar */}
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className="w-1/2 bg-white/[0.15] group-hover:bg-white/[0.3] rounded-t transition-all"
                        />
                        {/* Commission Revenue Bar */}
                        <div
                          style={{ height: `${commHeightPercent}%` }}
                          className="w-1/2 bg-[#73D8C4] group-hover:bg-[#87E5D3] rounded-t transition-all shadow-[0_0_10px_rgba(115,216,196,0.3)]"
                        />
                      </div>
                      <span className="text-[11px] font-mono text-[#91A09E]">{m.month}</span>
                      <span className="text-[9px] font-mono text-[#73D8C4]">{formatINR(m.commissionRevenue || 0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: COMMISSION & REVENUE MANAGEMENT (MOST IMPORTANT)
            ======================================================== */}
        {activeTab === 'commission' && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* Header Description & Accounting Rules Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B1719] to-[#071011] border border-[#73D8C4]/30 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-[#73D8C4] uppercase tracking-widest font-bold">
                    CENTRALIZED COMMISSION ENGINE &bull; ARITHMETIC SAFETY
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-1">Platform Commission & Revenue Protocol</h2>
                  <p className="text-xs text-[#91A09E] mt-1 max-w-3xl leading-relaxed">
                    Configure default, category-specific, freelancer concessional, and promotional commission rates.
                    Calculations run server-side with integer minor currency arithmetic. Old transactions are never retroactively modified.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-[#91A09E] uppercase block font-mono">Active Rule</span>
                    <span className="text-sm font-bold text-[#73D8C4] font-mono">
                      {activeCommissionRule?.version || 'v2026.1'} ({activeCommissionRule?.defaultPercentage || 10}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Crucial Accounting Safeguard Alert */}
              <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center gap-2 text-xs text-[#A5E8DE]">
                <ShieldCheck className="w-4 h-4 text-[#73D8C4] flex-shrink-0" />
                <span>
                  <strong>Accounting Rule:</strong> Total project payment volume is escrow held in trust and <strong>NEVER</strong> counted as platform profit. Platform commission revenue is recognized strictly when milestone releases occur.
                </span>
              </div>
            </div>

            {/* Live Commission Calculator / Interactive Simulation Sandbox */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#73D8C4]" />
                    <span>Real-time Commission & Payout Simulation Sandbox</span>
                  </h3>
                  <p className="text-xs text-[#91A09E] mt-0.5">
                    Test live calculations against current active rules, category rates, promotional codes, and tax withholdings.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#73D8C4]/10 text-[#73D8C4] border border-[#73D8C4]/30">
                  Server-side Arithmetic
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Calculator Inputs */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Project Amount (INR ₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={simGrossAmount}
                      onChange={e => setSimGrossAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#73D8C4]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Category
                    </label>
                    <select
                      value={simCategory}
                      onChange={e => setSimCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white text-xs focus:outline-none focus:border-[#73D8C4]"
                    >
                      {categoriesList.map(c => (
                        <option key={c.id} value={c.slug}>
                          {c.name} {categoryRatesInput[c.slug] ? `(${categoryRatesInput[c.slug]}% rate)` : `(${defaultCommInput}% default)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                        Promo Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={simPromoCode}
                        onChange={e => setSimPromoCode(e.target.value)}
                        placeholder="e.g. GRAVITASS2026"
                        className="w-full px-3 py-2 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                        Freelancer ID (Override)
                      </label>
                      <input
                        type="text"
                        value={simFreelancerId}
                        onChange={e => setSimFreelancerId(e.target.value)}
                        placeholder="e.g. user-freelancer-1"
                        className="w-full px-3 py-2 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Output Cards */}
                <div className="lg:col-span-7 bg-[#071011] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
                  {simResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs text-[#91A09E]">Effective Commission Rate Applied:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#73D8C4] font-mono">
                            {simResult.effectiveCommissionRate}%
                          </span>
                          {simResult.promotionalApplied && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#73D8C4]/20 text-[#73D8C4] font-bold">
                              PROMO APPLIED
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-[10px] text-[#91A09E] block">Gross Project Amount</span>
                          <span className="text-sm font-bold text-white mt-1 block">
                            {formatINR(simResult.grossAmount)}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#73D8C4]/10 border border-[#73D8C4]/30">
                          <span className="text-[10px] text-[#73D8C4] block">Platform Revenue</span>
                          <span className="text-sm font-bold text-[#73D8C4] mt-1 block">
                            {formatINR(simResult.platformRevenue)}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-[10px] text-[#91A09E] block">Freelancer Entitlement</span>
                          <span className="text-sm font-bold text-white mt-1 block">
                            {formatINR(simResult.freelancerEntitlement)}
                          </span>
                        </div>
                      </div>

                      {/* Statutory Taxes Breakdown */}
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-[11px] font-mono">
                        <div className="flex items-center justify-between text-[#91A09E]">
                          <span>GST on Platform Fee (18%):</span>
                          <span className="text-white">{formatINR(simResult.gstOnPlatformFee)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#91A09E]">
                          <span>Section 194-O TDS Withholding (1%):</span>
                          <span className="text-amber-300">-{formatINR(simResult.tdsWithheld)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-bold text-xs">
                          <span className="text-emerald-400">Final Net Payout Payable to Talent:</span>
                          <span className="text-emerald-400 text-sm">{formatINR(simResult.netPayableToFreelancer)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs text-[#91A09E]">
                      Running live simulation...
                    </div>
                  )}

                  <div className="text-[10px] text-[#91A09E]/70 font-mono mt-3">
                    Calculated under protocol rule: {simResult?.ruleVersion || activeCommissionRule?.version} &bull; Minor unit precision (paise)
                  </div>
                </div>

              </div>
            </div>

            {/* Super Admin Commission Configuration Form */}
            <form onSubmit={handleSaveCommissionRule} className="p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-[#73D8C4]" />
                    <span>Configure Platform Commission Policy</span>
                  </h3>
                  <p className="text-xs text-[#91A09E] mt-0.5">
                    Changes create an immutable new rule version. All prior transactions retain their original commission audit records.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savingCommission}
                  className="px-6 py-2.5 rounded-xl bg-[#73D8C4] hover:bg-[#5fcbb6] text-[#071011] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(115,216,196,0.3)] disabled:opacity-50"
                >
                  {savingCommission ? 'Saving & Publishing Rule...' : 'Save & Deploy Commission Policy'}
                </button>
              </div>

              {/* 1. Global Parameters */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase text-[#73D8C4] font-bold tracking-wider">
                  1. Global Parameters & Thresholds
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Rule Version
                    </label>
                    <input
                      type="text"
                      value={ruleVersionInput}
                      onChange={e => setRuleVersionInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Default Commission (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      value={defaultCommInput}
                      onChange={e => setDefaultCommInput(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      required
                    />
                    <span className="text-[10px] text-[#91A09E] mt-0.5 block">Fallback rate across services</span>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Minimum Fee Floor (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={minFeeInput}
                      onChange={e => setMinFeeInput(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                    />
                    <span className="text-[10px] text-[#91A09E] mt-0.5 block">Minimum platform fee per project</span>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Maximum Fee Cap (₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={maxFeeInput}
                      onChange={e => setMaxFeeInput(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                    />
                    <span className="text-[10px] text-[#91A09E] mt-0.5 block">Fee cap on enterprise high-ticket contracts</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Effective Start Date
                    </label>
                    <input
                      type="date"
                      value={effectiveDateInput}
                      onChange={e => setEffectiveDateInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-[#91A09E] block mb-1">
                      Policy Description / Notes
                    </label>
                    <input
                      type="text"
                      value={ruleDescInput}
                      onChange={e => setRuleDescInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white text-xs focus:outline-none focus:border-[#73D8C4]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Category-Specific Commission Rates */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono uppercase text-[#73D8C4] font-bold tracking-wider">
                      2. Category-Specific Commission Rates
                    </h4>
                    <p className="text-xs text-[#91A09E] mt-0.5">
                      Set tailored take rates for different vertical domains based on competitive marketplace dynamics.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoriesList.map(cat => {
                    const currentRate = categoryRatesInput[cat.slug] !== undefined
                      ? categoryRatesInput[cat.slug]
                      : defaultCommInput;

                    return (
                      <div key={cat.id} className="p-3.5 rounded-xl bg-[#071011] border border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{cat.name}</span>
                          <span className="text-xs font-bold text-[#73D8C4] font-mono">{currentRate}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={30}
                          step={0.5}
                          value={currentRate}
                          onChange={e => handleUpdateCategoryRate(cat.slug, Number(e.target.value))}
                          className="w-full accent-[#73D8C4] cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Freelancer-Specific Concessions & Overrides */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#73D8C4] font-bold tracking-wider">
                    3. Freelancer-Specific Commission Overrides
                  </h4>
                  <p className="text-xs text-[#91A09E] mt-0.5">
                    Reward elite high-volume talent with concessional platform rates.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={overrideFreelancerId}
                    onChange={e => setOverrideFreelancerId(e.target.value)}
                    placeholder="Enter Freelancer User ID (e.g. user-freelancer-1)"
                    className="flex-1 px-3.5 py-2 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      step={0.5}
                      value={overrideFreelancerRate}
                      onChange={e => setOverrideFreelancerRate(Number(e.target.value))}
                      className="w-24 px-3 py-2 bg-[#071011] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                    />
                    <span className="text-xs text-[#91A09E]">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFreelancerOverride}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Override</span>
                  </button>
                </div>

                {Object.keys(freelancerRatesInput).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {Object.entries(freelancerRatesInput).map(([fId, rate]) => (
                      <span
                        key={fId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071011] border border-white/[0.1] text-xs font-mono"
                      >
                        <span className="text-[#91A09E]">{fId}:</span>
                        <strong className="text-[#73D8C4]">{rate}%</strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveFreelancerOverride(fId)}
                          className="text-red-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Promotional Commission Concessions */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono uppercase text-[#73D8C4] font-bold tracking-wider">
                      4. Promotional Commission Concession
                    </h4>
                    <p className="text-xs text-[#91A09E] mt-0.5">
                      Enable promotional discount commission for platform growth campaigns.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promoEnabled}
                      onChange={e => setPromoEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#73D8C4] rounded"
                    />
                    <span className="text-xs font-bold text-white">Promo Active</span>
                  </label>
                </div>

                {promoEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#071011] border border-white/[0.06]">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                        Promo Commission (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        step={0.5}
                        value={promoPercentageInput}
                        onChange={e => setPromoPercentageInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0B1719] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                        Promo Voucher Code
                      </label>
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0B1719] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                        Promo Start Date
                      </label>
                      <input
                        type="date"
                        value={promoStartDateInput}
                        onChange={e => setPromoStartDateInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0B1719] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                        Promo End Date
                      </label>
                      <input
                        type="date"
                        value={promoEndDateInput}
                        onChange={e => setPromoEndDateInput(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0B1719] border border-white/[0.1] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#73D8C4]"
                      />
                    </div>
                  </div>
                )}
              </div>

            </form>

            {/* Historical Commission Rules Table */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#73D8C4]" />
                <span>Commission Rules Protocol History</span>
              </h3>
              <p className="text-xs text-[#91A09E]">
                Active rules govern new milestone credits. Past transactions remain immutably stamped with their historical rule ID.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#071011] text-[10px] uppercase font-mono tracking-wider text-[#91A09E] border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4">Rule Version</th>
                      <th className="py-3 px-4">Default %</th>
                      <th className="py-3 px-4">Effective Date</th>
                      <th className="py-3 px-4">Floor / Cap</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {commissionRules.map(r => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          <div>{r.version}</div>
                          <div className="text-[10px] text-[#91A09E] font-normal">{r.description}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#73D8C4] font-bold">
                          {r.defaultPercentage}%
                        </td>
                        <td className="py-3 px-4 text-[#91A09E] font-mono">
                          {new Date(r.effectiveDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-white">
                          ₹{r.minFee} / ₹{r.maxFee}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${r.isActive
                            ? 'bg-[#73D8C4]/20 text-[#73D8C4] border border-[#73D8C4]/40'
                            : 'bg-white/[0.04] text-[#91A09E]'
                            }`}>
                            {r.isActive ? 'ACTIVE PLATFORM RULE' : 'ARCHIVED'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!r.isActive && (
                            <button
                              type="button"
                              onClick={() => handleActivateRule(r.id)}
                              className="px-3 py-1 rounded-lg bg-[#73D8C4]/15 hover:bg-[#73D8C4]/25 text-[#73D8C4] font-mono text-[10px] uppercase font-bold transition-all"
                            >
                              Make Active Rule
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================
                MODULE 8 & 9: RECOGNIZED COMMISSION LEDGER & CORPORATE TREASURY WITHDRAWAL
                ======================================================== */}
            <div className="space-y-6 pt-6 border-t border-white/[0.08]">
              
              {/* Corporate Treasury Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
                  <span className="text-[10px] text-[#91A09E] uppercase tracking-wider block font-mono">Recognized Commission</span>
                  <p className="text-xl font-bold text-[#73D8C4] font-mono mt-1">
                    {formatINR(adminFinanceSummary?.totalRecognizedRevenue || 59000)}
                  </p>
                  <span className="text-[10px] text-gray-500 block mt-1">From approved order deliveries</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1719] border border-[#73D8C4]/40 shadow-[0_0_15px_rgba(115,216,196,0.1)]">
                  <span className="text-[10px] text-[#73D8C4] uppercase tracking-wider block font-mono font-bold">Available Corporate Balance</span>
                  <p className="text-xl font-black text-white font-mono mt-1">
                    {formatINR(adminFinanceSummary?.availableCommissionBalance || 34000)}
                  </p>
                  <span className="text-[10px] text-emerald-400 block mt-1">Ready for corporate withdrawal</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
                  <span className="text-[10px] text-[#91A09E] uppercase tracking-wider block font-mono">Total Withdrawn</span>
                  <p className="text-xl font-bold text-gray-200 font-mono mt-1">
                    {formatINR(adminFinanceSummary?.totalWithdrawn || 25000)}
                  </p>
                  <span className="text-[10px] text-gray-500 block mt-1">Disbursed to corporate bank</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1719] border border-white/[0.08]">
                  <span className="text-[10px] text-[#91A09E] uppercase tracking-wider block font-mono">Pending in Escrow</span>
                  <p className="text-xl font-bold text-amber-300 font-mono mt-1">
                    {formatINR(adminFinanceSummary?.pendingCommissionInOrders || 96000)}
                  </p>
                  <span className="text-[10px] text-gray-500 block mt-1">Locked until client signoff</span>
                </div>
              </div>

              {/* Corporate Treasury Bank Withdrawal Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#73D8C4]" />
                    <span>Corporate Treasury Commission Withdrawal</span>
                  </h3>
                  <p className="text-xs text-[#91A09E] mt-0.5">
                    Disburse recognized platform commission revenue to the verified corporate bank account.
                  </p>
                </div>

                <form onSubmit={handleWithdrawAdminCommission} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5">
                    <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                      Corporate Destination Account
                    </label>
                    <select
                      value={adminWithdrawBankId}
                      onChange={e => setAdminWithdrawBankId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#73D8C4]"
                      required
                    >
                      {adminBankAccounts.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} - {b.maskedAccountNumber} ({b.accountHolderName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[11px] font-mono uppercase text-[#91A09E] block mb-1">
                      Withdrawal Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={adminFinanceSummary?.availableCommissionBalance || 100000}
                      value={adminWithdrawAmount}
                      onChange={e => setAdminWithdrawAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-[#73D8C4]"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      disabled={withdrawingAdminComm || (adminFinanceSummary?.availableCommissionBalance || 0) <= 0}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#73D8C4] hover:bg-[#73D8C4]/90 text-[#071011] font-mono text-xs uppercase font-extrabold tracking-wider transition-all disabled:opacity-50"
                    >
                      {withdrawingAdminComm ? 'Disbursing...' : 'Disburse to Treasury'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Commission Ledger Table */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#73D8C4]" />
                      <span>Recognized Commission Revenue Ledger</span>
                    </h3>
                    <p className="text-xs text-[#91A09E] mt-0.5">
                      Immutable double-entry log of all platform commission retained upon order deliverable approval.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-[#73D8C4]">
                    {adminCommissionLedger.length} Audited Records
                  </span>
                </div>

                <div className="overflow-x-auto scrollbar-none rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#071011] border-b border-white/[0.06] text-[#91A09E] font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Ref ID / Date</th>
                        <th className="py-3 px-4">Project & Order</th>
                        <th className="py-3 px-4">Client / Freelancer</th>
                        <th className="py-3 px-4 font-mono">Gross Volume</th>
                        <th className="py-3 px-4 font-mono">Commission</th>
                        <th className="py-3 px-4 font-mono">GST (18%)</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {adminCommissionLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-white block">{entry.id}</span>
                            <span className="text-[10px] text-gray-500">{new Date(entry.recognitionDate).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block truncate max-w-xs">{entry.projectTitle}</span>
                            <span className="text-[10px] font-mono text-[#73D8C4]">{entry.orderId}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-300">
                            <div>{entry.clientName}</div>
                            <div className="text-[10px] text-gray-500">&rarr; {entry.freelancerName}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {formatINR(entry.grossProjectAmountINR)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#73D8C4]">
                            {formatINR(entry.commissionAmountINR)} ({entry.commissionPercentage}%)
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-400">
                            {formatINR(entry.applicableTaxINR)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold uppercase">
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            TAB 3: COMPLETE USER MANAGEMENT (6 TABS + AUDIT DOSSIER)
            ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* Header and Search Controls */}
            <div className="p-6 rounded-2xl bg-[#0B1719] border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Marketplace User Management</h2>
                  <p className="text-xs text-[#91A09E] mt-0.5">
                    Monitor accounts, grant elite verification badges, inspect full dossiers, or execute compliance suspensions.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#91A09E] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, or ID..."
                    className="w-full pl-9 pr-4 py-2 bg-[#071011] border border-white/[0.1] rounded-xl text-white text-xs placeholder-[#91A09E]/60 focus:outline-none focus:border-[#73D8C4]"
                  />
                </div>
              </div>

              {/* Sub-Tabs: 6 Required Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-white/[0.06]">
                {[
                  { id: 'all', label: 'All Users', count: userCounts.all },
                  { id: 'freelancers', label: 'Freelancers', count: userCounts.freelancers },
                  { id: 'clients', label: 'Clients', count: userCounts.clients },
                  { id: 'verified', label: 'Verified Users', count: userCounts.verified },
                  { id: 'pending', label: 'Pending Verification', count: userCounts.pending },
                  { id: 'suspended', label: 'Suspended Users', count: userCounts.suspended }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setUserTab(st.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${userTab === st.id
                      ? 'bg-[#73D8C4]/20 text-[#73D8C4] border border-[#73D8C4]/40 font-bold'
                      : 'text-[#91A09E] hover:text-white bg-white/[0.02]'
                      }`}
                  >
                    <span>{st.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08]">
              {usersList.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#91A09E]">
                  No users found in "{userTab}" category.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase font-mono tracking-wider text-[#91A09E] border-b border-white/[0.08]">
                      <tr>
                        <th className="pb-3 px-3">User & Contact</th>
                        <th className="pb-3 px-3">Role</th>
                        <th className="pb-3 px-3">Verification</th>
                        <th className="pb-3 px-3">Compliance Status</th>
                        <th className="pb-3 px-3">Joined Date</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {usersList.map((u) => {
                        const isSuspended = !!u.isSuspended;
                        const isVerified = !!u.isVerified || u.verificationStatus === 'verified';
                        const isPending = u.verificationStatus === 'pending' || (!isVerified && !isSuspended);

                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatarUrl || 'https://avatar.vercel.sh/user.png'}
                                  alt={u.name}
                                  className="w-8 h-8 rounded-full object-cover border border-white/[0.1] flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate">{u.name}</div>
                                  <div className="text-[11px] text-[#91A09E] truncate">{u.email}</div>
                                  <div className="text-[9px] font-mono text-white/[0.3]">{u.id}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className="capitalize px-2 py-0.5 rounded-md bg-white/[0.04] text-white font-medium text-[11px]">
                                {u.role}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              {isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <Check className="w-3 h-3" />
                                  <span>Verified Pro</span>
                                </span>
                              ) : u.verificationStatus === 'rejected' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                  <X className="w-3 h-3" />
                                  <span>Rejected</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                  <span>Pending Review</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {isSuspended ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  <Ban className="w-3 h-3" />
                                  <span>Suspended</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                                  Active Good Standing
                                </span>
                              )}
                              {u.reportedCount && u.reportedCount > 0 && (
                                <div className="text-[10px] text-rose-400 font-mono mt-0.5">
                                  {u.reportedCount} complaints logged
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3 font-mono text-[#91A09E] text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">

                                {/* Inspect User Dossier */}
                                <button
                                  onClick={() => handleInspectUser(u.id)}
                                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#91A09E] hover:text-[#73D8C4] transition-colors"
                                  title="Inspect Full User Audit Dossier"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Verification Actions */}
                                {!isVerified ? (
                                  <button
                                    onClick={() => handleVerifyUser(u.id)}
                                    className="px-2 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-bold uppercase"
                                    title="Grant Verified Badge"
                                  >
                                    Verify
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenRejectModal(u)}
                                    className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-rose-500/20 text-rose-400 text-[10px] uppercase"
                                    title="Reject / Revoke Verification"
                                  >
                                    Revoke
                                  </button>
                                )}

                                {/* Suspension Actions */}
                                {!isSuspended ? (
                                  <button
                                    onClick={() => handleOpenSuspendModal(u)}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                                    title="Suspend User Account"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleReactivateUser(u.id)}
                                    className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase"
                                    title="Reactivate Suspended Account"
                                  >
                                    Reactivate
                                  </button>
                                )}

                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* User Audit Dossier Side Drawer / Modal */}
            {auditDrawerOpen && (
              <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
                <div className="w-full max-w-2xl bg-[#071011] border-l border-white/[0.1] h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">

                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#73D8C4] uppercase tracking-wider block font-bold">
                        USER AUDIT DOSSIER &bull; COMPLIANCE RECORD
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">
                        {selectedAuditUser?.user?.name || 'User Inspection'}
                      </h3>
                    </div>
                    <button
                      onClick={() => { setAuditDrawerOpen(false); setSelectedAuditUser(null); }}
                      className="p-2 rounded-xl text-[#91A09E] hover:text-white hover:bg-white/[0.06]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {auditLoading ? (
                    <div className="py-20 text-center text-[#91A09E]">
                      <div className="w-8 h-8 border-2 border-[#73D8C4] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="mt-3 text-xs">Decrypting user audit records...</p>
                    </div>
                  ) : selectedAuditUser ? (
                    <div className="space-y-6 text-xs">

                      {/* Identity & Compliance Summary */}
                      <div className="p-4 rounded-2xl bg-[#0B1719] border border-white/[0.06] space-y-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedAuditUser.user.avatarUrl || 'https://avatar.vercel.sh/user.png'}
                            alt={selectedAuditUser.user.name}
                            className="w-12 h-12 rounded-full object-cover border border-white/[0.1]"
                          />
                          <div>
                            <div className="font-bold text-white text-base">{selectedAuditUser.user.name}</div>
                            <div className="text-[#91A09E]">{selectedAuditUser.user.email}</div>
                            <div className="text-[10px] font-mono text-white/[0.4]">{selectedAuditUser.user.id}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06] font-mono text-[11px]">
                          <div>
                            <span className="text-[#91A09E] block text-[9px]">ROLE</span>
                            <span className="text-white capitalize">{selectedAuditUser.user.role}</span>
                          </div>
                          <div>
                            <span className="text-[#91A09E] block text-[9px]">VERIFICATION</span>
                            <span className={selectedAuditUser.user.isVerified ? 'text-emerald-400' : 'text-amber-300'}>
                              {selectedAuditUser.user.isVerified ? 'Verified Pro' : 'Unverified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#91A09E] block text-[9px]">STATUS</span>
                            <span className={selectedAuditUser.user.isSuspended ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                              {selectedAuditUser.user.isSuspended ? 'SUSPENDED' : 'Active'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#91A09E] block text-[9px]">JOINED</span>
                            <span className="text-white">{new Date(selectedAuditUser.user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {selectedAuditUser.user.suspensionReason && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                            <strong>Suspension Reason:</strong> {selectedAuditUser.user.suspensionReason}
                          </div>
                        )}
                      </div>

                      {/* Portfolio Showcase if Freelancer */}
                      {selectedAuditUser.portfolio && selectedAuditUser.portfolio.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-mono uppercase text-[#73D8C4] font-bold">
                            Portfolio Samples ({selectedAuditUser.portfolio.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedAuditUser.portfolio.map((item: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-xl bg-[#0B1719] border border-white/[0.06] space-y-1.5">
                                {item.imageUrl && (
                                  <img src={item.imageUrl} alt={item.title} className="w-full h-24 object-cover rounded-lg" />
                                )}
                                <div className="font-bold text-white text-xs">{item.title}</div>
                                <p className="text-[11px] text-[#91A09E] line-clamp-2">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Project Briefs History */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono uppercase text-[#73D8C4] font-bold">
                          Project Briefs & Engagements ({selectedAuditUser.projects.length})
                        </h4>
                        {selectedAuditUser.projects.length === 0 ? (
                          <p className="text-[#91A09E] italic text-xs">No projects associated with this account.</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedAuditUser.projects.map((p: any) => (
                              <div key={p.id} className="p-3 rounded-xl bg-[#0B1719] border border-white/[0.06] flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-white">{p.title}</div>
                                  <div className="text-[10px] text-[#91A09E]">{p.category} &bull; Budget: ${p.budgetMin}-${p.budgetMax}</div>
                                </div>
                                <span className="capitalize px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono text-white">
                                  {p.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Transaction Ledger Records */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono uppercase text-[#73D8C4] font-bold">
                          Financial Ledger Transactions ({selectedAuditUser.ledger.length})
                        </h4>
                        {selectedAuditUser.ledger.length === 0 ? (
                          <p className="text-[#91A09E] italic text-xs">Zero ledger records found.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedAuditUser.ledger.map((l: any) => (
                              <div key={l.id} className="p-2.5 rounded-lg bg-[#0B1719] border border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
                                <div>
                                  <div className="text-white font-medium">{l.projectTitle}</div>
                                  <div className="text-[9px] text-[#91A09E]">{l.id} &bull; {new Date(l.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[#73D8C4] font-bold">${l.netAmount.toFixed(2)}</div>
                                  <div className="text-[9px] text-[#91A09E]">Fee: ${l.platformFee}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Complaints & Reports Review */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono uppercase text-rose-400 font-bold">
                          User Complaints & Compliance Reports ({selectedAuditUser.complaints.length})
                        </h4>
                        {selectedAuditUser.complaints.length === 0 ? (
                          <p className="text-[#91A09E] italic text-xs">Zero complaints filed against this user.</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedAuditUser.complaints.map((c: any) => (
                              <div key={c.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white text-xs">Reported by {c.reporterName}</span>
                                  <span className="text-[9px] font-mono text-rose-300 uppercase">{c.status}</span>
                                </div>
                                <p className="text-rose-200 text-xs">{c.reason}</p>
                                {c.details && <p className="text-[#91A09E] text-[11px] font-mono">{c.details}</p>}
                                {c.status !== 'dismissed' && (
                                  <div className="pt-2 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleDismissComplaint(selectedAuditUser.user.id, c.id)}
                                      className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-[10px] text-white uppercase font-bold"
                                    >
                                      Dismiss Complaint
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : null}

                </div>
              </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectionModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-md bg-[#0B1719] border border-white/[0.1] rounded-3xl p-6 space-y-4 shadow-2xl">
                  <h3 className="text-base font-bold text-white">Reject Account Verification</h3>
                  <p className="text-xs text-[#91A09E]">
                    Specify the formal rationale for rejecting verification for <strong>{rejectionModal.userName}</strong>. This will be recorded in compliance logs.
                  </p>
                  <textarea
                    rows={3}
                    value={rejectionReasonInput}
                    onChange={e => setRejectionReasonInput(e.target.value)}
                    placeholder="e.g. Identity document photo unreadable or tax mismatch..."
                    className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white text-xs focus:outline-none focus:border-[#73D8C4]"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRejectionModal({ open: false, userId: '', userName: '' })}
                      className="px-4 py-2 rounded-xl text-xs text-[#91A09E] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRejectVerification}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Suspension Reason Modal */}
            {suspensionModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-md bg-[#0B1719] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    <span>Suspend User Account</span>
                  </h3>
                  <p className="text-xs text-[#91A09E]">
                    Suspending <strong>{suspensionModal.userName}</strong> will immediately revoke protocol access and pause payout processing.
                  </p>
                  <textarea
                    rows={3}
                    value={suspensionReasonInput}
                    onChange={e => setSuspensionReasonInput(e.target.value)}
                    placeholder="Enter compliance rationale (e.g. Terms of Service violation, off-platform solicitation)..."
                    className="w-full px-3.5 py-2.5 bg-[#071011] border border-white/[0.1] rounded-xl text-white text-xs focus:outline-none focus:border-rose-400"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSuspensionModal({ open: false, userId: '', userName: '' })}
                      className="px-4 py-2 rounded-xl text-xs text-[#91A09E] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSuspendUser}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase"
                    >
                      Suspend Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 4: EARNINGS & PAYOUTS MANAGEMENT
            ======================================================== */}
        {activeTab === 'payouts' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Freelancer Payout Requests Queue</h3>
                  <p className="text-xs text-[#91A09E]">Review pending payouts, dispatch through Indian Banking / UPI gateway, or reject with atomic refund.</p>
                </div>
                <button
                  type="button"
                  onClick={handleRunAutoPayoutSchedule}
                  disabled={runningSchedule}
                  className="px-4 py-2.5 rounded-xl bg-[#73D8C4] hover:bg-[#5fcbb6] text-[#071011] font-mono text-xs font-bold uppercase flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{runningSchedule ? 'Running Sweep...' : 'Run Automated Payout Sweep'}</span>
                </button>
              </div>

              {withdrawalsList.length === 0 ? (
                <p className="text-[#91A09E] py-12 text-center text-xs">No pending withdrawal requests in queue.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#071011] text-[10px] uppercase font-mono tracking-wider text-[#91A09E] border-b border-white/[0.06]">
                      <tr>
                        <th className="py-3 px-4">Withdrawal ID</th>
                        <th className="py-3 px-4">Freelancer</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {withdrawalsList.map((w) => (
                        <tr key={w.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-4 font-mono text-[#91A09E]">
                            <div>{w.id}</div>
                            <div className="text-[10px] text-white/[0.4]">{new Date(w.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{w.freelancerName}</div>
                            <div className="text-[10px] text-[#91A09E] font-mono">{w.freelancerId}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#73D8C4]">
                            {formatINR(w.finalAmount || w.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white capitalize">{w.method.replace('_', ' ')}</div>
                            <div className="text-[10px] font-mono text-[#91A09E]">
                              {w.payoutDetails?.maskedAccount || w.payoutDetails?.maskedUpi}
                              {w.payoutDetails?.ifsc && ` (${w.payoutDetails.ifsc})`}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${w.status === 'paid'
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
                          <td className="py-3 px-4 text-right">
                            {w.status === 'requested' || w.status === 'under_review' || w.status === 'processing' || w.status === 'approved' ? (
                              <div className="flex items-center justify-end gap-2">
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
                              <span className="text-[11px] text-[#91A09E] italic">Settled</span>
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

        {/* ========================================================
            TAB 5: ESCROW VAULTS
            ======================================================== */}
        {activeTab === 'escrows' && (
          <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Segregated Escrow Accounts & Milestones</h2>
                <p className="text-xs text-[#91A09E]">All customer funds are locked in designated trustee escrow accounts until milestones are verified.</p>
              </div>
              <span className="font-mono text-[#73D8C4]">{escrowsList.length} Active Vaults</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071011] text-[10px] uppercase font-mono tracking-wider text-[#91A09E]">
                  <tr>
                    <th className="py-3 px-4">Escrow Vault ID</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Freelancer</th>
                    <th className="py-3 px-4">Funded Volume</th>
                    <th className="py-3 px-4">Released</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {escrowsList.map(esc => (
                    <tr key={esc.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-[#73D8C4]">{esc.id}</td>
                      <td className="py-3 px-4 font-medium text-white">{esc.projectTitle}</td>
                      <td className="py-3 px-4 text-[#91A09E]">{esc.clientName}</td>
                      <td className="py-3 px-4 text-[#91A09E]">{esc.freelancerName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{formatINR(esc.fundedAmount)}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{formatINR(esc.releasedAmount)}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-white/[0.04] text-[10px] font-mono">
                          {esc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: DISPUTES & ARBITRATION
            ======================================================== */}
        {activeTab === 'disputes' && (
          <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Escrow Dispute Arbitration Terminal</h2>
                <p className="text-xs text-[#91A09E]">
                  Arbitrate contested milestone deliverables. Decisions trigger cryptographic double-entry settlements.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] uppercase border border-rose-500/40">
                {disputeRecords.filter(d => d.status === 'open').length} Contested Vaults
              </span>
            </div>

            {disputeRecords.length === 0 ? (
              <p className="text-[#91A09E] py-12 text-center">Zero disputes logged. All escrow funds are operating without friction.</p>
            ) : (
              <div className="space-y-4">
                {disputeRecords.map((dsp) => (
                  <div key={dsp.id} className="p-5 rounded-2xl bg-[#071011] border border-white/[0.08] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${dsp.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}>
                            {dsp.status}
                          </span>
                          <span className="font-mono text-[#91A09E]">{dsp.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{dsp.projectTitle}</h4>
                        <p className="text-[#91A09E] text-xs">
                          Client: <strong className="text-white">{dsp.clientName}</strong> &bull; Talent: <strong className="text-white">{dsp.freelancerName}</strong> &bull; Contested: <strong className="text-rose-400 font-mono">{formatINR(dsp.disputedAmount)}</strong>
                        </p>
                      </div>

                      {dsp.status === 'open' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleArbitrateDispute(dsp.id, 'full_release_freelancer')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold"
                          >
                            Full Release to Talent
                          </button>
                          <button
                            onClick={() => handleArbitrateDispute(dsp.id, 'full_refund_client')}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] uppercase font-bold"
                          >
                            Full Refund to Client
                          </button>
                          <button
                            onClick={() => handleArbitrateDispute(dsp.id, 'partial_split', 50)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10px] uppercase font-bold"
                          >
                            Split 50/50
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B1719] border border-white/[0.04] text-xs">
                      <span className="text-[10px] font-mono text-[#91A09E] uppercase block mb-1">Reason & Claims:</span>
                      <p className="text-white">{dsp.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 7: STATUTORY TAXES & TDS
            ======================================================== */}
        {activeTab === 'taxes' && (
          <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-6 text-xs animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white">Statutory Tax & TDS Withholding (Section 194-O)</h2>
              <p className="text-xs text-[#91A09E]">Mandatory compliance parameters for marketplace operator withholding and Goods & Services Tax.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-3">
                <span className="text-[10px] font-mono text-[#73D8C4] uppercase font-bold">GST COMPLIANCE (SAC 998311)</span>
                <div className="text-sm font-bold text-white">Rate: 18% on Platform Take Rate</div>
                <p className="text-xs text-[#91A09E]">
                  CGST (9%) + SGST (9%) or IGST (18%) levied strictly on platform commission revenues, never on gross client deposit.
                </p>
                <div className="text-[11px] font-mono text-white/[0.6]">Platform GSTIN: {platformSettings?.platformGstin || '07AAACG9928K1Z5'}</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-3">
                <span className="text-[10px] font-mono text-amber-300 uppercase font-bold">SECTION 194-O TDS WITHHOLDING</span>
                <div className="text-sm font-bold text-white">Rate: 1% on Gross Participant Credits</div>
                <p className="text-xs text-[#91A09E]">
                  Withheld at the time of credit to the freelancer ledger. Deposited monthly to the Indian Income Tax Department.
                </p>
                <div className="text-[11px] font-mono text-white/[0.6]">Platform PAN: {platformSettings?.platformPan || 'AAACG9928K'}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 8: INVOICES & STATEMENTS
            ======================================================== */}
        {activeTab === 'invoices' && (
          <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">System Invoices & Credit Notes</h2>
                <p className="text-xs text-[#91A09E]">Sequential invoice numbering (INV-2026-XXXX / CRN-2026-XXXX) with SAC 998311 compliance.</p>
              </div>
              <span className="font-mono text-[#73D8C4]">Total Issued: {invoicesList.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#071011] text-[10px] uppercase font-mono tracking-wider text-[#91A09E]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Taxable Amount</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {invoicesList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-[#73D8C4] font-medium">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 text-[#91A09E] font-mono">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 capitalize text-white">{inv.type.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 text-white font-medium">{inv.customer.name}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#91A09E]">${inv.subtotal.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">${inv.grandTotal.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/api/finance/invoices/${inv.id}?format=html`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg border border-white/[0.1] hover:border-[#73D8C4] text-[10px] font-mono text-[#73D8C4] uppercase"
                        >
                          Print PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 9: TAXONOMY & CATEGORIES
            ======================================================== */}
        {activeTab === 'categories' && (
          <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Ecosystem Categories & Subcategories ({categoriesList.length})</h2>
                <p className="text-xs text-[#91A09E]">Manage marketplace discovery taxonomy, trending flags, and subcategories.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoriesList.map(cat => (
                <div key={cat.id} className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{cat.name}</span>
                    <span className="text-[10px] font-mono text-[#73D8C4]">{cat.slug}</span>
                  </div>
                  <p className="text-[11px] text-[#91A09E] line-clamp-2">{cat.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(cat.subcategories || []).slice(0, 4).map((sub, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-white/[0.7]">
                        {sub}
                      </span>
                    ))}
                    {(cat.subcategories || []).length > 4 && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-[#73D8C4]">
                        +{(cat.subcategories || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 10: PROJECTS MODERATION
            ======================================================== */}
        {activeTab === 'projects' && (
          <div className="p-6 rounded-3xl bg-[#0B1719] border border-white/[0.08] space-y-4 text-xs animate-in fade-in duration-200">
            <h2 className="text-base font-bold text-white">Live Project Briefs Moderation</h2>

            <div className="space-y-3">
              {projectsList.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{p.title}</h3>
                    <p className="text-[#91A09E] text-[11px]">
                      By {p.clientName} &bull; Category: {p.category} &bull; Budget: ${p.budgetMin}-${p.budgetMax}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-white/[0.04] text-white font-medium">
                      {p.status}
                    </span>
                    <Link
                      href={`/projects/${p.id}`}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white"
                      title="View project"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
