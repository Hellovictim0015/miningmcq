import pool from "../../../lib/db";
import cloudinary from "../../../lib/cloudinary";
import { requireAdminSession } from "../../../lib/auth";
import { NextResponse } from "next/server";
import { normalizeType, parseMarks } from "../../../lib/questionTypes";

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

export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const formData = await req.formData();

    const test_id = formData.get("test_id");
    const question_text = formData.get("question_text");
    const question_image = formData.get("question_image");
    const correct_answer = formData.get("correct_answer");
    const about_answer = formData.get("about_answer");
    const about_answer_img = formData.get("about_answer_img");
    const question_type = normalizeType(formData.get("question_type"));
    const marks = parseMarks(formData.get("marks"), 1);
    const negative_marks = parseMarks(formData.get("negative_marks"), 0);
    const answer_tolerance = parseMarks(formData.get("answer_tolerance"), 0);

    // ✅ Upload question image (if provided)
    let questionImageUrl = null;
    if (question_image && question_image.size > 0) {
      questionImageUrl = await uploadToCloudinary(question_image, "questions");
    }

    // ✅ Insert question
    const [qRes] = await connection.query(
      "INSERT INTO questions (question_text, question_image, test_id, question_type, marks, negative_marks) VALUES (?, ?, ?, ?, ?, ?)",
      [question_text, questionImageUrl, test_id, question_type, marks, negative_marks]
    );
    const questionId = qRes.insertId;

    // ✅ Handle options dynamically (NAT questions have no options)
    const optionKeys = question_type === "NAT"
      ? []
      : Array.from(formData.keys()).filter((k) => k.startsWith("option_text_"));

    for (const key of optionKeys) {
      const index = key.split("_").pop();
      const optText = formData.get(`option_text_${index}`);
      const optFile = formData.get(`option_image_${index}`);

      let optionImageUrl = null;
      if (optFile && optFile.size > 0) {
        optionImageUrl = await uploadToCloudinary(optFile, "options");
      }

      if (optText || optionImageUrl) {
        await connection.query(
          "INSERT INTO options (question_id, option_text, option_image) VALUES (?, ?, ?)",
          [questionId, optText, optionImageUrl]
        );
      }
    }

    // ✅ Upload about_answer_img if provided
    let aboutAnswerImgUrl = null;
    if (about_answer_img && about_answer_img.size > 0) {
      aboutAnswerImgUrl = await uploadToCloudinary(about_answer_img, "answers");
    }

    // ✅ Insert correct answer with image
    await connection.query(
      "INSERT INTO answers (question_id, correct_answer, about_answer, about_answer_img, answer_time, answer_tolerance) VALUES (?, ?, ?, ?, NOW(), ?)",
      [questionId, correct_answer, about_answer, aboutAnswerImgUrl, question_type === "NAT" ? answer_tolerance : 0]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json(
      { message: "Question created successfully", id: questionId },
      { status: 201 }
    );
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("POST /api/admin/questions error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Bulk-update marks / negative marks for a set of questions.
// Body: { ids: number[], marks?: number, negative_marks?: number }
export async function PATCH(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const { ids, marks, negative_marks } = await req.json();
    const questionIds = Array.isArray(ids) ? ids.map(Number).filter(Boolean) : [];

    if (questionIds.length === 0) {
      return NextResponse.json({ success: false, message: "ids are required" }, { status: 400 });
    }

    const sets = [];
    const values = [];
    const parsedMarks = parseMarks(marks, null);
    const parsedNegative = parseMarks(negative_marks, null);
    if (parsedMarks !== null) {
      sets.push("marks = ?");
      values.push(parsedMarks);
    }
    if (parsedNegative !== null) {
      sets.push("negative_marks = ?");
      values.push(parsedNegative);
    }
    if (sets.length === 0) {
      return NextResponse.json(
        { success: false, message: "marks or negative_marks is required" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `UPDATE questions SET ${sets.join(", ")} WHERE id IN (?)`,
      [...values, questionIds]
    );

    return NextResponse.json({ success: true, updated: result.affectedRows });
  } catch (err) {
    console.error("PATCH /api/admin/questions error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
