// Shared by admin APIs, AI generation and the student test page.
//
// answers.correct_answer storage per question_type:
//   MCQ -> exact text of the correct option
//   MSQ -> JSON array of the correct options' texts
//   NAT -> numeric answer as text (answers.answer_tolerance = allowed +/- range)

export const QUESTION_TYPES = ["MCQ", "MSQ", "NAT"];

export const QUESTION_TYPE_LABELS = {
  MCQ: "MCQ (single correct)",
  MSQ: "MSQ (multiple correct)",
  NAT: "NAT (numerical answer)",
};

export function normalizeType(type) {
  return QUESTION_TYPES.includes(type) ? type : "MCQ";
}

// Parses a marks value from a form/JSON field; falls back when empty or invalid.
export function parseMarks(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : fallback;
}

export function parseMsqAnswer(correctAnswer) {
  if (Array.isArray(correctAnswer)) return correctAnswer;
  try {
    const parsed = JSON.parse(correctAnswer);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Human-readable correct answer for lists / results.
export function formatCorrectAnswer(question) {
  const type = normalizeType(question.question_type);
  const answer = question.answer;
  if (!answer) return "";
  if (type === "MSQ") return parseMsqAnswer(answer.correct_answer).join(", ");
  if (type === "NAT") {
    const tol = Number(answer.answer_tolerance) || 0;
    return tol > 0 ? `${answer.correct_answer} (± ${tol})` : String(answer.correct_answer);
  }
  return answer.correct_answer;
}

export function isAttempted(question, userAnswer) {
  const type = normalizeType(question.question_type);
  if (userAnswer === undefined || userAnswer === null) return false;
  if (type === "MSQ") return Array.isArray(userAnswer) && userAnswer.length > 0;
  if (type === "NAT") return String(userAnswer).trim() !== "";
  return userAnswer !== "";
}

export function isCorrectAnswer(question, userAnswer) {
  if (!question.answer || !isAttempted(question, userAnswer)) return false;
  const type = normalizeType(question.question_type);

  if (type === "MSQ") {
    // All-or-nothing: the selected set must exactly match the correct set.
    const correct = parseMsqAnswer(question.answer.correct_answer);
    return (
      correct.length === userAnswer.length &&
      correct.every((opt) => userAnswer.includes(opt))
    );
  }

  if (type === "NAT") {
    const given = Number(String(userAnswer).trim());
    const expected = Number(question.answer.correct_answer);
    const tol = Number(question.answer.answer_tolerance) || 0;
    if (!Number.isFinite(given) || !Number.isFinite(expected)) return false;
    return Math.abs(given - expected) <= tol + 1e-9;
  }

  return userAnswer === question.answer.correct_answer;
}

// Marks earned for one question: +marks if correct, -negative_marks if attempted and wrong, else 0.
export function marksForAnswer(question, userAnswer) {
  if (!isAttempted(question, userAnswer)) return 0;
  const marks = Number(question.marks ?? 1);
  const negative = Number(question.negative_marks ?? 0);
  if (isCorrectAnswer(question, userAnswer)) return marks;
  return negative > 0 ? -negative : 0;
}

export function totalMarks(questions) {
  return round2(questions.reduce((sum, q) => sum + Number(q.marks ?? 1), 0));
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}
