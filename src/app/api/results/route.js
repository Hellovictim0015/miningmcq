// app/api/results/route.js
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";

// POST /api/results
export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { test_id, score } = body;

    if (!test_id || score === undefined) {
      return NextResponse.json(
        { success: false, message: "test_id and score are required" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO results (user_id, test_id, score) VALUES (?, ?, ?)`,
      [user.id, test_id, score]
    );

    return NextResponse.json({
      success: true,
      message: "Result saved successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
