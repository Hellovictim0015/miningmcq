import Razorpay from 'razorpay';
import db from './db';

export function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Records a Razorpay payment as a successful purchase, using the order's own
// notes (set server-side at creation time) for user/course/product_type.
// Shared by /api/payment/verify (browser callback) and /api/payment/webhook
// (Razorpay server callback), so a purchase is saved even if the browser
// never reaches verify.
//
// The checkout handler fires as soon as a payment is *authorized*; the order
// only flips to "paid" once it is *captured*, which can lag (or never happen
// if auto-capture is off). So look at the payment itself, and capture it here
// when it is still only authorized.
//
// Returns { ok: true, notes } or { ok: false, status, message }.
export async function recordPayment({ orderId, paymentId, expectedUserId }) {
  const razorpay = getRazorpay();

  const order = await razorpay.orders.fetch(orderId);
  const notes = order.notes || {};

  if (!notes.user_id || !notes.course_id || !notes.product_type) {
    return { ok: false, status: 400, message: 'Order is missing purchase details' };
  }
  if (expectedUserId !== undefined && String(notes.user_id) !== String(expectedUserId)) {
    return { ok: false, status: 403, message: 'Order does not match authenticated user' };
  }

  let payment = await razorpay.payments.fetch(paymentId);
  if (payment.order_id !== orderId) {
    return { ok: false, status: 400, message: 'Payment does not belong to this order' };
  }

  if (payment.status === 'authorized') {
    try {
      payment = await razorpay.payments.capture(paymentId, order.amount, order.currency);
    } catch (err) {
      // Auto-capture (or the webhook) may have captured it in the meantime.
      payment = await razorpay.payments.fetch(paymentId);
      if (payment.status !== 'captured') throw err;
    }
  }

  if (payment.status !== 'captured') {
    return { ok: false, status: 400, message: `Payment is ${payment.status}, not captured` };
  }

  // Idempotent: verify and the webhook can both arrive for the same payment.
  await db.query(
    `INSERT INTO payments (user_id, course_id, product_type, payment_status, payment_id)
     SELECT ?, ?, ?, 'success', ?
     FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM payments WHERE payment_id = ?)`,
    [notes.user_id, notes.course_id, notes.product_type, paymentId, paymentId]
  );

  return { ok: true, notes };
}
