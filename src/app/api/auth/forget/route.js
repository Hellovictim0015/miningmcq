import { NextResponse } from "next/server";
import db from "../../../lib/db";
import crypto from "crypto";
import { transporter } from "../../../lib/mailer";

// ✅ Generate random 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ✅ Function to send OTP Email
async function sendOTP(to, subject, html) {
  const mailOptions = {
    from: `"Mining Shiksha" <helpminingshiksha@gmail.com>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ OTP email sent to ${to}`);
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // ✅ Check if user exists
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Generate OTP
    const otp = generateOTP();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ✅ Store OTP in DB
    await db.query(
      `INSERT INTO otp_requests_forget (email, otp_code, expiration_time, is_verified) VALUES (?, ?, ?, 0)`,
      [email, otp, expiration]
    );

    // ✅ Email subject and HTML
    const subject = "Mining Shiksha - Password Reset OTP";
    const html = `
      <div style="background-color: #f4f7fb; padding: 40px 0; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header -->
          <div style="background-color: #06923E; color: #ffffff; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Mining Shiksha</h1>
            <p style="margin: 5px 0 0; font-size: 14px;">Your Learning Partner</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px 25px; color: #333;">
            <h2 style="color: #222; font-size: 20px; margin-bottom: 15px;">Password Reset Request</h2>
            <p style="font-size: 15px; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 15px; margin-bottom: 20px;">
              You requested to reset your Mining Shiksha account password. Please use the following One-Time Password (OTP) to proceed:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #06923E; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 3px; padding: 15px 40px; border-radius: 8px;">
                ${otp}
              </div>
            </div>

            <p style="font-size: 14px; color: #555;">
              This OTP is valid for <strong>10 minutes</strong>. If you didn’t request a password reset, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Mining Shiksha. All rights reserved.</p>
            <p style="margin: 4px 0 0;">Learn more at 
              <a href="https://www.miningshiksha.com" style="color: #06923E; text-decoration: none;">miningshiksha.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // ✅ Send Email
    await sendOTP(email, subject, html);

    console.log(`📩 OTP sent to ${email}: ${otp}`);
    return NextResponse.json({ message: "OTP sent successfully", email });
  } catch (err) {
    console.error("❌ Error in forget password:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
