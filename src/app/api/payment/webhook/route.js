// app/api/payment/webhook/route.js
// Razorpay -> server callback. Saves the purchase even when the buyer's
// browser never reaches /api/payment/verify (tab closed, network drop,
// expired login). Configure in Razorpay Dashboard > Settings > Webhooks:
//   URL:    https://<your-domain>/api/payment/webhook
//   Secret: same value as RAZORPAY_WEBHOOK_SECRET
//   Events: payment.authorized, payment.captured, order.paid
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordPayment } from '../../../lib/payments';

export async function POST(req) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set; ignoring webhook');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // The signature is over the raw body, so read it as text before parsing.
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    const payment = event.payload?.payment?.entity;

    if (!payment?.id || !payment?.order_id) {
      // Not a payment event we care about; acknowledge so Razorpay doesn't retry.
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const result = await recordPayment({ orderId: payment.order_id, paymentId: payment.id });
    if (!result.ok) {
      console.error('Webhook payment not recorded:', payment.id, result.message);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // 500 makes Razorpay retry later, which is what we want for transient errors.
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
