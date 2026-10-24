import pool from "../../../lib/db";
import cloudinary from "../../../lib/cloudinary";
import { requireAdminSession } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id DESC");
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const file = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    let image_url = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "categories" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });
      image_url = uploadRes.secure_url;
    }

    const [result] = await pool.query(
      "INSERT INTO categories (name, image_url) VALUES (?, ?)",
      [name, image_url]
    );

    return NextResponse.json(
      { message: "Category created successfully", id: result.insertId, image_url },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
