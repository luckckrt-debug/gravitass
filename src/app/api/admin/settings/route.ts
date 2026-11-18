import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const settings = db.getPlatformSettings();
    return NextResponse.json({ settings });
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

    const body = await req.json();
    const { commissionPercentage, minWithdrawalAmount, payoutGatewayMode } = body;

    const updates: any = {};
    if (commissionPercentage !== undefined) {
      const comm = Number(commissionPercentage);
      if (isNaN(comm) || comm < 0 || comm > 50) {
        return NextResponse.json({ error: 'Commission percentage must be between 0% and 50%' }, { status: 400 });
      }
      updates.commissionPercentage = comm;
    }

    if (minWithdrawalAmount !== undefined) {
      const minWth = Number(minWithdrawalAmount);
      if (isNaN(minWth) || minWth < 1) {
        return NextResponse.json({ error: 'Minimum withdrawal amount must be at least $1' }, { status: 400 });
      }
      updates.minWithdrawalAmount = minWth;
    }

    if (payoutGatewayMode) {
      updates.payoutGatewayMode = payoutGatewayMode;
    }

    const updated = db.updatePlatformSettings(updates);
    return NextResponse.json({ settings: updated, message: 'Platform financial settings updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
