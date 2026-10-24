// app/api/mcqtests/[test_id]/questions/route.js
import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import { getUserFromRequest } from "../../../../lib/auth";

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

    // 1️⃣ Fetch all questions for this test
    const [questions] = await db.query(
      "SELECT * FROM questions WHERE test_id = ?",
      [test_id]
    );

    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No questions found for this test" },
        { status: 404 }
      );
    }

    // 2️⃣ Fetch options for all questions
    const questionIds = questions.map(q => q.id);
    const [options] = await db.query(
      `SELECT * FROM options WHERE question_id IN (${questionIds.map(() => "?").join(",")})`,
      questionIds
    );

    // 3️⃣ Fetch answers for all questions
    const [answers] = await db.query(
      `SELECT * FROM answers WHERE question_id IN (${questionIds.map(() => "?").join(",")})`,
      questionIds
    );

    // 4️⃣ Combine data
    const result = questions.map(q => ({
      ...q,
      options: options.filter(o => o.question_id === q.id),
      answer: answers.find(a => a.question_id === q.id) || null
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching MCQs:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
