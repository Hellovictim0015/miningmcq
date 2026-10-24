import { NextResponse } from 'next/server';
import db from '../../lib/db';

// Despite the name (kept for backwards compatibility with existing frontend
// calls), this returns MCQ courses from the `courses` table.
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
        c.id,
        c.course_name,
        c.slug,
        c.course_price,
        c.language,
        c.totaltest,
        c.description,
        c.duration,
        c.img_url,
        c.category_id
      FROM courses c
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?`,
      queryParams
    );

    const countParams = category ? [category] : [];
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM courses c ${whereClause}`,
      countParams
    );

    return NextResponse.json({
      success: true,
      message: 'All courses fetched successfully',
      data: rows,
      total_courses: total,
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
      message: 'Failed to fetch courses',
      error: error.message,
    }, { status: 500 });
  }
}
