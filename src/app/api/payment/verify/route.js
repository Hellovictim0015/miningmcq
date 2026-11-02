import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest } from '../../../lib/auth';
import { recordPayment } from '../../../lib/payments';

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Signature verification proves the payment happened, but not what it
    // was for. recordPayment trusts the order's own notes (set server-side at
    // creation time) for the course/user, never the client-supplied body.
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }

    const result = await recordPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      expectedUserId: user.id,
    });

    if (!result.ok) {
      console.error('Payment verification rejected:', razorpay_payment_id, result.message);
      return NextResponse.json({ success: false, message: result.message }, { status: result.status });
    }

    return NextResponse.json({ success: true, message: 'Payment verified and saved' }, { status: 200 });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
