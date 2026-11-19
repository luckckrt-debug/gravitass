import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

/**
 * Escrow & Payment Protection API
 * Handles funding, milestone releases, and refunds with double-entry accounting
 */

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get('contractId');

    let escrows = db.getEscrowAccounts();

    if (contractId) {
      escrows = escrows.filter(e => e.contractId === contractId);
    } else if (user.role !== 'admin') {
      if (user.activeRole === 'client') {
        escrows = escrows.filter(e => e.clientId === user.id);
      } else {
        escrows = escrows.filter(e => e.freelancerId === user.id);
      }
    }

    return NextResponse.json({
      success: true,
      escrows,
      summary: {
        totalFunded: escrows.reduce((s, e) => s + (e.fundedAmount || 0), 0),
        totalReleased: escrows.reduce((s, e) => s + (e.releasedAmount || 0), 0),
        totalRefunded: escrows.reduce((s, e) => s + (e.refundedAmount || 0), 0),
        activeInEscrow: escrows.reduce((s, e) => s + Math.max(0, (e.fundedAmount || 0) - (e.releasedAmount || 0) - (e.refundedAmount || 0)), 0),
        disputedCount: escrows.filter(e => e.isDisputed).length
      },
      recentJournalEntries: db.getJournalEntries(contractId ? { contractId } : undefined).slice(0, 50)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching escrow records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, contractId, milestoneId, amount, paymentReference, reason } = body;

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const contract = db.getContractById(contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // 1. ACTION: FUND ESCROW
    if (action === 'fund') {
      if (user.id !== contract.clientId && user.role !== 'admin') {
        return NextResponse.json({ error: 'Only the client or admin can fund project escrow' }, { status: 403 });
      }

      const fundAmount = amount ? Number(amount) : contract.totalAmount;
      if (fundAmount <= 0) {
        return NextResponse.json({ error: 'Funding amount must be positive' }, { status: 400 });
      }

      const result = db.fundProjectEscrow({
        contractId,
        amount: fundAmount,
        paymentReference: paymentReference || `PAY-GATEWAY-${Date.now().toString(36).toUpperCase()}`,
        milestoneId
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Escrow successfully funded with $${fundAmount.toLocaleString()}`,
        escrow: result.escrow,
        invoice: result.invoice
      });
    }

    // 2. ACTION: RELEASE MILESTONE
    if (action === 'release') {
      if (user.id !== contract.clientId && user.role !== 'admin') {
        return NextResponse.json({ error: 'Only the client or admin can authorize milestone releases' }, { status: 403 });
      }

      const targetMilestoneId = milestoneId || contract.milestones[0]?.id || 'milestone-1';
      const result = db.releaseMilestoneEscrow({
        contractId,
        milestoneId: targetMilestoneId,
        approvedBy: user.id
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Milestone released successfully to freelancer available ledger balance!',
        escrow: result.escrow,
        ledger: result.ledger,
        invoice: result.invoice
      });
    }

    // 3. ACTION: REFUND ESCROW
    if (action === 'refund') {
      if (user.role !== 'admin' && user.id !== contract.clientId) {
        return NextResponse.json({ error: 'Unauthorized to trigger escrow refund' }, { status: 403 });
      }

      const refundAmount = Number(amount);
      if (!refundAmount || refundAmount <= 0) {
        return NextResponse.json({ error: 'Valid refund amount is required' }, { status: 400 });
      }

      const result = db.refundEscrow({
        contractId,
        amount: refundAmount,
        reason: reason || 'Contract cancelled by mutual consent',
        approvedBy: user.id
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Escrow refunded successfully. Credit Note issued: ${result.refundCreditNote?.invoiceNumber}`,
        creditNote: result.refundCreditNote
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Escrow operation failed' }, { status: 500 });
  }
}
