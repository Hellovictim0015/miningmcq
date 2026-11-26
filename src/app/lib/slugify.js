// Builds a URL-safe (ASCII) slug. Non-Latin text (e.g. Hindi) is dropped, so the
// result can be empty — callers must use ensureUniqueSlug() to get a fallback.
export function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Returns a non-empty slug that no other course uses.
// Hindi-only titles get "course-<random>"; collisions get a "-2", "-3"... suffix.
export async function ensureUniqueSlug(pool, rawSlug, excludeId = null) {
  let base = slugify(rawSlug);
  if (!base) base = `course-${Date.now().toString(36)}`;

  let candidate = base;
  let n = 1;
  for (;;) {
    const [rows] = await pool.query(
      "SELECT id FROM courses WHERE slug = ? AND id <> ? LIMIT 1",
      [candidate, excludeId ?? 0]
    );
    if (rows.length === 0) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}
