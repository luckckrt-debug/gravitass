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
    const { 
      commissionPercentage, 
      minWithdrawalAmount, 
      payoutGatewayMode,
      gstPercentage,
      tdsPercentage,
      autoPayoutFrequency,
      sacCode,
      legalBusinessName,
      legalAddress,
      platformGstin,
      platformPan,
      escrowReviewPeriodDays
    } = body;

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

    if (payoutGatewayMode) updates.payoutGatewayMode = payoutGatewayMode;
    if (gstPercentage !== undefined) updates.gstPercentage = Number(gstPercentage);
    if (tdsPercentage !== undefined) updates.tdsPercentage = Number(tdsPercentage);
    if (autoPayoutFrequency) updates.autoPayoutFrequency = autoPayoutFrequency;
    if (sacCode) updates.sacCode = sacCode;
    if (legalBusinessName) updates.legalBusinessName = legalBusinessName;
    if (legalAddress) updates.legalAddress = legalAddress;
    if (platformGstin) updates.platformGstin = platformGstin;
    if (platformPan) updates.platformPan = platformPan;
    if (escrowReviewPeriodDays !== undefined) updates.escrowReviewPeriodDays = Number(escrowReviewPeriodDays);

    const updated = db.updatePlatformSettings(updates);
    return NextResponse.json({ settings: updated, message: 'Platform financial settings updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
