import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';
import { WithdrawalRequest } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, accountDetails } = await req.json();

    if (!amount || amount <= 0 || !method || !accountDetails) {
      return NextResponse.json({ error: 'Valid amount, payout method, and account details are required' }, { status: 400 });
    }

    const freelancer = db.getFreelancerById(user.id);
    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 });
    }

    const withdrawal: WithdrawalRequest = {
      id: `wth-${Date.now()}`,
      freelancerId: user.id,
      amount: Number(amount),
      method,
      accountDetails,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.addWithdrawal(withdrawal);

    db.addTransaction({
      id: `tx-w-${Date.now()}`,
      userId: user.id,
      type: 'withdrawal',
      amount: -Number(amount),
      status: 'pending',
      description: `Withdrawal via ${method} (${accountDetails})`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ withdrawal, message: 'Withdrawal request queued successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
