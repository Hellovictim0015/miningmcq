import { NextResponse } from "next/server";
import cloudinary from "../../lib/cloudinary";
import db from "../../lib/db"; // <-- your mysql2/promise connection
import { requireAdmin } from "../../lib/auth";

export async function POST(req) {
  try {
    const gate = requireAdmin(req);
    if (gate.error) return gate.error;

    const formData = await req.formData();

    const question_text = formData.get("question_text");
    const test_id = formData.get("test_id");
    const file = formData.get("question_image"); // file object

    let imageUrl = null;

    if (file && file.name) {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadRes = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "questions" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      imageUrl = uploadRes.secure_url;
    }

    // Insert into DB
    const [result] = await db.query(
      "INSERT INTO questions (question_text, question_image, test_id) VALUES (?, ?, ?)",
      [question_text, imageUrl, test_id]
    );

    return NextResponse.json({
      success: true,
      message: "Question created successfully",
      questionId: result.insertId,
      imageUrl,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, message: "Error creating question" },
      { status: 500 }
    );
  }
}
