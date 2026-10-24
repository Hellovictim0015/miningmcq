// app/api/get_mcqwithanswe/[test_id]/route.js
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

    // Fetch questions with their options + answers
    const [rows] = await db.query(
      `
      SELECT
        q.id AS question_id,
        q.question_text,
        q.question_image,
        q.question_type,
        q.marks,
        q.negative_marks,
        o.id AS option_id,
        o.option_text,
        o.option_image,
        a.id AS answer_id,
        a.correct_answer,
        a.about_answer,
        a.answer_time,
        a.answer_tolerance
      FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.test_id = ?
      ORDER BY q.id, o.id
      `,
      [test_id]
    );

    // Group options + answer under each question
    const questions = {};
    rows.forEach((row) => {
      if (!questions[row.question_id]) {
        questions[row.question_id] = {
          id: row.question_id,
          question_text: row.question_text,
          question_image: row.question_image,
          question_type: row.question_type,
          marks: Number(row.marks),
          negative_marks: Number(row.negative_marks),
          options: [],
          answer: row.answer_id
            ? {
                id: row.answer_id,
                correct_answer: row.correct_answer,
                about_answer: row.about_answer,
                answer_time: row.answer_time,
                answer_tolerance: Number(row.answer_tolerance),
              }
            : null,
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
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
