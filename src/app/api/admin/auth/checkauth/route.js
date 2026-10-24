import { NextResponse } from "next/server";
import { isAdminSessionValid } from "../../../../lib/auth";

export async function GET(req) {
  if (!isAdminSessionValid(req)) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
  }
  return NextResponse.json({ success: true, message: "Token valid" });
}
