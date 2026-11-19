import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

/**
 * Dispute & Arbitration API
 */

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let disputes = db.getDisputeRecords();

    if (user.role !== 'admin') {
      disputes = disputes.filter(d => d.clientId === user.id || d.freelancerId === user.id);
    }

    return NextResponse.json({
      success: true,
      disputes,
      count: disputes.length,
      openCount: disputes.filter(d => d.status === 'open' || d.status === 'under_review').length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching disputes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contractId, reason, description } = body;

    if (!contractId || !reason || !description) {
      return NextResponse.json({ error: 'Contract ID, reason, and description are required' }, { status: 400 });
    }

    const contract = db.getContractById(contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (user.id !== contract.clientId && user.id !== contract.freelancerId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only contractual parties or admin can open a dispute' }, { status: 403 });
    }

    const role = user.id === contract.clientId ? 'client' : 'freelancer';
    const result = db.openEscrowDispute({
      contractId,
      initiatorId: user.id,
      initiatorRole: role,
      reason,
      description
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute opened. Escrow funds have been locked under legal hold.',
      dispute: result.dispute
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error opening dispute' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Administrative authority required to arbitrate disputes' }, { status: 403 });
    }

    const body = await req.json();
    const { disputeId, resolution, notes, splitPercentageFreelancer } = body;

    if (!disputeId || !resolution) {
      return NextResponse.json({ error: 'Dispute ID and resolution are required' }, { status: 400 });
    }

    const result = db.resolveEscrowDispute({
      disputeId,
      resolution,
      notes,
      splitPercentageFreelancer: splitPercentageFreelancer ? Number(splitPercentageFreelancer) : undefined,
      adminId: user.id
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute resolved successfully with double-entry journal settlement.',
      dispute: result.dispute
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error resolving dispute' }, { status: 500 });
  }
}
