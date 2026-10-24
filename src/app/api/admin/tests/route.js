import pool from "../../../lib/db";
import { requireAdminSession } from "../../../lib/auth";
import { NextResponse } from "next/server";

// ---------------- GET ALL TESTS BY COURSE_ID ----------------
export async function GET(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const url = new URL(req.url);
    const course_id = url.searchParams.get("course_id");

    if (!course_id) {
      return NextResponse.json(
        { error: "course_id is required" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      "SELECT * FROM tests WHERE course_id = ?",
      [course_id]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/tests error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ---------------- POST (CREATE) ----------------
export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const data = await req.json();
    const { course_id, test_name } = data;

    if (!course_id || !test_name) {
      return NextResponse.json(
        { error: "course_id and test_name are required" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "INSERT INTO tests (course_id, test_name) VALUES (?, ?)",
      [course_id, test_name]
    );

    return NextResponse.json(
      { message: "Test created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/tests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- PUT (UPDATE) ----------------
export async function PUT(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Test id is required" }, { status: 400 });
    }

    const data = await req.json();
    const { test_name, course_id } = data;

    await pool.query(
      "UPDATE tests SET test_name = ?, course_id = ? WHERE id = ?",
      [test_name || null, course_id || null, id]
    );

    return NextResponse.json({ message: "Test updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/tests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Test id is required" }, { status: 400 });
    }

    await pool.query("DELETE FROM tests WHERE id = ?", [id]);
    return NextResponse.json({ message: "Test deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/tests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
