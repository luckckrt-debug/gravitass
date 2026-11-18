import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = (user.role === 'admin' && searchParams.get('userId')) 
      ? searchParams.get('userId')! 
      : user.id;

    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const exportFormat = searchParams.get('export'); // 'csv' or 'json'

    // Compute verified fintech summary dynamically from database
    const summary = db.getFreelancerEarningsSummary(targetUserId);
    const settings = db.getPlatformSettings();

    // Fetch filtered ledger entries
    const ledger = db.getLedgerForFreelancer(targetUserId, {
      status,
      search,
      startDate,
      endDate
    });

    const withdrawals = db.getWithdrawalsForFreelancer(targetUserId);

    // Export Handler
    if (exportFormat === 'csv') {
      const headers = ['Ledger ID', 'Project Title', 'Client', 'Gross Amount ($)', 'Platform Fee ($)', 'Net Earnings ($)', 'Status', 'Reference', 'Date'];
      const rows = ledger.map(l => [
        l.id,
        `"${l.projectTitle.replace(/"/g, '""')}"`,
        `"${l.clientName.replace(/"/g, '""')}"`,
        l.grossAmount.toFixed(2),
        l.platformFee.toFixed(2),
        l.netAmount.toFixed(2),
        l.status.toUpperCase(),
        l.transactionReference,
        new Date(l.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="gravitass-ledger-${targetUserId}-${Date.now()}.csv"`
        }
      });
    }

    if (exportFormat === 'json') {
      return new NextResponse(JSON.stringify(ledger, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="gravitass-ledger-${targetUserId}-${Date.now()}.json"`
        }
      });
    }

    return NextResponse.json({
      summary,
      settings: {
        commissionPercentage: settings.commissionPercentage,
        minWithdrawalAmount: settings.minWithdrawalAmount
      },
      ledger,
      withdrawals,
      totalCount: ledger.length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
