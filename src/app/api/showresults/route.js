// app/api/showresults/route.js
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getUserFromRequest } from "../../lib/auth";

export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Fetch results for this user with username, test name, and course name
    const [results] = await db.query(
      `SELECT
         r.id,
         r.user_id,
         r.test_id,
         r.score,
         u.username,
         t.test_name,
         c.course_name
       FROM results r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN tests t ON r.test_id = t.id
       LEFT JOIN courses c ON t.course_id = c.id
       WHERE r.user_id = ?
       ORDER BY r.score DESC`,
      [user.id]
    );

    // Add rank
    const rankedResults = results.map((res, index) => ({
      rank: index + 1,
      ...res,
    }));

    return NextResponse.json({
      success: true,
      user_id: user.id,
      results: rankedResults,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
