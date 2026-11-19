import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

/**
 * Tax Management & Statutory Reporting API
 * Covers GST on platform fees, Section 194-O TDS on e-commerce participants
 */

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const financialYear = searchParams.get('fy') || '2025-2026';
    const month = searchParams.get('month') || undefined;

    const rules = db.getTaxRules();
    const summary = db.getTaxReportSummary(financialYear);
    
    // Non-admin can only see their own tax records
    const freelancerId = user.role !== 'admin' ? user.id : undefined;
    const transactions = db.getTaxTransactions({ financialYear, month, freelancerId });

    return NextResponse.json({
      success: true,
      financialYear,
      rules,
      summary,
      transactions,
      statutoryDetails: {
        panEntity: 'GRAVITASS TECHNOLOGIES PRIVATE LIMITED',
        panNumber: 'AAACG9928K',
        gstinNumber: '07AAACG9928K1Z5',
        sacCode: '998311',
        applicableTaxSections: [
          'Section 194-O Income Tax Act 1961 (TDS on E-commerce participant)',
          'Central Goods and Services Tax (CGST) Act 2017 - Intermediation SAC 998311'
        ]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching tax data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required to modify tax rules' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, type, ratePercentage, cgstPercentage, sgstPercentage, isEnabled } = body;

    if (!type || ratePercentage === undefined) {
      return NextResponse.json({ error: 'Tax type and rate percentage are required' }, { status: 400 });
    }

    const updated = db.updateTaxRule({
      id,
      name,
      type,
      ratePercentage: Number(ratePercentage),
      cgstPercentage: cgstPercentage !== undefined ? Number(cgstPercentage) : Number(ratePercentage) / 2,
      sgstPercentage: sgstPercentage !== undefined ? Number(sgstPercentage) : Number(ratePercentage) / 2,
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true
    });

    return NextResponse.json({
      success: true,
      message: 'Tax rule updated successfully',
      rule: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating tax rules' }, { status: 500 });
  }
}
