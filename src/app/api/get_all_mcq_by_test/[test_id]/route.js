// app/api/get_all_mcq_by_test/[test_id]/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";

export async function GET(req, { params }) {
  const { test_id } = await params;

  if (!test_id) {
    return NextResponse.json(
      { success: false, message: "test_id is required" },
      { status: 400 }
    );
  }

  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [testRows] = await db.query("SELECT course_id FROM tests WHERE id = ?", [test_id]);
    if (testRows.length === 0) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 });
    }

    const [payment] = await db.query(
      `SELECT id FROM payments
       WHERE user_id = ? AND course_id = ? AND product_type = 'mcq_course' AND payment_status = 'success'
       LIMIT 1`,
      [user.id, testRows[0].course_id]
    );

    if (payment.length === 0) {
      return NextResponse.json({ success: false, message: "Course not purchased" }, { status: 403 });
    }

    // Fetch questions with their options
    const [rows] = await db.query(
      `
      SELECT
        q.id AS question_id,
        q.question_text,
        q.question_image,
        o.id AS option_id,
        o.option_text,
        o.option_image
      FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      WHERE q.test_id = ?
      ORDER BY q.id, o.id
      `,
      [test_id]
    );

    // Group options under each question
    const questions = {};
    rows.forEach((row) => {
      if (!questions[row.question_id]) {
        questions[row.question_id] = {
          id: row.question_id,
          question_text: row.question_text,
          question_image: row.question_image,
          options: [],
        };
      }
      if (row.option_id) {
        questions[row.question_id].options.push({
          id: row.option_id,
          option_text: row.option_text,
          option_image: row.option_image,
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: Object.values(questions),
    });
  } catch (error) {
    console.error("Error fetching questions by test_id:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
