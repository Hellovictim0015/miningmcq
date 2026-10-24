import { NextResponse } from "next/server";
import db from "../../../lib/db"; // <-- Your MySQL connection (mysql2/promise)
import { requireAdmin } from "../../../lib/auth";

export async function POST(req) {
  try {
    const gate = requireAdmin(req);
    if (gate.error) return gate.error;

    const { course_id, test_name } = await req.json();

    // ✅ Validation
    if (!course_id || !test_name) {
      return NextResponse.json(
        { message: "course_id and test_name are required" },
        { status: 400 }
      );
    }

    // ✅ Insert into DB
    const [result] = await db.execute(
      "INSERT INTO tests (course_id, test_name) VALUES (?, ?)",
      [course_id, test_name]
    );

    return NextResponse.json(
      {
        message: "Test created successfully",
        test: {
          id: result.insertId,
          course_id,
          test_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create test error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
