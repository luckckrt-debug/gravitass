import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { PayoutMethod, PayoutDetails } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, payoutDetails, idempotencyKey } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Please enter a valid withdrawal amount greater than zero' }, { status: 400 });
    }

    const validMethods: PayoutMethod[] = ['bank_transfer', 'upi', 'stripe', 'paypal'];
    if (!method || !validMethods.includes(method)) {
      return NextResponse.json({ error: 'Supported payout methods: Indian Bank Account (IMPS/NEFT) or UPI' }, { status: 400 });
    }

    if (!payoutDetails) {
      return NextResponse.json({ error: 'Verified payout destination details are required' }, { status: 400 });
    }

    // Execute atomic server-side withdrawal request with strict balance reservation
    const result = db.requestWithdrawal({
      freelancerId: user.id,
      amount: Number(amount),
      method,
      payoutDetails: payoutDetails as PayoutDetails,
      idempotencyKey
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      withdrawal: result.withdrawal,
      message: 'Withdrawal request registered and amount reserved successfully from available balance.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
