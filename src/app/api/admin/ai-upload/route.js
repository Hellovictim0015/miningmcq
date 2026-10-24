import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import cloudinary from "../../../lib/cloudinary";
import { requireAdminSession } from "../../../lib/auth";

// Uploads reference material for AI MCQ generation once, so each generation
// batch can just pass the returned references instead of re-sending files.
//   images -> Cloudinary (public URL the model can fetch)
//   PDFs   -> OpenAI Files API (file_id usable in chat completions)

const MAX_FILE_BYTES = 20 * 1024 * 1024;

function uploadImageToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "ai-reference" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
}

export async function POST(req) {
  const gate = requireAdminSession(req);
  if (gate) return gate;

  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f) => f && typeof f !== "string" && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
    }

    const hasPdf = files.some((f) => f.type === "application/pdf");
    if (hasPdf && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "OPENAI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }
    const client = hasPdf ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

    const attachments = [];
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { success: false, message: `${file.name} is larger than 20 MB` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf") {
        const uploaded = await client.files.create({
          file: await toFile(buffer, file.name || "reference.pdf", { type: "application/pdf" }),
          purpose: "user_data",
        });
        attachments.push({ kind: "pdf", name: file.name, file_id: uploaded.id });
      } else if (file.type.startsWith("image/")) {
        const url = await uploadImageToCloudinary(buffer);
        attachments.push({ kind: "image", name: file.name, url });
      } else {
        return NextResponse.json(
          { success: false, message: `${file.name}: only images and PDF files are allowed` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true, attachments });
  } catch (error) {
    console.error("POST /api/admin/ai-upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
