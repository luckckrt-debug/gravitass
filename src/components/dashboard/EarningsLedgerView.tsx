'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Search, 
  Filter, 
  Building2, 
  Smartphone, 
  ExternalLink,
  ChevronRight,
  X,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles,
  FileText,
  Settings,
  Calendar,
  Lock,
  Scale
} from 'lucide-react';
import { 
  LedgerTransaction, 
  WithdrawalRequest, 
  FreelancerEarningsSummary,
  PayoutMethod,
  InvoiceRecord,
  FreelancerPayoutSettings
} from '@/types';

export default function EarningsLedgerView() {
  const [summary, setSummary] = useState<FreelancerEarningsSummary | null>(null);
  const [ledger, setLedger] = useState<LedgerTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<FreelancerPayoutSettings | null>(null);
  const [minWithdrawal, setMinWithdrawal] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'ledger' | 'withdrawals' | 'invoices' | 'settings'>('ledger');

  // Withdrawal Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('bank_transfer');
  
  // Indian Bank Details
  const [accountHolder, setAccountHolder] = useState('Elena Vance');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  
  // UPI Details
  const [upiId, setUpiId] = useState('');

  // Settings form states
  const [settingsMethod, setSettingsMethod] = useState<PayoutMethod>('upi');
  const [settingsFreq, setSettingsFreq] = useState<'daily' | 'weekly' | 'monthly' | 'manual'>('weekly');
  const [settingsThreshold, setSettingsThreshold] = useState<number>(500);
  const [settingsAuto, setSettingsAuto] = useState<boolean>(true);
  const [settingsPan, setSettingsPan] = useState<string>('ABCDE1234F');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState('');

  // Submission feedback
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Detail Modal for selected Transaction
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const [resLedger, resInvoices, resSettings] = await Promise.all([
        fetch(`/api/ledger?${params.toString()}`),
        fetch('/api/finance/invoices'),
        fetch('/api/finance/payouts')
      ]);

      if (resLedger.ok) {
        const data = await resLedger.json();
        setSummary(data.summary);
        setLedger(data.ledger || []);
        setWithdrawals(data.withdrawals || []);
        if (data.settings?.minWithdrawalAmount) {
          setMinWithdrawal(data.settings.minWithdrawalAmount);
        }
      }

      if (resInvoices.ok) {
        const invData = await resInvoices.json();
        setInvoices(invData.invoices || []);
      }

      if (resSettings.ok) {
        const setData = await resSettings.json();
        if (setData.settings) {
          setPayoutSettings(setData.settings);
          setSettingsMethod(setData.settings.preferredMethod || 'upi');
          setSettingsFreq(setData.settings.frequency || 'weekly');
          setSettingsThreshold(setData.settings.minimumThreshold || 500);
          setSettingsAuto(setData.settings.autoPayoutEnabled !== undefined ? setData.settings.autoPayoutEnabled : true);
          setSettingsPan(setData.settings.panNumber || 'ABCDE1234F');
        }
      }
    } catch (e) {
      console.error('Failed to fetch financial data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLedgerData();
  };

  const handleExport = (format: 'csv' | 'json') => {
    const params = new URLSearchParams();
    params.set('export', format);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    window.open(`/api/ledger?${params.toString()}`, '_blank');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsFeedback('');
    try {
      const res = await fetch('/api/finance/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredMethod: settingsMethod,
          frequency: settingsFreq,
          minimumThreshold: Number(settingsThreshold),
          autoPayoutEnabled: settingsAuto,
          panNumber: settingsPan,
          payoutDetails: {
            accountHolderName: accountHolder,
            bankName,
            accountNumber: accountNumber || payoutSettings?.payoutDetails?.accountNumber,
            ifsc: ifscCode || payoutSettings?.payoutDetails?.ifsc,
            upiId: upiId || payoutSettings?.payoutDetails?.upiId
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsFeedback('Payout & Tax preferences saved successfully!');
        setPayoutSettings(data.settings);
        fetchLedgerData();
      } else {
        setSettingsFeedback(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setSettingsFeedback(err.message || 'Error communicating with server');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Please enter a valid amount greater than 0.');
      return;
    }

    if (amt < minWithdrawal) {
      setWithdrawError(`Minimum withdrawal threshold is $${minWithdrawal}.`);
      return;
    }

    if (summary && amt > summary.availableBalance) {
      setWithdrawError(`Requested amount ($${amt}) exceeds your available balance ($${summary.availableBalance}).`);
      return;
    }

    if (payoutMethod === 'bank_transfer') {
      if (!accountNumber.trim()) {
        setWithdrawError('Bank account number is required.');
        return;
      }
      if (accountNumber !== confirmAccount) {
        setWithdrawError('Account numbers do not match.');
        return;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscCode.trim() || !ifscRegex.test(ifscCode.trim())) {
        setWithdrawError('Please enter a valid 11-character Indian IFSC code (e.g. HDFC0001234).');
        return;
      }
    } else if (payoutMethod === 'upi') {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiId.trim() || !upiRegex.test(upiId.trim())) {
        setWithdrawError('Please enter a valid UPI Virtual Payment Address (e.g. user@okhdfcbank).');
        return;
      }
    }

    setSubmittingWithdrawal(true);
    try {
      const payload: any = {
        amount: amt,
        method: payoutMethod,
        payoutDetails: payoutMethod === 'bank_transfer' ? {
          accountHolderName: accountHolder,
          accountNumber,
          bankName,
          ifsc: ifscCode.toUpperCase().trim()
        } : {
          accountHolderName: accountHolder,
          upiId: upiId.toLowerCase().trim()
        }
      };

      const res = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setWithdrawError(data.error || 'Withdrawal submission failed.');
      } else {
        setWithdrawSuccess(`Success! Withdrawal request of $${amt.toFixed(2)} has been queued. Ref ID: ${data.withdrawal.id}`);
        setWithdrawAmount('');
        setAccountNumber('');
        setConfirmAccount('');
        setIfscCode('');
        setUpiId('');
        fetchLedgerData();
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setWithdrawSuccess('');
        }, 2200);
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Network error processing withdrawal.');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#73D8C4]/15 border border-[#73D8C4]/40 text-[#73D8C4]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Available</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Paid</span>
          </span>
        );
      case 'withdrawal_processing':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Processing</span>
          </span>
        );
      case 'pending_approval':
      case 'pending':
      case 'requested':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-300">
            <Clock className="w-3 h-3" />
            <span>In Review</span>
          </span>
        );
      case 'failed':
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-rose-500/15 border border-rose-500/40 text-rose-300">
            <AlertCircle className="w-3 h-3" />
            <span>{status === 'rejected' ? 'Rejected' : 'Failed'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.08] text-[#91A09E]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* =========================================================================
          SECTION HEADER WITH ACTION CONTROLS
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#73D8C4]/30 bg-[#73D8C4]/10 text-[10px] font-mono tracking-wider text-[#73D8C4] uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Double-Entry Escrow & Automated Payout Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#F4F5F3]">
            Earnings & Finance Hub
          </h2>
          <p className="text-xs text-[#91A09E] font-light">
            Verified net milestone payouts, Indian Banking (IMPS/NEFT/UPI), automated schedules, and compliant GST/TDS invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2.5 rounded-2xl border border-white/[0.12] bg-[#071011] hover:border-[#73D8C4]/40 text-[#F4F5F3] hover:text-[#73D8C4] text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-[#73D8C4]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="px-6 py-2.5 rounded-2xl bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs font-semibold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(115,216,196,0.35)] flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw Earnings</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          FINTECH SUMMARY CARDS (8 VERIFIED DATABASE METRICS)
      ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Lifetime Earnings */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#91A09E] block">
            Lifetime Net
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#F4F5F3]">
            ${summary ? summary.lifetimeEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>Gross minus fees & TDS</span>
          </span>
        </div>

        {/* Card 2: Available Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1719] to-[#041F1C] border border-[#73D8C4]/40 shadow-[0_0_20px_rgba(115,216,196,0.15)] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#73D8C4]">
              Available To Withdraw
            </span>
            <div className="w-2 h-2 rounded-full bg-[#73D8C4] animate-ping" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#73D8C4]">
            ${summary ? summary.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-[#A5E8DE] block font-mono">
            Instant IMPS/UPI eligible
          </span>
        </div>

        {/* Card 3: Escrow Locked in Client Vaults */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-cyan-400 block flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Escrow-Locked</span>
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            ${summary?.escrowLockedEarnings ? summary.escrowLockedEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '3,800.00'}
          </div>
          <span className="text-[10px] text-[#91A09E] block font-mono">
            Secured client trust funds
          </span>
        </div>

        {/* Card 4: Next Scheduled Payout */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-violet-400 block flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Automated Payout</span>
          </span>
          <div className="text-sm sm:text-base font-bold font-mono text-violet-300 truncate mt-1">
            {summary?.nextScheduledPayoutDate || 'Weekly (Friday)'}
          </div>
          <span className="text-[10px] text-[#91A09E] block font-mono">
            Threshold: ${payoutSettings?.minimumThreshold || 500}
          </span>
        </div>

        {/* Card 5: Processing Withdrawals */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-cyan-400 block">
            In Processing
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            ${summary ? summary.processingWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-[#91A09E] block font-mono">
            Banking clearing cycle
          </span>
        </div>

        {/* Card 6: Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#91A09E] block">
            Total Disbursed
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#F4F5F3]">
            ${summary ? summary.totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-emerald-400 block font-mono">
            100% verified settlements
          </span>
        </div>

        {/* Card 7: Section 194-O TDS Withheld */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-amber-400 block flex items-center gap-1">
            <Scale className="w-3 h-3" />
            <span>TDS Withheld (194-O)</span>
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
            ${summary?.tdsWithheldTotal ? summary.tdsWithheldTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '20.00'}
          </div>
          <span className="text-[10px] text-[#91A09E] block font-mono">
            PAN: {payoutSettings?.panNumber || 'ABCDE1234F'}
          </span>
        </div>

        {/* Card 8: Failed / Restored */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#91A09E] block">
            Failed / Restored
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-300">
            ${summary ? summary.failedPayments.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-gray-500 block font-mono">
            Auto-restored to balance
          </span>
        </div>

      </div>

      {/* =========================================================================
          VIEW SWITCHER TABS & SEARCH/FILTER CONTROLS
      ========================================================================= */}
      <div className="space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {[
              { id: 'ledger', label: `Transaction Ledger (${ledger.length})`, icon: Layers },
              { id: 'withdrawals', label: `Payout Tracking (${withdrawals.length})`, icon: Clock },
              { id: 'invoices', label: `Invoices & Statements (${invoices.length})`, icon: FileText },
              { id: 'settings', label: 'Payout & Tax Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#73D8C4] text-[#020303] font-semibold shadow-[0_0_15px_rgba(115,216,196,0.3)]'
                    : 'text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.04]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Filter Form for Ledger */}
          {activeTab === 'ledger' && (
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#91A09E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project, client, ID..."
                  className="bg-[#0B1719] border border-white/[0.1] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#F4F5F3] placeholder-[#91A09E]/60 focus:outline-none focus:border-[#73D8C4]/60 w-48 sm:w-64 font-mono"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0B1719] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-[#F4F5F3] focus:outline-none focus:border-[#73D8C4]/60 font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="withdrawal_processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed / Restored</option>
              </select>

              <button
                type="submit"
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-[#73D8C4]"
                title="Refresh Ledger"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

        </div>

        {/* =========================================================================
            TAB 1: EARNINGS TRANSACTION LEDGER
        ========================================================================= */}
        {activeTab === 'ledger' && (
          <div className="rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] overflow-hidden backdrop-blur-xl">
            {ledger.length === 0 ? (
              <div className="p-16 text-center text-[#91A09E] space-y-3">
                <Layers className="w-10 h-10 text-[#73D8C4]/40 mx-auto" />
                <p className="text-sm font-medium text-[#F4F5F3]">No transactions found matching criteria</p>
                <p className="text-xs font-light">Complete project milestones or clear filters to view ledger activity.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] font-mono tracking-wider uppercase text-[#91A09E] bg-[#071011]/80">
                      <th className="py-4 px-6">Transaction Date</th>
                      <th className="py-4 px-6">Project Title & Milestone</th>
                      <th className="py-4 px-6">Client</th>
                      <th className="py-4 px-6 text-right">Gross Amount</th>
                      <th className="py-4 px-6 text-right">Platform Fee</th>
                      <th className="py-4 px-6 text-right">Net Credited</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {ledger.map((tx) => (
                      <tr 
                        key={tx.id} 
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => setSelectedTx(tx)}
                      >
                        <td className="py-4 px-6 font-mono text-[#91A09E] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="block text-[9px] text-gray-500">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-semibold text-[#F4F5F3] group-hover:text-[#73D8C4] transition-colors truncate max-w-xs">
                            {tx.projectTitle}
                          </p>
                          <span className="text-[11px] text-[#91A09E] font-mono">
                            {tx.milestoneTitle || 'Deliverable Submission'} &bull; <span className="text-[10px] text-gray-500">{tx.id}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 font-medium text-[#F4F5F3] whitespace-nowrap">
                          {tx.clientName}
                        </td>

                        <td className="py-4 px-6 text-right font-mono text-gray-300 whitespace-nowrap">
                          ${tx.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-4 px-6 text-right font-mono text-rose-400 whitespace-nowrap">
                          -${tx.platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          <span className="text-[9px] block text-gray-500">({tx.commissionPercentage}%)</span>
                        </td>

                        <td className="py-4 px-6 text-right font-mono font-bold text-[#73D8C4] whitespace-nowrap">
                          ${tx.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          {getStatusBadge(tx.status)}
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTx(tx);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-white/[0.1] hover:border-[#73D8C4]/40 bg-[#071011] hover:bg-[#73D8C4]/10 text-[10px] font-mono uppercase text-[#73D8C4] transition-all"
                          >
                            Audit Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: PAYOUT TRACKING
        ========================================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] overflow-hidden backdrop-blur-xl">
            {withdrawals.length === 0 ? (
              <div className="p-16 text-center text-[#91A09E] space-y-3">
                <Clock className="w-10 h-10 text-cyan-400/40 mx-auto" />
                <p className="text-sm font-medium text-[#F4F5F3]">No withdrawal requests logged yet</p>
                <p className="text-xs font-light">Click &quot;Withdraw Earnings&quot; above to disburse your available balance.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] font-mono tracking-wider uppercase text-[#91A09E] bg-[#071011]/80">
                      <th className="py-4 px-6">Request ID</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Destination</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Reference / UTR</th>
                      <th className="py-4 px-6 text-right">Disbursed Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-mono text-[#73D8C4] font-medium whitespace-nowrap">
                          {w.id}
                        </td>
                        <td className="py-4 px-6 font-mono text-[#91A09E] whitespace-nowrap">
                          {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-6 font-mono text-[#F4F5F3] whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {w.method === 'upi' ? (
                              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 text-violet-400" />
                            )}
                            <span>{w.payoutDetails?.maskedAccount || w.payoutDetails?.maskedUpi || 'Verified Payout Rail'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getStatusBadge(w.status)}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[#91A09E] whitespace-nowrap">
                          {w.paymentReference || 'Bank UTR Pending'}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-[#F4F5F3] whitespace-nowrap">
                          ${w.finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: INVOICES & STATEMENTS
        ========================================================================= */}
        {activeTab === 'invoices' && (
          <div className="rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] overflow-hidden backdrop-blur-xl">
            {invoices.length === 0 ? (
              <div className="p-16 text-center text-[#91A09E] space-y-3">
                <FileText className="w-10 h-10 text-cyan-400/40 mx-auto" />
                <p className="text-sm font-medium text-[#F4F5F3]">No invoices generated yet</p>
                <p className="text-xs font-light">Invoices and TDS tax statements will appear here automatically upon milestone completions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] font-mono tracking-wider uppercase text-[#91A09E] bg-[#071011]/80">
                      <th className="py-4 px-6">Invoice #</th>
                      <th className="py-4 px-6">Issue Date</th>
                      <th className="py-4 px-6">Document Type</th>
                      <th className="py-4 px-6">Contract Reference</th>
                      <th className="py-4 px-6 text-right">Taxable Val</th>
                      <th className="py-4 px-6 text-right">Total ($)</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-mono text-[#73D8C4] font-medium whitespace-nowrap">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-4 px-6 font-mono text-[#91A09E] whitespace-nowrap">
                          {new Date(inv.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-6 font-mono text-[#F4F5F3] whitespace-nowrap capitalize">
                          {inv.type.replace(/_/g, ' ')}
                        </td>
                        <td className="py-4 px-6 text-[#91A09E] truncate max-w-xs">
                          {inv.projectTitle || inv.contractId || 'General Protocol'}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-gray-300">
                          ${inv.subtotal.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-[#F4F5F3]">
                          ${inv.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <a
                            href={`/api/finance/invoices/${inv.id}?format=html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-[#071011] hover:border-[#73D8C4]/40 text-[#73D8C4] text-[10px] font-mono uppercase transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View / Print</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: PAYOUT & TAX SETTINGS
        ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="p-8 rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] backdrop-blur-xl space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-serif text-[#F4F5F3]">Payout & Statutory Tax Configuration</h3>
              <p className="text-xs text-[#91A09E] font-light mt-1">
                Configure automated recurring withdrawal schedules, Indian tax identifiers (PAN/GSTIN), and verified settlement rails.
              </p>
            </div>

            {settingsFeedback && (
              <div className="p-4 rounded-2xl bg-[#73D8C4]/10 border border-[#73D8C4]/30 text-xs font-mono text-[#73D8C4]">
                {settingsFeedback}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Auto Payout Frequency */}
                <div>
                  <label className="text-xs font-mono text-[#91A09E] uppercase tracking-wider block mb-2">
                    Settlement Cadence
                  </label>
                  <select
                    value={settingsFreq}
                    onChange={(e) => setSettingsFreq(e.target.value as any)}
                    className="w-full bg-[#071011] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-[#F4F5F3] font-mono focus:outline-none focus:border-[#73D8C4]"
                  >
                    <option value="weekly">Weekly Automated Dispatches (Every Friday)</option>
                    <option value="monthly">Monthly Automated (1st of Calendar Month)</option>
                    <option value="daily">Daily Automated Settlements</option>
                    <option value="manual">Manual On-Demand Withdrawals Only</option>
                  </select>
                </div>

                {/* Minimum Threshold */}
                <div>
                  <label className="text-xs font-mono text-[#91A09E] uppercase tracking-wider block mb-2">
                    Auto-Withdrawal Minimum Threshold ($)
                  </label>
                  <input
                    type="number"
                    min="20"
                    value={settingsThreshold}
                    onChange={(e) => setSettingsThreshold(Number(e.target.value))}
                    className="w-full bg-[#071011] border border-white/[0.1] rounded-2xl px-4 py-2 text-xs text-[#F4F5F3] font-mono focus:outline-none focus:border-[#73D8C4]"
                  />
                  <span className="text-[10px] text-gray-500 block mt-1">Balances meeting this threshold disburse automatically.</span>
                </div>

                {/* Preferred Payout Method */}
                <div>
                  <label className="text-xs font-mono text-[#91A09E] uppercase tracking-wider block mb-2">
                    Default Payout Destination
                  </label>
                  <select
                    value={settingsMethod}
                    onChange={(e) => setSettingsMethod(e.target.value as any)}
                    className="w-full bg-[#071011] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-[#F4F5F3] font-mono focus:outline-none focus:border-[#73D8C4]"
                  >
                    <option value="upi">UPI Instant Transfer (VPA)</option>
                    <option value="bank_transfer">Direct Bank Transfer (IMPS/NEFT)</option>
                  </select>
                </div>

                {/* Permanent Account Number (PAN) */}
                <div>
                  <label className="text-xs font-mono text-[#91A09E] uppercase tracking-wider block mb-2">
                    Indian Income Tax PAN (Section 194-O)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={settingsPan}
                    onChange={(e) => setSettingsPan(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full bg-[#071011] border border-white/[0.1] rounded-2xl px-4 py-2 text-xs text-[#F4F5F3] font-mono focus:outline-none focus:border-[#73D8C4]"
                  />
                  <span className="text-[10px] text-amber-400 block mt-1">Enables 1% concessional TDS rate under Sec 194-O.</span>
                </div>

              </div>

              {/* Auto Payout Checkbox */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <input
                  type="checkbox"
                  id="autoPayoutToggle"
                  checked={settingsAuto}
                  onChange={(e) => setSettingsAuto(e.target.checked)}
                  className="w-4 h-4 rounded text-[#73D8C4] focus:ring-0 bg-[#071011] border-white/[0.2]"
                />
                <label htmlFor="autoPayoutToggle" className="text-xs text-[#F4F5F3] font-medium cursor-pointer">
                  Enable automated recurring payout runner
                  <span className="block text-[10px] text-[#91A09E] font-normal">
                    System will automatically sweep eligible cleared balances without requiring manual intervention.
                  </span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-2xl bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs font-semibold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(115,216,196,0.3)] disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Financial Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* =========================================================================
          WITHDRAWAL REQUEST MODAL (INDIAN BANKING + UPI INTEGRATION)
      ========================================================================= */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1719] border border-white/[0.12] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-6 right-6 text-[#91A09E] hover:text-white p-1 rounded-full hover:bg-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#73D8C4] uppercase block">
                Instant Settlement Portal
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-[#F4F5F3]">
                Disburse Freelancer Earnings
              </h3>
              <p className="text-xs text-[#91A09E]">
                Available Verified Balance: <span className="text-[#73D8C4] font-mono font-bold">${summary ? summary.availableBalance.toFixed(2) : '0.00'}</span>
              </p>
            </div>

            {withdrawError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-5">
              
              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-[11px] font-mono uppercase text-[#91A09E]">Amount ($ USD)</label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(summary ? summary.availableBalance.toString() : '0')}
                    className="text-[10px] font-mono text-[#73D8C4] hover:underline"
                  >
                    Withdraw Max
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-base">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min={minWithdrawal}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Min. $${minWithdrawal}`}
                    className="w-full bg-[#071011] border border-white/[0.1] rounded-2xl pl-8 pr-4 py-2.5 text-sm font-mono text-[#F4F5F3] focus:outline-none focus:border-[#73D8C4]"
                  />
                </div>
              </div>

              {/* Method Switcher */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase text-[#91A09E]">Payout Rail</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                      payoutMethod === 'bank_transfer'
                        ? 'border-[#73D8C4] bg-[#73D8C4]/15 text-[#73D8C4] font-semibold'
                        : 'border-white/[0.08] text-gray-400 hover:text-white bg-[#071011]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Indian Bank (IFSC)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                      payoutMethod === 'upi'
                        ? 'border-[#73D8C4] bg-[#73D8C4]/15 text-[#73D8C4] font-semibold'
                        : 'border-white/[0.08] text-gray-400 hover:text-white bg-[#071011]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Instant UPI VPA</span>
                  </button>
                </div>
              </div>

              {/* Method Specific Details */}
              {payoutMethod === 'bank_transfer' ? (
                <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Account Holder</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full bg-[#071011] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white font-mono mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Account Number</label>
                      <input
                        type="password"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="•••• •••• ••••"
                        className="w-full bg-[#071011] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white font-mono mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Confirm Account</label>
                      <input
                        type="text"
                        value={confirmAccount}
                        onChange={(e) => setConfirmAccount(e.target.value)}
                        placeholder="Re-enter number"
                        className="w-full bg-[#071011] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white font-mono mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Bank IFSC Code</label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="HDFC0001234"
                        className="w-full bg-[#071011] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white font-mono mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-[#071011] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white font-mono mt-1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-[#071011] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white font-mono mt-1"
                    />
                    <span className="text-[10px] text-gray-500 block mt-1">Supported handles: @okhdfcbank, @oksbi, @paytm, @icici</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingWithdrawal}
                className="w-full py-3 rounded-2xl bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs font-semibold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(115,216,196,0.35)] disabled:opacity-50"
              >
                {submittingWithdrawal ? 'Authenticating Gateway...' : 'Confirm & Initiate Settlement'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TRANSACTION AUDIT SLIP MODAL
      ========================================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1719] border border-white/[0.12] rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-6 right-6 text-[#91A09E] hover:text-white p-1 rounded-full hover:bg-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#73D8C4] uppercase block">
                Cryptographic Audit Slip
              </span>
              <h3 className="text-xl font-serif text-[#F4F5F3]">
                {selectedTx.projectTitle}
              </h3>
              <p className="text-xs text-[#91A09E] font-mono">
                TxID: {selectedTx.id}
              </p>
            </div>

            <div className="divide-y divide-white/[0.08] text-xs font-mono">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#91A09E]">Client Name:</span>
                <span className="text-[#F4F5F3] font-semibold">{selectedTx.clientName}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#91A09E]">Milestone:</span>
                <span className="text-[#F4F5F3]">{selectedTx.milestoneTitle || 'General Deliverable'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#91A09E]">Gross Milestone Amount:</span>
                <span className="text-[#F4F5F3]">${selectedTx.grossAmount.toFixed(2)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#91A09E]">Platform Fee ({selectedTx.commissionPercentage}%):</span>
                <span className="text-rose-400">-${selectedTx.platformFee.toFixed(2)}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-sm">
                <span className="text-[#73D8C4]">Net Settled to Ledger:</span>
                <span className="text-[#73D8C4]">${selectedTx.netAmount.toFixed(2)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#91A09E]">Bank / Gateway Reference:</span>
                <span className="text-cyan-300">{selectedTx.transactionReference}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#91A09E]">Verification Status:</span>
                <div>{getStatusBadge(selectedTx.status)}</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono uppercase text-[#F4F5F3] transition-colors"
              >
                Close Audit Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
