import pool from "../../../lib/db";
import cloudinary from "../../../lib/cloudinary";
import { requireAdminSession } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const formData = await req.formData();

    const course_name = formData.get("course_name");
    const slug = formData.get("slug");
    const course_price = formData.get("course_price");
    const language = formData.get("language");
    const description = formData.get("description");
    const duration = formData.get("duration");
    const totaltest = formData.get("totaltest") || 0;
    const category_id = formData.get("category_id") || null;
    const file = formData.get("img"); // file input field (image)

    if (!course_name || !slug) {
      return NextResponse.json(
        { error: "course_name and slug are required" },
        { status: 400 }
      );
    }

    let img_url = null;

    // Upload image to Cloudinary if file exists
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "courses" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });
      img_url = uploadRes.secure_url;
    }

    const [result] = await pool.query(
      `INSERT INTO courses
      (course_name, slug, course_price, language, description, duration, totaltest, img_url, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_name,
        slug,
        course_price || null,
        language || null,
        description || null,
        duration || null,
        totaltest,
        img_url,
        category_id,
      ]
    );

    return NextResponse.json(
      { message: "Course created successfully", id: result.insertId, img_url },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/courses error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ---------------- GET ----------------
export async function GET(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const [rows] = await pool.query("SELECT * FROM courses ORDER BY id DESC");
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/courses error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
