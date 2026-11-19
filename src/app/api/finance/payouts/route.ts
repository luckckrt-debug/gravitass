import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

/**
 * Payout Settings & Automated Scheduler API
 */

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetFreelancerId = (user.role === 'admin' && searchParams.get('freelancerId')) 
      ? searchParams.get('freelancerId')! 
      : user.id;

    const settings = db.getPayoutSettings(targetFreelancerId);
    const summary = db.getFreelancerEarningsSummary(targetFreelancerId);
    const withdrawals = db.getWithdrawalsForFreelancer(targetFreelancerId);

    return NextResponse.json({
      success: true,
      settings,
      summary,
      withdrawals
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching payout settings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const targetFreelancerId = (user.role === 'admin' && body.freelancerId) 
      ? body.freelancerId 
      : user.id;

    const updated = db.updatePayoutSettings(targetFreelancerId, {
      preferredMethod: body.preferredMethod,
      frequency: body.frequency,
      minimumThreshold: body.minimumThreshold !== undefined ? Number(body.minimumThreshold) : undefined,
      autoPayoutEnabled: body.autoPayoutEnabled !== undefined ? Boolean(body.autoPayoutEnabled) : undefined,
      payoutDetails: body.payoutDetails,
      panNumber: body.panNumber,
      gstin: body.gstin
    });

    return NextResponse.json({
      success: true,
      message: 'Payout preferences saved successfully',
      settings: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating payout preferences' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required to trigger scheduled payout runs' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const frequency = body.frequency as ('daily' | 'weekly' | 'monthly' | undefined);

    const result = await db.runAutomatedPayoutSchedule(frequency);

    return NextResponse.json({
      success: true,
      message: `Automated payout scheduler executed. Processed ${result.processed} balances, ${result.successCount} payouts completed successfully.`,
      result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Automated payout runner failed' }, { status: 500 });
  }
}
