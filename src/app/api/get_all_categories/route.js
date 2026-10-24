import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit")) || 50));
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      "SELECT id, name, image_url FROM categories ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM categories");

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
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
