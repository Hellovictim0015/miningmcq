import pool from "../../../../lib/db";
import cloudinary from "../../../../lib/cloudinary";
import { requireAdminSession } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const { id } = await params;
    const formData = await req.formData();
    const name = formData.get("name");
    const file = formData.get("image");

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
      "UPDATE categories SET name = ?, image_url = COALESCE(?, image_url) WHERE id = ?",
      [name || null, image_url, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/categories/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const { id } = await params;

    const [rows] = await pool.query("SELECT image_url FROM categories WHERE id = ?", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await pool.query("DELETE FROM categories WHERE id = ?", [id]);

    const imageUrl = rows[0].image_url;
    if (imageUrl) {
      try {
        const parts = imageUrl.split("/upload/")[1];
        const publicId = parts.split(".")[0].split("/").slice(1).join("/");
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("⚠️ Error deleting category image from Cloudinary:", cloudErr);
      }
    }

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
