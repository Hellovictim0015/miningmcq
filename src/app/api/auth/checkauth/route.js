import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) {
      return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing required environment variable: JWT_SECRET");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up the full record so callers (e.g. the app's payment prefill) get
    // phone_number too — the JWT payload itself only carries { id, email }.
    const [rows] = await db.query(
      "SELECT id, username, email, phone_number FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Token valid",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ Token verify error:", err);
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
  }
}
