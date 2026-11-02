// app/api/study-materials_download/route.js
// Hands out a study material's PDF link: free materials to anyone, paid ones
// only to users who bought them. The public list API no longer includes
// pdf_url, so this is the only way to get it.
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";

export async function GET(req) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    const [rows] = await db.query("SELECT price, pdf_url FROM study_materials WHERE id = ?", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });
    }

    const material = rows[0];

    if (Number(material.price) > 0) {
      const user = getUserFromRequest(req);
      if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const [payment] = await db.query(
        `SELECT id FROM payments
         WHERE user_id = ? AND course_id = ? AND product_type = 'study_material' AND payment_status = 'success'
         LIMIT 1`,
        [user.id, id]
      );
      if (payment.length === 0) {
        return NextResponse.json({ success: false, message: "Material not purchased" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, pdf_url: material.pdf_url });
  } catch (err) {
    console.error("❌ Error fetching study material download:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
