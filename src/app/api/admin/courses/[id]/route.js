import pool from "../../../../lib/db";
import cloudinary from "../../../../lib/cloudinary";
import { requireAdminSession } from "../../../../lib/auth";
import { NextResponse } from "next/server";

// ---------------- GET by ID ----------------
export async function GET(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const { id } = await params;
    const [rows] = await pool.query("SELECT * FROM courses WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- UPDATE (PUT) ----------------
export async function PUT(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const { id } = await params;
    const formData = await req.formData();

    const course_name = formData.get("course_name");
    const slug = formData.get("slug");
    const course_price = formData.get("course_price");
    const language = formData.get("language");
    const description = formData.get("description");
    const duration = formData.get("duration");
    const totaltest = formData.get("totaltest");
    const category_id = formData.get("category_id") || null;
    const file = formData.get("img");

    let img_url = null;

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
      `UPDATE courses SET
        course_name = ?,
        slug = ?,
        course_price = ?,
        language = ?,
        description = ?,
        duration = ?,
        totaltest = ?,
        category_id = ?,
        img_url = COALESCE(?, img_url)
       WHERE id = ?`,
      [
        course_name || null,
        slug || null,
        course_price || null,
        language || null,
        description || null,
        duration || null,
        totaltest || null,
        category_id,
        img_url,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Course updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const { id } = await params;

    // 1️⃣ Get course record first (to access Cloudinary image URL)
    const [rows] = await pool.query("SELECT img_url FROM courses WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const imageUrl = rows[0].img_url;

    // 2️⃣ Delete the course record from MySQL
    const [result] = await pool.query("DELETE FROM courses WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 3️⃣ Delete image from Cloudinary if exists
    if (imageUrl) {
      try {
        const parts = imageUrl.split("/upload/")[1];
        const publicId = parts.split(".")[0].split("/").slice(1).join("/");

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("⚠️ Error deleting image from Cloudinary:", cloudErr);
      }
    }

    // 4️⃣ Success
    return NextResponse.json(
      { message: "Course and image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/admin/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
