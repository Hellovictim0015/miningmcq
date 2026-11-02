// app/api/results/route.js
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";
import { marksForAnswer, totalMarks, round2 } from "../../lib/questionTypes";

const MAX_ATTEMPTS = 3;

// POST /api/results  { test_id, answers: [{ question_id, answer }] }
// Scores the submission on the server against the stored answers (the client
// never receives them before submitting), saves the result, and returns the
// answers so the results screen can show what was right/wrong.
export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { test_id, answers } = await req.json();

    if (!test_id || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, message: "test_id and answers are required" },
        { status: 400 }
      );
    }

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

    const [[{ attempts }]] = await db.query(
      "SELECT COUNT(*) AS attempts FROM results WHERE user_id = ? AND test_id = ?",
      [user.id, test_id]
    );
    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, message: `Maximum ${MAX_ATTEMPTS} attempts reached for this test` },
        { status: 403 }
      );
    }

    const [rows] = await db.query(
      `SELECT q.id, q.question_type, q.marks, q.negative_marks,
              a.id AS answer_id, a.correct_answer, a.about_answer, a.answer_time, a.answer_tolerance
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id
       WHERE q.test_id = ?`,
      [test_id]
    );

    const questions = rows.map((row) => ({
      id: row.id,
      question_type: row.question_type,
      marks: Number(row.marks),
      negative_marks: Number(row.negative_marks),
      answer: row.answer_id
        ? {
            id: row.answer_id,
            correct_answer: row.correct_answer,
            about_answer: row.about_answer,
            answer_time: row.answer_time,
            answer_tolerance: Number(row.answer_tolerance),
          }
        : null,
    }));

    // Only accept answers for this test's questions, in the shapes the
    // scoring helpers expect (string, or array of strings for MSQ).
    const given = {};
    for (const item of answers) {
      const value = item?.answer;
      if (typeof value === "string" || (Array.isArray(value) && value.every((v) => typeof v === "string"))) {
        given[item.question_id] = value;
      }
    }

    const obtained = round2(questions.reduce((sum, q) => sum + marksForAnswer(q, given[q.id]), 0));
    const maxMarks = totalMarks(questions);
    const score = maxMarks > 0 ? Math.round((obtained / maxMarks) * 100) : 0;

    const [result] = await db.query(
      `INSERT INTO results (user_id, test_id, score) VALUES (?, ?, ?)`,
      [user.id, test_id, score]
    );

    return NextResponse.json({
      success: true,
      message: "Result saved successfully",
      id: result.insertId,
      score,
      marks_obtained: obtained,
      answers: Object.fromEntries(questions.map((q) => [q.id, q.answer])),
    });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
