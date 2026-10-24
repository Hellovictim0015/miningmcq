import { NextResponse } from 'next/server';
import db from '../../lib/db';

// Despite the name (kept for backwards compatibility with existing frontend
// calls), this returns video courses from the `videocourses` table.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')) || 50));
    const offset = (page - 1) * limit;
    const category = searchParams.get('category');

    const whereClause = category ? 'WHERE c.category_id = ?' : '';
    const queryParams = category ? [category, limit, offset] : [limit, offset];

    const [rows] = await db.query(
      `SELECT
         c.id AS course_id,
         c.course_name,
         c.course_price,
         c.language,
         c.description,
         c.duration,
         c.img_url,
         c.video_url,
         c.slug,
         c.category_id,
         ROUND(AVG(cr.rating), 1) AS average_rating
       FROM videocourses c
       LEFT JOIN course_reviews cr ON c.id = cr.course_id
       ${whereClause}
       GROUP BY c.id
       ORDER BY c.id DESC
       LIMIT ? OFFSET ?`,
      queryParams
    );

    const courses = rows.map(course => ({
      ...course,
      average_rating: course.average_rating || 0,
    }));

    const countParams = category ? [category] : [];
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM videocourses c ${whereClause}`,
      countParams
    );

    return NextResponse.json({
      success: true,
      message: 'All video courses fetched successfully',
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch Courses Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch video courses',
      error: error.message,
    }, { status: 500 });
  }
}
