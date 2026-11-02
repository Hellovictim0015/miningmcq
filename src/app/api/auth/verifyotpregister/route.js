    import { NextResponse } from "next/server";
import db from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, phone, email, password, otp } = await req.json();

    if (!name || !phone || !email || !password || !otp) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // fetch latest OTP
    const [rows] = await db.query(
      "SELECT * FROM otp_requests WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "No OTP request found" }, { status: 400 });
    }

    const otpRecord = rows[0];

    if (otpRecord.is_verified) {
      return NextResponse.json({ message: "OTP already used. Please request a new one." }, { status: 400 });
    }

    // A wrong guess burns the OTP so it can't be brute-forced.
    if (String(otpRecord.otp_code) !== String(otp)) {
      await db.query("UPDATE otp_requests SET is_verified = 1 WHERE request_id = ?", [otpRecord.request_id]);
      return NextResponse.json({ message: "Wrong OTP. Please request a new one." }, { status: 400 });
    }

    if (new Date(otpRecord.expiration_time) < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // ✅ mark OTP as verified
    await db.query("UPDATE otp_requests SET is_verified = 1 WHERE request_id = ?", [otpRecord.request_id]);

    // ✅ Insert the real user data submitted during registration
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (username, email, password, phone_number) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, phone]
    );

    return NextResponse.json({ message: "Account verified successfully!" }, { status: 200 });
  } catch (err) {
    console.error("❌ OTP verify error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
