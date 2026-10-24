import { NextResponse } from "next/server";
import { signAdminSessionToken } from "../../../../lib/auth";

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
      console.error("ADMIN_PASSWORD or JWT_SECRET is not configured");
      return NextResponse.json({ message: "Server not configured" }, { status: 500 });
    }

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    const token = signAdminSessionToken();

    return NextResponse.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
