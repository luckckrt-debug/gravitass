import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = db.getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, userId, reason, progressPercentage, workNotes } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action parameter is required' }, { status: 400 });
    }

    if (action === 'accept') {
      const result = db.acceptOrder(params.id, userId || 'user-freelancer-1');
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        order: result.order,
        message: 'Order accepted successfully. Workspace unlocked!'
      });
    }

    if (action === 'decline') {
      const result = db.declineOrder(params.id, userId || 'user-freelancer-1', reason);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        order: result.order,
        message: 'Order declined.'
      });
    }

    if (action === 'update_progress') {
      const result = db.updateOrderProgress(params.id, progressPercentage ?? 0, workNotes);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        order: result.order,
        message: 'Progress updated successfully'
      });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing order action:', error);
    return NextResponse.json({ success: false, error: error.message || 'Action failed' }, { status: 500 });
  }
}
