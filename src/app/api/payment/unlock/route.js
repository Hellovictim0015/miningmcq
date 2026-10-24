// app/api/payment/unlock/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course_id, product_type } = await req.json();

    if (!course_id || !product_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT id FROM payments
       WHERE user_id = ?
         AND course_id = ?
         AND product_type = ?
         AND payment_status = 'success'
       LIMIT 1`,
      [user.id, course_id, product_type]
    );

    return NextResponse.json({ unlock: rows.length > 0 }, { status: 200 });

  } catch (error) {
    console.error('Unlock check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
