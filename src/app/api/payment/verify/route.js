import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import db from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

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
    // was for. Trust the order's own notes (set server-side at creation
    // time) for the course/user/amount, never the client-supplied body.
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const notes = order.notes || {};

    if (String(notes.user_id) !== String(user.id) || !notes.course_id || !notes.product_type) {
      return NextResponse.json({ success: false, message: 'Order does not match authenticated user' }, { status: 403 });
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ success: false, message: 'Order is not marked as paid' }, { status: 400 });
    }

    // Avoid recording the same payment twice if verify is called more than once.
    const [existing] = await db.query(
      `SELECT id FROM payments WHERE payment_id = ? LIMIT 1`,
      [razorpay_payment_id]
    );

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO payments (user_id, course_id, product_type, payment_status, payment_id)
         VALUES (?, ?, ?, ?, ?)`,
        [notes.user_id, notes.course_id, notes.product_type, 'success', razorpay_payment_id]
      );
    }

    return NextResponse.json({ success: true, message: 'Payment verified and saved' }, { status: 200 });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
