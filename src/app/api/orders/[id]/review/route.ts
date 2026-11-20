import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, userId, reason } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Review action (approve or request_revision) is required' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = db.clientApproveWork(params.id, userId || 'user-client-1');
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        order: result.order,
        commissionEntry: result.commissionEntry,
        message: 'Deliverables approved! Escrow payment credited to freelancer ledger in INR (₹) and platform commission recognized.'
      });
    }

    if (action === 'request_revision') {
      if (!reason || !reason.trim()) {
        return NextResponse.json({ success: false, error: 'Specific revision reason is mandatory' }, { status: 400 });
      }
      const result = db.clientRequestRevision(params.id, userId || 'user-client-1', reason.trim());
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        order: result.order,
        revision: result.revision,
        message: 'Revision requested. Freelancer has been notified with the feedback.'
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error reviewing order deliverables:', error);
    return NextResponse.json({ success: false, error: error.message || 'Review action failed' }, { status: 500 });
  }
}
