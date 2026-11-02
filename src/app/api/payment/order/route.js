import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';
import { getRazorpay } from '../../../lib/payments';

const PRODUCT_TYPES = {
  mcq_course: { table: 'courses', priceColumn: 'course_price' },
  video_course: { table: 'videocourses', priceColumn: 'course_price' },
  study_material: { table: 'study_materials', priceColumn: 'price' },
};

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course_id, product_type } = await req.json();

    const productConfig = PRODUCT_TYPES[product_type];
    if (!course_id || !productConfig) {
      return NextResponse.json({ error: 'Valid course_id and product_type are required' }, { status: 400 });
    }

    // Price is looked up server-side so it can never be manipulated by the client.
    const [rows] = await db.query(
      `SELECT ${productConfig.priceColumn} AS price FROM ${productConfig.table} WHERE id = ?`,
      [course_id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // mysql2 returns DECIMAL as a string, and e.g. 149.99 * 100 is not an
    // integer in floating point; Razorpay rejects non-integer paise.
    const amountPaise = Math.round(Number(rows[0].price) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return NextResponse.json({ error: 'This item has no valid price set' }, { status: 400 });
    }

    const razorpay = getRazorpay();

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: 'receipt_order_' + Date.now(),
      // Bound to this specific user/course/price at creation time so verify
      // can't be tricked into unlocking a different course with this order.
      notes: {
        user_id: String(user.id),
        course_id: String(course_id),
        product_type,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}
