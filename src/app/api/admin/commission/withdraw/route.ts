import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = db.getAdminCommissionSummary();
    const ledger = db.getAdminCommissionLedger();
    const bankAccounts = db.getAdminBankAccounts();
    const withdrawals = db.getAdminWithdrawals();

    return NextResponse.json({
      success: true,
      summary,
      ledger,
      bankAccounts,
      withdrawals
    });
  } catch (error: any) {
    console.error('Error fetching admin commission finance:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch admin commission data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminUserId = 'user-admin-1', amountINR, bankAccountId } = body;

    if (!amountINR || typeof amountINR !== 'number' || amountINR <= 0) {
      return NextResponse.json({ success: false, error: 'Valid withdrawal amount in INR is required' }, { status: 400 });
    }

    if (!bankAccountId) {
      return NextResponse.json({ success: false, error: 'Admin corporate bank account must be selected' }, { status: 400 });
    }

    const result = db.withdrawAdminCommission(adminUserId, amountINR, bankAccountId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      record: result.record,
      summary: db.getAdminCommissionSummary(),
      message: `Corporate commission withdrawal of ₹${amountINR.toLocaleString()} processed successfully.`
    });
  } catch (error: any) {
    console.error('Error withdrawing admin commission:', error);
    return NextResponse.json({ success: false, error: error.message || 'Withdrawal processing failed' }, { status: 500 });
  }
}
