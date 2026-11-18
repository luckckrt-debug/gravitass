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
  Sparkles
} from 'lucide-react';
import { 
  LedgerTransaction, 
  WithdrawalRequest, 
  FreelancerEarningsSummary,
  PayoutMethod
} from '@/types';

export default function EarningsLedgerView() {
  const [summary, setSummary] = useState<FreelancerEarningsSummary | null>(null);
  const [ledger, setLedger] = useState<LedgerTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'ledger' | 'withdrawals'>('ledger');

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

      const res = await fetch(`/api/ledger?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setLedger(data.ledger || []);
        setWithdrawals(data.withdrawals || []);
        if (data.settings?.minWithdrawalAmount) {
          setMinWithdrawal(data.settings.minWithdrawalAmount);
        }
      }
    } catch (e) {
      console.error('Failed to fetch ledger:', e);
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
    const url = `/api/ledger?export=${format}&status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank');
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amt = Number(withdrawAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }

    if (summary && amt > summary.availableBalance) {
      setWithdrawError(`Requested amount exceeds your verified available balance ($${summary.availableBalance.toLocaleString()}).`);
      return;
    }

    if (amt < minWithdrawal) {
      setWithdrawError(`Minimum withdrawal limit is $${minWithdrawal}.`);
      return;
    }

    if (payoutMethod === 'bank_transfer') {
      if (!accountNumber.trim() || accountNumber.length < 8) {
        setWithdrawError('Account number must be at least 8 digits.');
        return;
      }
      if (accountNumber !== confirmAccount) {
        setWithdrawError('Account numbers do not match.');
        return;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!ifscRegex.test(ifscCode.trim())) {
        setWithdrawError('Invalid IFSC code format (e.g. HDFC0001234).');
        return;
      }
    } else if (payoutMethod === 'upi') {
      if (!upiId.trim() || !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
        setWithdrawError('Invalid UPI Virtual Payment Address (e.g. name@okhdfcbank or user@upi).');
        return;
      }
    }

    setSubmittingWithdrawal(true);

    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          method: payoutMethod,
          payoutDetails: {
            accountHolderName: accountHolder,
            accountNumber: payoutMethod === 'bank_transfer' ? accountNumber : undefined,
            ifsc: payoutMethod === 'bank_transfer' ? ifscCode.toUpperCase() : undefined,
            bankName: payoutMethod === 'bank_transfer' ? bankName : undefined,
            upiId: payoutMethod === 'upi' ? upiId : undefined
          },
          idempotencyKey: `wth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWithdrawSuccess('Withdrawal request successfully queued! Amount has been reserved from available balance.');
        setWithdrawAmount('');
        fetchLedgerData();
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setWithdrawSuccess('');
        }, 2200);
      } else {
        setWithdrawError(data.error || 'Withdrawal submission failed.');
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
            <span>Cryptographic Financial Ledger & Escrow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#F4F5F3]">
            Earnings & Transaction Ledger
          </h2>
          <p className="text-xs text-[#91A09E] font-light">
            Verified net milestone payouts, automatic commission deduction, and Indian Banking (IMPS/NEFT/UPI) rails.
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
          FINTECH SUMMARY CARDS (6 METRICS DERIVED STRICTLY FROM DATABASE)
      ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
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
            <span>Gross minus fees</span>
          </span>
        </div>

        {/* Card 2: Available Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1719] to-[#041F1C] border border-[#73D8C4]/40 shadow-[0_0_20px_rgba(115,216,196,0.15)] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#73D8C4] font-semibold block">
              Available Now
            </span>
            <span className="w-2 h-2 rounded-full bg-[#73D8C4] shadow-[0_0_8px_#73D8C4] animate-pulse" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#73D8C4]">
            ${summary ? summary.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-[#A5E8DE] font-mono block">
            Ready for withdrawal
          </span>
        </div>

        {/* Card 3: Pending Approval Earnings */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#91A09E] block">
            Pending Approval
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
            ${summary ? summary.pendingApprovalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-[#91A09E] font-mono block">
            In client inspection
          </span>
        </div>

        {/* Card 4: Processing Withdrawals */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#91A09E] block">
            In Processing
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            ${summary ? summary.processingWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-cyan-400 font-mono block">
            Banking queue
          </span>
        </div>

        {/* Card 5: Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#91A09E] block">
            Total Withdrawn
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#F4F5F3]">
            ${summary ? summary.totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-[#91A09E] font-mono block">
            Settled to Bank/UPI
          </span>
        </div>

        {/* Card 6: Failed Payments */}
        <div className="p-5 rounded-2xl bg-[#0B1719]/60 border border-white/[0.08] backdrop-blur-md space-y-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#91A09E] block">
            Failed / Restored
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            ${summary ? summary.failedPayments.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <span className="text-[10px] text-rose-400/80 font-mono block">
            Restored to balance
          </span>
        </div>

      </div>

      {/* =========================================================================
          VIEW SWITCHER TABS & SEARCH/FILTER CONTROLS
      ========================================================================= */}
      <div className="space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === 'ledger'
                  ? 'bg-[#73D8C4] text-[#020303] font-semibold shadow-[0_0_15px_rgba(115,216,196,0.3)]'
                  : 'text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.04]'
              }`}
            >
              Transaction Ledger ({ledger.length})
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === 'withdrawals'
                  ? 'bg-[#73D8C4] text-[#020303] font-semibold shadow-[0_0_15px_rgba(115,216,196,0.3)]'
                  : 'text-[#91A09E] hover:text-[#F4F5F3] hover:bg-white/[0.04]'
              }`}
            >
              Payout Tracking ({withdrawals.length})
            </button>
          </div>

          {/* Search & Filter Form */}
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
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#071011]/80 border-b border-white/[0.08] text-[10px] uppercase font-mono tracking-wider text-[#91A09E]">
                    <tr>
                      <th className="py-4 px-6">Project / Description</th>
                      <th className="py-4 px-4">Client</th>
                      <th className="py-4 px-4 text-right">Gross Amount</th>
                      <th className="py-4 px-4 text-right">Platform Fee</th>
                      <th className="py-4 px-4 text-right">Net Earning</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6">Date & Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-light">
                    {ledger.map((item) => (
                      <tr 
                        key={item.id}
                        onClick={() => setSelectedTx(item)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-[#F4F5F3] group-hover:text-[#73D8C4] transition-colors">
                            {item.projectTitle}
                          </div>
                          <div className="text-[10px] font-mono text-[#91A09E] flex items-center gap-2 mt-0.5">
                            <span>ID: {item.id}</span>
                            {item.milestoneTitle && <span>• {item.milestoneTitle}</span>}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-[#F4F5F3] font-medium block">{item.clientName}</span>
                          <span className="text-[10px] font-mono text-[#91A09E]">Verified Hirer</span>
                        </td>

                        <td className="py-4 px-4 text-right font-mono text-[#F4F5F3]">
                          {item.grossAmount < 0 ? '-' : ''}${Math.abs(item.grossAmount).toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-right font-mono text-rose-300">
                          {item.platformFee > 0 ? `-$${item.platformFee.toFixed(2)}` : '$0.00'}
                          <span className="text-[9px] text-[#91A09E] block">({item.commissionPercentage}%)</span>
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-semibold">
                          <span className={item.netAmount >= 0 ? 'text-[#73D8C4]' : 'text-cyan-300'}>
                            {item.netAmount >= 0 ? '+' : '-'}${Math.abs(item.netAmount).toFixed(2)}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          {getStatusBadge(item.status)}
                        </td>

                        <td className="py-4 px-6 text-[#91A09E] font-mono text-[11px]">
                          <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                          <div className="text-[9px] text-[#91A09E]/70">{item.transactionReference}</div>
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
            TAB 2: WITHDRAWAL & PAYOUT STATUS TRACKING
        ========================================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="rounded-3xl bg-[#0B1719]/80 border border-white/[0.08] overflow-hidden backdrop-blur-xl">
            {withdrawals.length === 0 ? (
              <div className="p-16 text-center text-[#91A09E] space-y-3">
                <Clock className="w-10 h-10 text-[#73D8C4]/40 mx-auto" />
                <p className="text-sm font-medium text-[#F4F5F3]">No withdrawal requests queued</p>
                <p className="text-xs font-light">Use the "Withdraw Earnings" button above to request payouts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#071011]/80 border-b border-white/[0.08] text-[10px] uppercase font-mono tracking-wider text-[#91A09E]">
                    <tr>
                      <th className="py-4 px-6">Withdrawal ID</th>
                      <th className="py-4 px-4">Method & Destination</th>
                      <th className="py-4 px-4 text-right">Requested</th>
                      <th className="py-4 px-4 text-right">Fee</th>
                      <th className="py-4 px-4 text-right">Payable</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6">Payment Reference / UTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-light">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-6 font-mono text-[#F4F5F3]">
                          <span className="font-semibold">{w.id}</span>
                          <span className="text-[10px] text-[#91A09E] block">
                            {new Date(w.createdAt).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-[#F4F5F3] font-medium">
                            {w.method === 'upi' ? (
                              <Smartphone className="w-3.5 h-3.5 text-[#73D8C4]" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>{w.method === 'upi' ? 'UPI Instant' : 'Indian Bank (NEFT/IMPS)'}</span>
                          </div>
                          <span className="text-[11px] font-mono text-[#91A09E] block mt-0.5">
                            {w.payoutDetails.maskedUpi || w.payoutDetails.maskedAccount || 'Destination Verified'}
                            {w.payoutDetails.ifsc && ` • ${w.payoutDetails.ifsc}`}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right font-mono text-[#F4F5F3]">
                          ${w.amount.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-right font-mono text-gray-400">
                          ${w.fee.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-bold text-[#73D8C4]">
                          ${w.finalAmount.toFixed(2)}
                        </td>

                        <td className="py-4 px-4">
                          {getStatusBadge(w.status)}
                          {w.failureReason && (
                            <span className="text-[10px] text-rose-400 block mt-1">
                              {w.failureReason}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 font-mono text-xs text-[#A5E8DE]">
                          {w.paymentReference || (
                            <span className="text-gray-500 italic">Pending Bank Dispatch</span>
                          )}
                          <span className="text-[10px] text-gray-500 block">
                            Est: {w.estimatedProcessingTime}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL: WITHDRAW EARNINGS
      ========================================================================= */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.12] shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-xl font-serif text-[#F4F5F3]">Withdraw Available Earnings</h3>
                <p className="text-xs text-[#91A09E] font-light mt-0.5">
                  Transfer funds to your verified Indian bank account or UPI address.
                </p>
              </div>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Available Balance Header */}
            <div className="p-4 rounded-2xl bg-[#071011] border border-[#73D8C4]/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#91A09E] block tracking-wider">
                  Verified Available Balance
                </span>
                <span className="text-2xl font-bold font-mono text-[#73D8C4]">
                  ${summary ? summary.availableBalance.toFixed(2) : '0.00'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#73D8C4]/10 text-[#73D8C4] border border-[#73D8C4]/30">
                Min: ${minWithdrawal}
              </span>
            </div>

            {withdrawError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
              
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#F4F5F3] uppercase tracking-wider block">
                  Withdrawal Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min={minWithdrawal}
                    max={summary?.availableBalance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#071011] border border-white/[0.12] rounded-2xl pl-8 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#73D8C4]"
                    required
                  />
                </div>

                {/* Quick Amount Pills */}
                {summary && (
                  <div className="flex items-center gap-2 pt-1">
                    {[50, 100, 250].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(amt.toString())}
                        disabled={amt > summary.availableBalance}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-[#91A09E] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ${amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(summary.availableBalance.toString())}
                      className="px-2.5 py-1 rounded-lg bg-[#73D8C4]/10 border border-[#73D8C4]/30 text-[10px] font-mono text-[#73D8C4] hover:bg-[#73D8C4]/20"
                    >
                      All Available
                    </button>
                  </div>
                )}
              </div>

              {/* Payout Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#F4F5F3] uppercase tracking-wider block">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      payoutMethod === 'bank_transfer'
                        ? 'border-[#73D8C4] bg-[#73D8C4]/10 text-white'
                        : 'border-white/[0.08] bg-[#071011] text-[#91A09E] hover:text-white'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#73D8C4]" />
                    <div>
                      <div className="text-xs font-semibold">Indian Bank Account</div>
                      <div className="text-[10px] text-gray-400">IMPS / NEFT (24-48 hrs)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      payoutMethod === 'upi'
                        ? 'border-[#73D8C4] bg-[#73D8C4]/10 text-white'
                        : 'border-white/[0.08] bg-[#071011] text-[#91A09E] hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#73D8C4]" />
                    <div>
                      <div className="text-xs font-semibold">UPI Virtual Handle</div>
                      <div className="text-[10px] text-[#73D8C4]">Instant Payout</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payout Details Fields */}
              {payoutMethod === 'bank_transfer' ? (
                <div className="p-4 rounded-2xl bg-[#071011]/80 border border-white/[0.06] space-y-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#91A09E] block mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full bg-[#0B1719] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#73D8C4]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#91A09E] block mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                        className="w-full bg-[#0B1719] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#73D8C4]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#91A09E] block mb-1">
                        IFSC Code (11 Chars)
                      </label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0001234"
                        maxLength={11}
                        className="w-full bg-[#0B1719] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#73D8C4] uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#91A09E] block mb-1">
                        Account Number
                      </label>
                      <input
                        type="password"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                        className="w-full bg-[#0B1719] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#73D8C4]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#91A09E] block mb-1">
                        Confirm Account Number
                      </label>
                      <input
                        type="text"
                        value={confirmAccount}
                        onChange={(e) => setConfirmAccount(e.target.value)}
                        placeholder="Re-enter account number"
                        className="w-full bg-[#0B1719] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#73D8C4]"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#071011]/80 border border-white/[0.06] space-y-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#91A09E] block mb-1">
                      UPI ID / Virtual Payment Address
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                      placeholder="e.g. elena@okhdfcbank or 9876543210@upi"
                      className="w-full bg-[#0B1719] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#73D8C4]"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Instant settlements to verified UPI handles supported across Google Pay, PhonePe, Paytm, and BHIM.
                  </p>
                </div>
              )}

              {/* Fee & Final Settlement Breakdown */}
              <div className="border-t border-white/[0.08] pt-3 text-xs font-mono space-y-1.5 text-[#91A09E]">
                <div className="flex justify-between">
                  <span>Platform Payout Fee:</span>
                  <span className="text-emerald-400">$0.00 (Free)</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Processing Time:</span>
                  <span className="text-[#F4F5F3]">{payoutMethod === 'upi' ? 'Instant (15 mins)' : '24–48 Business Hours'}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#F4F5F3] pt-1 border-t border-white/[0.05]">
                  <span>Total Payable:</span>
                  <span className="text-[#73D8C4]">
                    ${withdrawAmount ? Number(withdrawAmount).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-white/[0.1] hover:bg-white/[0.04] text-xs text-[#91A09E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal}
                  className="px-6 py-2.5 rounded-2xl bg-[#73D8C4] hover:bg-[#87E5D3] text-[#020303] text-xs font-semibold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(115,216,196,0.35)] disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingWithdrawal ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Reserving Balance...</span>
                    </>
                  ) : (
                    <span>Confirm & Withdraw</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TRANSACTION RECEIPT DETAIL
      ========================================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0B1719] border border-white/[0.12] shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#73D8C4] block">
                  CRYPTOGRAPHIC LEDGER RECEIPT
                </span>
                <h3 className="text-xl font-serif text-[#F4F5F3] mt-0.5">
                  Transaction Audit Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#071011] border border-white/[0.06] text-center space-y-1">
              <span className="text-xs text-[#91A09E] font-mono uppercase">Net Amount Credited</span>
              <div className={`text-3xl font-bold font-mono ${selectedTx.netAmount >= 0 ? 'text-[#73D8C4]' : 'text-cyan-300'}`}>
                {selectedTx.netAmount >= 0 ? '+' : '-'}${Math.abs(selectedTx.netAmount).toFixed(2)}
              </div>
              <div className="pt-2">{getStatusBadge(selectedTx.status)}</div>
            </div>

            <div className="space-y-3 font-mono text-xs divide-y divide-white/[0.06]">
              <div className="flex justify-between pt-2">
                <span className="text-[#91A09E]">Ledger ID:</span>
                <span className="text-[#F4F5F3] font-semibold">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#91A09E]">Project Title:</span>
                <span className="text-[#F4F5F3] text-right truncate max-w-[200px]">{selectedTx.projectTitle}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#91A09E]">Client Name:</span>
                <span className="text-[#F4F5F3]">{selectedTx.clientName}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#91A09E]">Gross Milestone:</span>
                <span className="text-[#F4F5F3]">${Math.abs(selectedTx.grossAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#91A09E]">Platform Commission:</span>
                <span className="text-rose-400">-${selectedTx.platformFee.toFixed(2)} ({selectedTx.commissionPercentage}%)</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#91A09E]">Reference Hash:</span>
                <span className="text-[#A5E8DE]">{selectedTx.transactionReference}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#91A09E]">Timestamp:</span>
                <span className="text-[#91A09E]">{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-4">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono uppercase tracking-wider text-[#F4F5F3]"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
