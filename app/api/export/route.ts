import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import Papa from "papaparse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return new Response("sessionId is required.", { status: 400 });
    }

    const candidates = await prisma.candidate.findMany({
      where: { sessionId },
      orderBy: { rank: "asc" },
    });

    const rows = candidates.map((candidate) => ({
      Rank: candidate.rank,
      Name: candidate.name,
      Score: candidate.score,
      "Matched Skills": candidate.matchedSkills.join(", "),
      "Missing Skills": candidate.missingSkills.join(", "),
      Summary: candidate.summary,
    }));

    const csv = Papa.unparse(rows, { header: true });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=\"results.csv\"",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    return new Response(message, { status: 500 });
  }
}
