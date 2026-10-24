import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import cloudinary from "../../../../lib/cloudinary";
import { requireAdminSession } from "../../../../lib/auth";

export async function DELETE(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const { id } = await params;

    // 1️⃣ Fetch question & options to get all image URLs
    const [questionRows] = await pool.query(
      "SELECT question_image FROM questions WHERE id = ?",
      [id]
    );

    if (questionRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    const questionImage = questionRows[0].question_image;

    const [optionRows] = await pool.query(
      "SELECT option_image FROM options WHERE question_id = ?",
      [id]
    );
    const optionImages = optionRows
      .map((r) => r.option_image)
      .filter((img) => !!img);

    // 2️⃣ Delete from database
    await pool.query("DELETE FROM answers WHERE question_id = ?", [id]);
    await pool.query("DELETE FROM options WHERE question_id = ?", [id]);
    await pool.query("DELETE FROM questions WHERE id = ?", [id]);

    // 3️⃣ Delete images from Cloudinary
    const deleteFromCloudinary = async (url) => {
      if (!url) return;
      try {
        const parts = url.split("/upload/")[1].split(".");
        const publicId = parts[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("⚠️ Cloudinary delete error:", err);
      }
    };

    if (questionImage) await deleteFromCloudinary(questionImage);
    for (const img of optionImages) {
      await deleteFromCloudinary(img);
    }

    return NextResponse.json(
      { success: true, message: "Question and all images deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /api/admin/questions/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
