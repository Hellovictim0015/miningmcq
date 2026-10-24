import { NextResponse } from "next/server";
import OpenAI from "openai";
import pool from "../../../lib/db";
import { requireAdminSession } from "../../../lib/auth";
import { QUESTION_TYPES, parseMarks } from "../../../lib/questionTypes";

const MAX_PER_CALL = 20; // keeps each OpenAI call + DB insert well under a serverless timeout
const MAX_ATTACHMENTS = 10;

// Per-type instructions + the JSON shape the model must return for each question.
const TYPE_PROMPTS = {
  MCQ: (numOptions) => `- Type: MCQ (single correct). Each question has exactly ${numOptions} options and exactly ONE correct option.
- "correct_answer" must exactly match the text of one of the options (character for character).
JSON shape of each question:
{ "question_text": "string", "options": ["string", ...], "correct_answer": "string", "about_answer": "string" }`,
  MSQ: (numOptions) => `- Type: MSQ (multiple select). Each question has exactly ${numOptions} options and TWO OR MORE correct options (never all of them).
- "correct_answers" is an array whose items exactly match option texts (character for character).
JSON shape of each question:
{ "question_text": "string", "options": ["string", ...], "correct_answers": ["string", ...], "about_answer": "string" }`,
  NAT: () => `- Type: NAT (numerical answer type). There are NO options; the answer is a single number the student types in.
- "correct_answer" is a number (integer or decimal). "tolerance" is the allowed +/- error (use 0 for exact integer answers, a small range for calculated decimals).
JSON shape of each question:
{ "question_text": "string", "correct_answer": number, "tolerance": number, "about_answer": "string" }`,
};

function validateQuestion(q, type, numOptions) {
  if (!q || typeof q.question_text !== "string" || !q.question_text.trim()) return null;
  if (typeof q.about_answer !== "string") return null;

  if (type === "NAT") {
    const answer = Number(q.correct_answer);
    const tolerance = Math.abs(Number(q.tolerance) || 0);
    if (!Number.isFinite(answer)) return null;
    return { ...q, options: [], stored_answer: String(answer), tolerance };
  }

  const optionsOk =
    Array.isArray(q.options) &&
    q.options.length === numOptions &&
    q.options.every((o) => typeof o === "string" && o.trim()) &&
    new Set(q.options).size === q.options.length;
  if (!optionsOk) return null;

  if (type === "MSQ") {
    const correct = Array.isArray(q.correct_answers) ? [...new Set(q.correct_answers)] : [];
    if (correct.length < 1 || correct.length >= numOptions) return null;
    if (!correct.every((c) => q.options.includes(c))) return null;
    // Keep the options' order so the stored answer reads naturally.
    const ordered = q.options.filter((o) => correct.includes(o));
    return { ...q, stored_answer: JSON.stringify(ordered), tolerance: 0 };
  }

  if (typeof q.correct_answer !== "string" || !q.options.includes(q.correct_answer)) return null;
  return { ...q, stored_answer: q.correct_answer, tolerance: 0 };
}

