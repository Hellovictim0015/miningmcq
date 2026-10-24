import pool from "../../../lib/db";
import cloudinary from "../../../lib/cloudinary";
import { requireAdminSession } from "../../../lib/auth";
import { NextResponse } from "next/server";

// Upload PDF to Cloudinary
async function uploadPDFToCloudinary(file) {
  if (!file) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "raw", folder: "study_materials" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
}

// Delete PDF from Cloudinary
async function deleteFromCloudinary(url) {
  if (!url) return;
  try {
    const parts = url.split("/");
    const publicIdWithExt = parts.slice(-2).join("/");
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
}

// ---------------- POST API: Add Study Material ----------------
export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const subject = formData.get("subject");
    const price = formData.get("price") || 0;
    const category_id = formData.get("category_id") || null;
    const pdf_file = formData.get("pdf_url");

    if (!title || !subject || !pdf_file) {
      connection.release();
      return NextResponse.json({ error: "Title, subject, and PDF are required" }, { status: 400 });
    }

    const pdf_url = await uploadPDFToCloudinary(pdf_file);

    const [res] = await connection.query(
      "INSERT INTO study_materials (title, subject, price, pdf_url, category_id) VALUES (?, ?, ?, ?, ?)",
      [title, subject, price, pdf_url, category_id]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: "Study material added", id: res.insertId }, { status: 201 });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("POST /api/admin/materials error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- GET API: Fetch Study Materials ----------------
export async function GET(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const connection = await pool.getConnection();

  try {
    let query = "SELECT * FROM study_materials";
    let params = [];

    if (id) {
      query += " WHERE id = ?";
      params.push(id);
    }

    const [rows] = await connection.query(query, params);
    connection.release();

    if (id && rows.length === 0) {
      return NextResponse.json({ error: "Study material not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (err) {
    connection.release();
    console.error("GET /api/admin/materials error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- DELETE API: Delete Study Material ----------------
export async function DELETE(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [rows] = await connection.query("SELECT pdf_url FROM study_materials WHERE id = ?", [id]);
    if (rows.length === 0) {
      connection.release();
      return NextResponse.json({ error: "Study material not found" }, { status: 404 });
    }

    await deleteFromCloudinary(rows[0].pdf_url);
    await connection.query("DELETE FROM study_materials WHERE id = ?", [id]);

    await connection.commit();
    connection.release();
    return NextResponse.json({ message: "Study material deleted successfully" }, { status: 200 });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("DELETE /api/admin/materials error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- PUT API: Update Study Material ----------------
export async function PUT(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const formData = await req.formData();
    const id = formData.get("id");
    if (!id) throw new Error("ID required");

    const [rows] = await connection.query("SELECT pdf_url FROM study_materials WHERE id = ?", [id]);
    if (rows.length === 0) {
      connection.release();
      return NextResponse.json({ error: "Study material not found" }, { status: 404 });
    }

    const oldPDF = rows[0].pdf_url;

    const title = formData.get("title");
    const subject = formData.get("subject");
    const price = formData.get("price");
    const category_id = formData.get("category_id") || null;
    const pdf_file = formData.get("pdf_url");

    const pdf_url = pdf_file ? await uploadPDFToCloudinary(pdf_file) : oldPDF;

    if (pdf_file && oldPDF) await deleteFromCloudinary(oldPDF);

    await connection.query(
      "UPDATE study_materials SET title=?, subject=?, price=?, pdf_url=?, category_id=? WHERE id=?",
      [title, subject, price, pdf_url, category_id, id]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json({ message: "Study material updated successfully" }, { status: 200 });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("PUT /api/admin/materials error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
