import { NextResponse } from "next/server";
import db from "../../../lib/db";        // MySQL connection
import cloudinary from "../../../lib/cloudinary"; // Cloudinary config
import { requireAdmin } from "../../../lib/auth";

// ✅ Required for handling file uploads (multipart/form-data)
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const gate = requireAdmin(req);
    if (gate.error) return gate.error;

    // ✅ Parse multipart form data
    const formData = await req.formData();

    const course_name = formData.get("course_name");
    const course_price = formData.get("course_price");
    const language = formData.get("language") || null;
    const description = formData.get("description") || null;
    const duration = formData.get("duration") || null;
    const file = formData.get("img"); // 🔑 Must match "img" in Postman

    console.log("xxx",file)

    if (!course_name || !course_price) {
      return NextResponse.json(
        { message: "course_name and course_price are required" },
        { status: 400 }
      );
    }

    // ✅ Generate slug automatically
    const slug =
      course_name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now();

    // ✅ Upload image to Cloudinary
    let img_url = null;
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "courses" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      console.log("✅ Cloudinary Upload:", uploadResult);

      img_url = uploadResult.secure_url; // 🔑 Save this in DB
    }

    // ✅ Insert into MySQL
    const [result] = await db.query(
      `INSERT INTO courses (course_name, slug, course_price, language, description, duration, img_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course_name, slug, course_price, language, description, duration, img_url]
    );

    return NextResponse.json(
      {
        message: "Course created successfully",
        courseId: result.insertId,
        slug,
        img_url,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating course:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
