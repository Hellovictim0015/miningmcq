// app/api/tests/[course_id]/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db"; // default import matches lib/db.js

export async function GET(req, { params }) {
  const { course_id } = await params;

  if (!course_id) {
    return NextResponse.json(
      { success: false, message: "course_id is required" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM tests WHERE course_id = ?",
      [course_id]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching tests by course_id:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
