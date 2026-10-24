import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import db from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

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

    const amount = rows[0].price;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // in paise
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
