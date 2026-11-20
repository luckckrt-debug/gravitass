import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { freelancerId = 'user-freelancer-1', amountINR, destinationId, method } = body;

    if (!amountINR || typeof amountINR !== 'number' || amountINR <= 0) {
      return NextResponse.json({ success: false, error: 'Valid withdrawal amount in INR is required' }, { status: 400 });
    }

    if (!destinationId) {
      return NextResponse.json({ success: false, error: 'A verified Bank Account or UPI destination must be selected' }, { status: 400 });
    }

    if (method !== 'bank' && method !== 'upi') {
      return NextResponse.json({ success: false, error: 'Payout method must be "bank" or "upi"' }, { status: 400 });
    }

    const result = await db.executeInstantWithdrawal(freelancerId, amountINR, destinationId, method);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      withdrawal: result.withdrawal,
      payoutResult: result.payoutResult,
      message: `Instant withdrawal of ₹${amountINR.toLocaleString()} initiated via ${method === 'upi' ? 'UPI' : 'Bank IMPS'}. Reference: ${result.payoutResult?.paymentReference || result.withdrawal?.id}`
    });
  } catch (error: any) {
    console.error('Error executing instant withdrawal:', error);
    return NextResponse.json({ success: false, error: error.message || 'Instant withdrawal failed' }, { status: 500 });
  }
}
