import db from "../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit")) || 50));
    const offset = (page - 1) * limit;
    const category = searchParams.get("category");

    const whereClause = category ? "WHERE category_id = ?" : "";
    const queryParams = category ? [category, limit, offset] : [limit, offset];

    const [rows] = await db.query(
      `SELECT id, title, subject, price, pdf_url, category_id, created_at
       FROM study_materials
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      queryParams
    );

    const countParams = category ? [category] : [];
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM study_materials ${whereClause}`,
      countParams
    );

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Error fetching study materials:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
