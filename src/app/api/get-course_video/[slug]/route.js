// app/api/get-course_video/[slug]/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM videocourses WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    const course = rows[0];

    // The video itself is premium content — only include it in the
    // response for users who have actually paid for this course.
    let purchased = false;
    const user = getUserFromRequest(request);
    if (user) {
      const [payment] = await db.query(
        `SELECT id FROM payments
         WHERE user_id = ? AND course_id = ? AND product_type = 'video_course' AND payment_status = 'success'
         LIMIT 1`,
        [user.id, course.id]
      );
      purchased = payment.length > 0;
    }

    if (!purchased) {
      course.video_url = null;
    }

    return NextResponse.json({
      success: true,
      message: 'Course fetched successfully',
      data: course,
      purchased,
    });
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
