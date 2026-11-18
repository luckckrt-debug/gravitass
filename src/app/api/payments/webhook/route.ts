import { NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { PayoutGatewayService } from '@/lib/payout-gateway';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-gateway-signature') || '';

    // Verify webhook signature if in production
    if (process.env.NODE_ENV === 'production') {
      const isValid = PayoutGatewayService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { event, withdrawalId, paymentReference, failureReason } = payload;

    if (!withdrawalId) {
      return NextResponse.json({ error: 'Missing withdrawalId' }, { status: 400 });
    }

    // Process idempotent status updates from gateway
    if (event === 'payout.processed' || event === 'payout.success') {
      db.processWithdrawalStatus({
        withdrawalId,
        status: 'paid',
        paymentReference: paymentReference || `UTR-WEBHOOK-${Date.now().toString(36).toUpperCase()}`
      });
    } else if (event === 'payout.failed' || event === 'payout.rejected') {
      db.processWithdrawalStatus({
        withdrawalId,
        status: 'failed',
        failureReason: failureReason || 'Gateway bank decline'
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
