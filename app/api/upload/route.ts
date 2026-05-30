import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTextFromBuffer } from "@/lib/parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 20;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const getExtension = (fileName: string): string =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

const isAllowed = (file: File): boolean => {
  if (ALLOWED_TYPES.has(file.type)) return true;
  const extension = getExtension(file.name);
  return extension === "pdf" || extension === "doc" || extension === "docx";
};

const toMimeType = (file: File): string => {
  if (file.type) return file.type;
  const extension = getExtension(file.name);
  if (extension === "pdf") return "application/pdf";
  if (extension === "doc") return "application/msword";
  if (extension === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "";
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = [...formData.getAll("files"), ...formData.getAll("files[]")].filter(
      (item) => item instanceof File
    ) as File[];
    const jdTextField = formData.get("jdText");
    const jdFile = formData.get("jdFile");

    if (files.length === 0) {
      return NextResponse.json({ message: "No resumes uploaded." }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { message: `Too many files. Max ${MAX_FILES}.` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!isAllowed(file)) {
        return NextResponse.json(
          { message: "Unsupported file format." },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "File too large. Max 5MB per file." },
          { status: 400 }
        );
      }
    }

    let jdText = typeof jdTextField === "string" ? jdTextField.trim() : "";

    if (jdFile instanceof File) {
      if (!isAllowed(jdFile)) {
        return NextResponse.json(
          { message: "Unsupported JD file format." },
          { status: 400 }
        );
      }
      if (jdFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "JD file too large. Max 5MB." },
          { status: 400 }
        );
      }
      const jdBuffer = Buffer.from(await jdFile.arrayBuffer());
      const jdResult = await extractTextFromBuffer(jdBuffer, toMimeType(jdFile));
      jdText = jdResult.text;
    }

    if (!jdText) {
      return NextResponse.json(
        { message: "Job description is required." },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        jdText,
      },
    });

    let createdCount = 0;

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await extractTextFromBuffer(buffer, toMimeType(file));
      const nameFromFile = file.name.replace(/\.[^/.]+$/, "").trim() || "Unknown";

      const candidate = await prisma.candidate.create({
        data: {
          sessionId: session.id,
          name: nameFromFile,
          fileName: file.name,
          resumeText: parsed.text,
          score: 0,
          rank: 0,
          matchedSkills: [],
          missingSkills: [],
          summary: "",
        },
      });

      await prisma.fileUpload.create({
        data: {
          candidateId: candidate.id,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        },
      });

      createdCount += 1;
    }

    return NextResponse.json({
      sessionId: session.id,
      candidateCount: createdCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
