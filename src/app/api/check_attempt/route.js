// app/api/check_attempt/route.js
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { test_id } = await req.json();

    if (!test_id) {
      return NextResponse.json({ success: false, message: "Missing test_id" }, { status: 400 });
    }

    // Count how many times user attempted this test
    const [rows] = await db.execute(
      "SELECT * FROM results WHERE user_id = ? AND test_id = ?",
      [user.id, test_id]
    );

    const total_attempts = rows.length;

    if (total_attempts > 0) {
      return NextResponse.json({
        success: true,
        attempted: true,
        score: rows[0].score,
        total_attempts,
        message: "User has already attempted this test",
      });
    } else {
      return NextResponse.json({
        success: true,
        attempted: false,
        total_attempts: 0,
        message: "User can attempt this test",
      });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
