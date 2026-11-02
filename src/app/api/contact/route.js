// app/api/contact/route.js
// Contact form -> email to the site inbox (GMAIL_USER), with reply-to set to
// the sender so support can answer directly.
import { NextResponse } from "next/server";
import { transporter } from "../../lib/mailer";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: "Name, email and message are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || String(message).length > 5000) {
      return NextResponse.json({ message: "Invalid email or message too long" }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"Mining Shiksha Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Contact form: ${String(subject || "No subject").slice(0, 150)}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject || "")}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap">${escapeHtml(message)}</p>
      `,
    });

    return NextResponse.json({ message: "Message sent" });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
