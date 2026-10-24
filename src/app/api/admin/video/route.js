import pool from "../../../lib/db";
import cloudinary from "../../../lib/cloudinary";
import { requireAdminSession } from "../../../lib/auth";
import { NextResponse } from "next/server";

// Helper to upload file to Cloudinary
async function uploadToCloudinary(file, folder) {
  if (!file) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "auto", folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
}

// Helper to delete Cloudinary file by URL
async function deleteFromCloudinary(url) {
  if (!url) return;
  try {
    const parts = url.split("/");
    const publicIdWithExt = parts.slice(-2).join("/");
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
}

// ---------------- POST API: Create Video Course ----------------
export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const formData = await req.formData();
    const course_name = formData.get("course_name");
    const course_price = formData.get("course_price");
    const language = formData.get("language");
    const description = formData.get("description");
    const duration = formData.get("duration");
    const slug = formData.get("slug");
    const category_id = formData.get("category_id") || null;

    const img_file = formData.get("img_url");
    const img_url = img_file ? await uploadToCloudinary(img_file, "videocourses") : null;

    const video_url = formData.get("video_url");

    const [res] = await connection.query(
      `INSERT INTO videocourses
      (course_name, course_price, language, description, duration, img_url, video_url, slug, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_name, course_price, language, description, duration, img_url, video_url, slug, category_id]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: "Video course created", id: res.insertId }, { status: 201 });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("POST /api/admin/video error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- DELETE API: Delete Video Course ----------------
export async function DELETE(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Course ID required" }, { status: 400 });

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [rows] = await connection.query("SELECT img_url, video_url FROM videocourses WHERE id = ?", [id]);

    if (rows.length === 0) {
      connection.release();
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = rows[0];
    await deleteFromCloudinary(course.img_url);
    await deleteFromCloudinary(course.video_url);

    await connection.query("DELETE FROM videocourses WHERE id = ?", [id]);

    await connection.commit();
    connection.release();
    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("DELETE /api/admin/video error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- PUT API: Update Video Course ----------------
export async function PUT(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const formData = await req.formData();
    const id = formData.get("id");
    if (!id) throw new Error("Course ID required");

    const [rows] = await connection.query("SELECT img_url, video_url FROM videocourses WHERE id = ?", [id]);
    if (rows.length === 0) {
      connection.release();
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const oldCourse = rows[0];

    const course_name = formData.get("course_name");
    const course_price = formData.get("course_price");
    const language = formData.get("language");
    const description = formData.get("description");
    const duration = formData.get("duration");
    const slug = formData.get("slug");
    const category_id = formData.get("category_id") || null;
    const img_file = formData.get("img_url");

    // video_url is a plain external link (same as on create), not a file upload.
    const video_url = formData.get("video_url") || oldCourse.video_url;

    const img_url = img_file && img_file.size > 0 ? await uploadToCloudinary(img_file, "videocourses") : oldCourse.img_url;

    if (img_file && img_file.size > 0 && oldCourse.img_url) await deleteFromCloudinary(oldCourse.img_url);

    await connection.query(
      `UPDATE videocourses SET course_name=?, course_price=?, language=?, description=?, duration=?, img_url=?, video_url=?, slug=?, category_id=? WHERE id=?`,
      [course_name, course_price, language, description, duration, img_url, video_url, slug, category_id, id]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: "Course updated successfully" }, { status: 200 });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("PUT /api/admin/video error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- GET API: Fetch Video Courses ----------------
export async function GET(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const connection = await pool.getConnection();

  try {
    let query = "SELECT * FROM videocourses";
    let params = [];

    if (id) {
      query += " WHERE id = ?";
      params.push(id);
    }

    const [rows] = await connection.query(query, params);

    connection.release();
    if (id && rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (err) {
    connection.release();
    console.error("GET /api/admin/video error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
