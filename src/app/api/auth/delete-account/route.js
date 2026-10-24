import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../../lib/db";
import { getUserFromRequest } from "../../../lib/auth";

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ message: "Password is required to confirm account deletion" }, { status: 400 });
  }

  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query("SELECT password FROM users WHERE id = ?", [user.id]);
    if (rows.length === 0) {
      connection.release();
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      connection.release();
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
    }

    await connection.beginTransaction();
    await connection.query("DELETE FROM results WHERE user_id = ?", [user.id]);
    await connection.query("DELETE FROM payments WHERE user_id = ?", [user.id]);
    await connection.query("DELETE FROM users WHERE id = ?", [user.id]);
    await connection.commit();
    connection.release();

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("❌ Delete account error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
