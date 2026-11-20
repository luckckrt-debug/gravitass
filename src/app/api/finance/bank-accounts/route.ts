import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { PayoutGatewayService } from '@/lib/payout-gateway';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancerId') || 'user-freelancer-1';

    const bankAccounts = db.getBankAccounts(freelancerId);
    const upiAccounts = db.getUpiAccounts(freelancerId);

    return NextResponse.json({
      success: true,
      bankAccounts,
      upiAccounts
    });
  } catch (error: any) {
    console.error('Error fetching bank/UPI accounts:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { freelancerId = 'user-freelancer-1', type } = body;

    if (type === 'bank') {
      const { accountHolderName, accountNumber, ifsc, bankName, accountType = 'savings' } = body;

      if (!accountHolderName || !accountNumber || !ifsc || !bankName) {
        return NextResponse.json({ success: false, error: 'All bank fields (Name, Account Number, IFSC, Bank Name) are required' }, { status: 400 });
      }

      if (!PayoutGatewayService.validateIFSC(ifsc)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid IFSC Code. Must be 4 letters, 0, followed by 6 alphanumeric characters (e.g. HDFC0001234)'
        }, { status: 400 });
      }

      const cleanAcc = accountNumber.replace(/\s+/g, '');
      if (cleanAcc.length < 8 || cleanAcc.length > 20) {
        return NextResponse.json({ success: false, error: 'Bank account number must be between 8 and 20 digits' }, { status: 400 });
      }

      const newBank = db.addBankAccount(freelancerId, {
        accountHolderName,
        accountNumber: cleanAcc,
        ifsc,
        bankName,
        accountType
      });

      return NextResponse.json({
        success: true,
        bankAccount: newBank,
        message: 'Bank account verified and registered successfully.'
      }, { status: 201 });
    }

    if (type === 'upi') {
      const { upiId } = body;
      if (!upiId || !PayoutGatewayService.validateUPI(upiId)) {
        return NextResponse.json({ success: false, error: 'Invalid UPI ID handle (e.g. yourname@okhdfcbank)' }, { status: 400 });
      }

      const newUpi = db.addUpiAccount(freelancerId, upiId);
      return NextResponse.json({
        success: true,
        upiAccount: newUpi,
        message: 'UPI ID verified and registered successfully.'
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Type must be "bank" or "upi"' }, { status: 400 });
  } catch (error: any) {
    console.error('Error adding payout destination:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to add payout destination' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancerId') || 'user-freelancer-1';
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'bank' | 'upi'

    if (!id || !type) {
      return NextResponse.json({ success: false, error: 'Account ID and type are required' }, { status: 400 });
    }

    let deleted = false;
    if (type === 'bank') {
      deleted = db.deleteBankAccount(freelancerId, id);
    } else if (type === 'upi') {
      deleted = db.deleteUpiAccount(freelancerId, id);
    }

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Payout destination removed.' : 'Account not found.'
    });
  } catch (error: any) {
    console.error('Error removing payout destination:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to remove account' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { freelancerId = 'user-freelancer-1', id, type } = body;

    if (!id || !type) {
      return NextResponse.json({ success: false, error: 'Account ID and type are required' }, { status: 400 });
    }

    let updated = false;
    if (type === 'bank') {
      updated = db.setPrimaryBankAccount(freelancerId, id);
    } else if (type === 'upi') {
      updated = db.setPrimaryUpiAccount(freelancerId, id);
    }

    return NextResponse.json({
      success: updated,
      message: updated ? 'Primary payout destination updated.' : 'Account not found.'
    });
  } catch (error: any) {
    console.error('Error setting primary destination:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update' }, { status: 500 });
  }
}
