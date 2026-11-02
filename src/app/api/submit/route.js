// app/api/submit/route.js
// Retired: it saved whatever score the browser sent. Tests are now scored on
// the server by POST /api/results.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "This endpoint has been removed. Submit tests via /api/results." },
    { status: 410 }
  );
}
