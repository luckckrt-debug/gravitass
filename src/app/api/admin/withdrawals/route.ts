import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { PayoutGatewayService } from '@/lib/payout-gateway';
import { WithdrawalStatus } from '@/types';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let withdrawals = db.getWithdrawals();
    if (status && status !== 'all') {
      withdrawals = withdrawals.filter(w => w.status === status);
    }

    return NextResponse.json({ withdrawals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { withdrawalId, action, failureReason, paymentReference } = await req.json();

    if (!withdrawalId || !action) {
      return NextResponse.json({ error: 'Withdrawal ID and action are required' }, { status: 400 });
    }

    const withdrawal = db.getWithdrawals().find(w => w.id === withdrawalId);
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    // Action 1: Dispatched through Gateway Payout Engine
    if (action === 'execute_payout') {
      // Call server-side payment gateway
      const gatewayRes = await PayoutGatewayService.executePayout(withdrawal);

      if (gatewayRes.success && gatewayRes.status === 'paid') {
        const updateRes = db.processWithdrawalStatus({
          withdrawalId,
          status: 'paid',
          paymentReference: gatewayRes.paymentReference
        });
        return NextResponse.json({
          withdrawal: updateRes.withdrawal,
          message: `Payout successfully dispatched via gateway. UTR: ${gatewayRes.paymentReference}`
        });
      } else {
        const updateRes = db.processWithdrawalStatus({
          withdrawalId,
          status: 'failed',
          failureReason: gatewayRes.failureReason || 'Gateway transaction declined'
        });
        return NextResponse.json({
          withdrawal: updateRes.withdrawal,
          error: `Gateway payout failed: ${gatewayRes.failureReason}. Reserved balance was automatically restored.`
        }, { status: 400 });
      }
    }

    // Action 2: Manual status transition (e.g. approved / rejected / paid / failed)
    const validStatuses: WithdrawalStatus[] = ['requested', 'under_review', 'approved', 'processing', 'paid', 'rejected', 'failed', 'reversed'];
    const targetStatus = action as WithdrawalStatus;

    if (!validStatuses.includes(targetStatus)) {
      return NextResponse.json({ error: `Invalid status action: ${action}` }, { status: 400 });
    }

    const result = db.processWithdrawalStatus({
      withdrawalId,
      status: targetStatus,
      paymentReference,
      failureReason
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      withdrawal: result.withdrawal,
      message: `Withdrawal status updated to ${targetStatus}.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
