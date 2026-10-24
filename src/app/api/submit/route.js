// app/api/submit/route.js
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { test_id, score } = await req.json();

    if (!test_id || score === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO results (user_id, test_id, score) VALUES (?, ?, ?)",
      [user.id, test_id, score]
    );

    return NextResponse.json({
      success: true,
      message: "Result saved successfully",
      insertedId: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting result:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
