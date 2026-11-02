import { NextResponse } from "next/server";
import db from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // ✅ Find the latest unused OTP for this email
    const [rows] = await db.query(
      `SELECT * FROM otp_requests_forget
       WHERE email = ? AND is_verified = 0
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Invalid or expired OTP. Please request a new one." }, { status: 400 });
    }

    const otpRecord = rows[0];

    // ✅ A wrong guess burns the OTP, so it can't be brute-forced; together
    // with the per-hour request limit in /api/auth/forget this caps guesses.
    if (String(otpRecord.otp_code) !== String(otp)) {
      await db.query("UPDATE otp_requests_forget SET is_verified = 1 WHERE request_id = ?", [
        otpRecord.request_id,
      ]);
      return NextResponse.json({ message: "Wrong OTP. Please request a new one." }, { status: 400 });
    }

    if (new Date(otpRecord.expiration_time) < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password
    await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

    // ✅ Mark OTP as used
    await db.query("UPDATE otp_requests_forget SET is_verified = 1 WHERE request_id = ?", [
      otpRecord.request_id,
    ]);

    return NextResponse.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Error in OTP verification:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
