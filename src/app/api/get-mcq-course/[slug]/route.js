// app/api/courses/[slug]/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db"; // default import

export async function GET(req, { params }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { success: false, message: "slug is required" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM courses WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching course by slug:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