export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "OPENAI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      test_id,
      exam_details,
      num_options,
      language,
      difficulty,
      level,
      count,
      question_type,
      marks,
      negative_marks,
      attachments, // [{ kind: "image", url } | { kind: "pdf", file_id }] from /api/admin/ai-upload
      avoid_titles, // array of question_text strings already generated in this session, to reduce repeats
    } = body;

    const testId = parseInt(test_id, 10);
    const numOptions = parseInt(num_options, 10);
    const levelNum = parseInt(level, 10);
    const requestedCount = parseInt(count, 10);
    const type = question_type || "MCQ";
    const questionMarks = parseMarks(marks, 1);
    const negativeMarks = parseMarks(negative_marks, 0);
    const files = Array.isArray(attachments) ? attachments.slice(0, MAX_ATTACHMENTS) : [];
    const details = typeof exam_details === "string" ? exam_details.trim() : "";

    if (!testId) {
      return NextResponse.json({ success: false, message: "test_id is required" }, { status: 400 });
    }
    if (!details && files.length === 0) {
      return NextResponse.json(
        { success: false, message: "exam_details or an uploaded image/PDF is required" },
        { status: 400 }
      );
    }
    if (!QUESTION_TYPES.includes(type)) {
      return NextResponse.json({ success: false, message: "question_type must be MCQ, MSQ or NAT" }, { status: 400 });
    }
    if (type !== "NAT" && ![4, 5].includes(numOptions)) {
      return NextResponse.json({ success: false, message: "num_options must be 4 or 5" }, { status: 400 });
    }
    if (!["English", "Hindi"].includes(language)) {
      return NextResponse.json({ success: false, message: "language must be English or Hindi" }, { status: 400 });
    }
    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return NextResponse.json({ success: false, message: "difficulty must be Easy, Medium or Hard" }, { status: 400 });
    }
    if (!levelNum || levelNum < 1 || levelNum > 10) {
      return NextResponse.json({ success: false, message: "level must be between 1 and 10" }, { status: 400 });
    }
    if (!requestedCount || requestedCount < 1 || requestedCount > MAX_PER_CALL) {
      return NextResponse.json(
        { success: false, message: `count must be between 1 and ${MAX_PER_CALL}` },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const avoidList = Array.isArray(avoid_titles) ? avoid_titles.slice(-40) : [];

    const sourceText = files.length
      ? `Base the questions on the attached ${files.length > 1 ? "files" : "file"} (images / PDF).${
          details ? ` Additional exam/topic details: "${details}"` : ""
        }`
      : `Exam/topic: "${details}"`;

    const prompt = `Generate exactly ${requestedCount} exam questions.
${sourceText}

Requirements:
- Language: ${language}
- Difficulty: ${difficulty} (level ${levelNum} out of 10, where 10 is hardest)
${TYPE_PROMPTS[type](numOptions)}
- "about_answer" is a short explanation (1-3 sentences) of why the answer is correct.
- Questions must be answerable from text alone; do not say "see the image" or "refer to the PDF".
- Do not repeat these already-used questions:
${avoidList.length ? avoidList.map((t) => `- ${t}`).join("\n") : "(none yet)"}

Respond with ONLY valid JSON, no extra commentary:
{ "questions": [ ... ] }`;

    const userContent = [{ type: "text", text: prompt }];
    for (const f of files) {
      if (f?.kind === "image" && typeof f.url === "string" && f.url.startsWith("https://")) {
        userContent.push({ type: "image_url", image_url: { url: f.url } });
      } else if (f?.kind === "pdf" && typeof f.file_id === "string") {
        userContent.push({ type: "file", file: { file_id: f.file_id } });
      }
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert exam question setter for Indian competitive and technical exams. You always respond with strictly valid JSON matching the schema given, and never include markdown formatting.",
        },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch (parseErr) {
      console.error("Failed to parse OpenAI response as JSON:", parseErr);
      return NextResponse.json(
        { success: false, message: "AI response was not valid JSON, please try again" },
        { status: 502 }
      );
    }

    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    // Keep only well-formed questions matching the requested shape.
    const validQuestions = questions
      .map((q) => validateQuestion(q, type, numOptions))
      .filter(Boolean)
      .slice(0, requestedCount);

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { success: false, message: "AI did not return any valid questions, please try again" },
        { status: 502 }
      );
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const insertedTitles = [];

    try {
      for (const q of validQuestions) {
        const [qRes] = await connection.query(
          "INSERT INTO questions (question_text, question_image, test_id, question_type, marks, negative_marks) VALUES (?, NULL, ?, ?, ?, ?)",
          [q.question_text, testId, type, questionMarks, negativeMarks]
        );
        const questionId = qRes.insertId;

        for (const optionText of q.options) {
          await connection.query(
            "INSERT INTO options (question_id, option_text, option_image) VALUES (?, ?, NULL)",
            [questionId, optionText]
          );
        }

        await connection.query(
          "INSERT INTO answers (question_id, correct_answer, about_answer, about_answer_img, answer_time, answer_tolerance) VALUES (?, ?, ?, NULL, NOW(), ?)",
          [questionId, q.stored_answer, q.about_answer, q.tolerance]
        );

        insertedTitles.push(q.question_text);
      }

      await connection.commit();
    } catch (dbErr) {
      await connection.rollback();
      throw dbErr;
    } finally {
      connection.release();
    }

    return NextResponse.json({
      success: true,
      inserted: insertedTitles.length,
      requested: requestedCount,
      skipped: questions.length - validQuestions.length,
      titles: insertedTitles,
    });
  } catch (error) {
    console.error("POST /api/admin/generate-mcq error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
