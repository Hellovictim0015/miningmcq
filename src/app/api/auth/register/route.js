import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { sendOTP } from "../../../lib/mailer"; // 👈 import mailer

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function POST(req) {
  try {
    const { name, phone, email, password } = await req.json();

    if (!name || !phone || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 5 * 60000); // 5 min

    await db.query(
      `INSERT INTO otp_requests (email, otp_code, expiration_time, is_verified) 
       VALUES (?, ?, ?, 0)`,
      [email, otp, expirationTime]
    );

    // ✅ Send OTP via email
    await sendOTP(email, otp);

    return NextResponse.json({ message: "OTP sent successfully", email }, { status: 200 });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
