import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ success: true, data: { courses: [], videos: [], materials: [] } });
    }

    const like = `%${q}%`;

    const [courses] = await db.query(
      `SELECT id, course_name, slug, course_price, language, img_url
       FROM courses
       WHERE course_name LIKE ? OR description LIKE ?
       ORDER BY id DESC LIMIT 20`,
      [like, like]
    );

    const [videos] = await db.query(
      `SELECT id, course_name, slug, course_price, language, img_url
       FROM videocourses
       WHERE course_name LIKE ? OR description LIKE ?
       ORDER BY id DESC LIMIT 20`,
      [like, like]
    );

    const [materials] = await db.query(
      `SELECT id, title, subject, price
       FROM study_materials
       WHERE title LIKE ? OR subject LIKE ?
       ORDER BY id DESC LIMIT 20`,
      [like, like]
    );

    return NextResponse.json({
      success: true,
      data: { courses, videos, materials },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
