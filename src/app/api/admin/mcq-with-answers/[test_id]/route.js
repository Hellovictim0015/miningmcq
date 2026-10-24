import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import cloudinary from "../../../../lib/cloudinary";
import { requireAdminSession } from "../../../../lib/auth";
import { normalizeType, parseMarks } from "../../../../lib/questionTypes";

// helper to upload file to Cloudinary
async function uploadToCloudinary(file, folder) {
  if (!file) return null;

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
}

// 🟩 GET — Fetch all questions (with options + answers) for a test_id
export async function GET(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const { test_id } = await params;

  if (!test_id) {
    return NextResponse.json(
      { success: false, message: "test_id is required" },
      { status: 400 }
    );
  }

  try {
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
        a.about_answer_img,
        a.answer_tolerance
      FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.test_id = ?
      ORDER BY q.id, o.id
      `,
      [test_id]
    );

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
                about_answer_img: row.about_answer_img,
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 🟥 DELETE — Delete all questions, options, answers for this test_id
export async function DELETE(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const { test_id } = await params;

  if (!test_id) {
    return NextResponse.json(
      { success: false, message: "test_id is required" },
      { status: 400 }
    );
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [questionRows] = await connection.query(
      "SELECT question_image FROM questions WHERE test_id = ?",
      [test_id]
    );

    await connection.query(
      "DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE test_id = ?)",
      [test_id]
    );
    await connection.query(
      "DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE test_id = ?)",
      [test_id]
    );
    const [result] = await connection.query("DELETE FROM questions WHERE test_id = ?", [test_id]);

    await connection.commit();

    for (const row of questionRows) {
      if (row.question_image) {
        try {
          const parts = row.question_image.split("/upload/")[1];
          const publicId = parts.split(".")[0].split("/").slice(1).join("/");
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("⚠️ Cloudinary delete error:", err.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.affectedRows} questions (and related data) successfully.`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// 🟦 PATCH — Update a single question + options + answer (test_id param is reused as question_id here)
export async function PATCH(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const formData = await req.formData();

    const question_id = formData.get("question_id");
    const question_text = formData.get("question_text");
    const question_image = formData.get("question_image");
    const correct_answer = formData.get("correct_answer");
    const about_answer = formData.get("about_answer");
    const about_answer_img = formData.get("about_answer_img");
    const question_type = normalizeType(formData.get("question_type"));
    const marks = parseMarks(formData.get("marks"), 1);
    const negative_marks = parseMarks(formData.get("negative_marks"), 0);
    const answer_tolerance = question_type === "NAT" ? parseMarks(formData.get("answer_tolerance"), 0) : 0;

    if (!question_id) {
      connection.release();
      return NextResponse.json(
        { success: false, message: "question_id is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Update question text & image
    if (question_image && question_image.size > 0) {
      const questionImageUrl = await uploadToCloudinary(question_image, "questions");
      await connection.query(
        "UPDATE questions SET question_text = ?, question_image = ? WHERE id = ?",
        [question_text, questionImageUrl, question_id]
      );
    } else {
      await connection.query(
        "UPDATE questions SET question_text = ? WHERE id = ?",
        [question_text, question_id]
      );
    }

    await connection.query(
      "UPDATE questions SET question_type = ?, marks = ?, negative_marks = ? WHERE id = ?",
      [question_type, marks, negative_marks, question_id]
    );

    // 2️⃣ Update answer (text + about + image)
    if (about_answer_img && about_answer_img.size > 0) {
      const aboutAnswerImgUrl = await uploadToCloudinary(about_answer_img, "answers");
      await connection.query(
        "UPDATE answers SET correct_answer = ?, about_answer = ?, about_answer_img = ?, answer_tolerance = ? WHERE question_id = ?",
        [correct_answer, about_answer, aboutAnswerImgUrl, answer_tolerance, question_id]
      );
    } else {
      await connection.query(
        "UPDATE answers SET correct_answer = ?, about_answer = ?, answer_tolerance = ? WHERE question_id = ?",
        [correct_answer, about_answer, answer_tolerance, question_id]
      );
    }

    // 3️⃣ Update options dynamically (NAT questions have no options)
    const optionKeys = question_type === "NAT"
      ? []
      : Array.from(formData.keys()).filter((k) => k.startsWith("option_text_"));

    const keptOptionIds = [];

    for (const key of optionKeys) {
      const index = key.split("_").pop();
      const optId = formData.get(`option_id_${index}`);
      const optText = formData.get(`option_text_${index}`);
      const optFile = formData.get(`option_image_${index}`);

      let optionImageUrl = null;
      if (optFile && optFile.size > 0) {
        optionImageUrl = await uploadToCloudinary(optFile, "options");
      }

      if (optId) {
        // Keep the existing image unless a new one was uploaded.
        if (optionImageUrl) {
          await connection.query(
            "UPDATE options SET option_text = ?, option_image = ? WHERE id = ? AND question_id = ?",
            [optText, optionImageUrl, optId, question_id]
          );
        } else {
          await connection.query(
            "UPDATE options SET option_text = ? WHERE id = ? AND question_id = ?",
            [optText, optId, question_id]
          );
        }
        keptOptionIds.push(Number(optId));
      } else if (optText || optionImageUrl) {
        const [ins] = await connection.query(
          "INSERT INTO options (question_id, option_text, option_image) VALUES (?, ?, ?)",
          [question_id, optText, optionImageUrl]
        );
        keptOptionIds.push(ins.insertId);
      }
    }

    // Remove options the admin deleted in the form (or all of them for NAT).
    if (keptOptionIds.length > 0) {
      await connection.query(
        "DELETE FROM options WHERE question_id = ? AND id NOT IN (?)",
        [question_id, keptOptionIds]
      );
    } else {
      await connection.query("DELETE FROM options WHERE question_id = ?", [question_id]);
    }

    await connection.commit();
    connection.release();

    return NextResponse.json({
      success: true,
      message: "Question, options, and answer updated successfully",
      question_id,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("PATCH /api/admin/mcq-with-answers error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
