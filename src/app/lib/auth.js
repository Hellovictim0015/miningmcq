import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Verifies the Authorization: Bearer <token> header and returns the decoded
// payload ({ id, email }), or null if missing/invalid.
export function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  if (!process.env.JWT_SECRET) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Comma-separated list of user ids allowed to perform admin actions, e.g. "1,7".
function getAdminUserIds() {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminUser(user) {
  if (!user) return false;
  return getAdminUserIds().includes(String(user.id));
}

// Use at the top of an admin-only route handler:
//   const gate = requireAdmin(req);
//   if (gate.error) return gate.error;
//   const { user } = gate;
export function requireAdmin(req) {
  const user = getUserFromRequest(req);
  if (!user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdminUser(user)) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

// --- Content-admin panel (/admin) session, gated by a single shared password ---
// Separate from customer accounts: logging in here has nothing to do with the
// users table, it just proves the caller knows ADMIN_PASSWORD.

export function signAdminSessionToken() {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "12h" });
}

export function isAdminSessionValid(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.split(" ")[1];
  if (!token) return false;

  if (!process.env.JWT_SECRET) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

// Use at the top of a /api/admin/* route handler:
//   const gate = requireAdminSession(req);
//   if (gate) return gate;
export function requireAdminSession(req) {
  if (!isAdminSessionValid(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
