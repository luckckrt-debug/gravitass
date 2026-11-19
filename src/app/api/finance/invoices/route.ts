import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

/**
 * Invoices & Credit Notes API
 */

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get('contractId') || undefined;
    const type = searchParams.get('type') || undefined;

    let invoices = db.getInvoices({ contractId, type });

    // Non-admin users only see their own invoices
    if (user.role !== 'admin') {
      invoices = invoices.filter(inv => {
        const isClient = inv.customer.email === user.email || inv.customer.name === user.name;
        const isFreelancer = inv.customer.email === user.email || inv.supplier.email === user.email;
        return isClient || isFreelancer;
      });
    }

    return NextResponse.json({
      success: true,
      invoices,
      totalCount: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching invoices' }, { status: 500 });
  }
}
