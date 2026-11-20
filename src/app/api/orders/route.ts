import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'freelancer' | 'client'
    const status = searchParams.get('status') as OrderStatus | null;
    const tab = searchParams.get('tab'); // 'new' | 'active' | 'submitted' | 'completed' | 'cancelled'

    let orders = db.getOrders({
      freelancerId: role === 'freelancer' && userId ? userId : undefined,
      clientId: role === 'client' && userId ? userId : undefined,
      status: status || undefined,
      tab: tab || undefined
    });

    if (userId && !role) {
      orders = orders.filter(o => o.freelancerId === userId || o.clientId === userId);
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
      counts: {
        new: db.getOrders({ freelancerId: userId || undefined, tab: 'new' }).length,
        active: db.getOrders({ freelancerId: userId || undefined, tab: 'active' }).length,
        submitted: db.getOrders({ freelancerId: userId || undefined, tab: 'submitted' }).length,
        completed: db.getOrders({ freelancerId: userId || undefined, tab: 'completed' }).length,
        cancelled: db.getOrders({ freelancerId: userId || undefined, tab: 'cancelled' }).length
      }
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.projectId && !body.projectTitle) {
      return NextResponse.json({ success: false, error: 'Project details are required' }, { status: 400 });
    }
    if (!body.freelancerId) {
      return NextResponse.json({ success: false, error: 'Target freelancerId is required' }, { status: 400 });
    }

    const order = db.createOrder(body);
    return NextResponse.json({
      success: true,
      order,
      message: `Order ${order.id} generated with payment secured in Escrow.`
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
