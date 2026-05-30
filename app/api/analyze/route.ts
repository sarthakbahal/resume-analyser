import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scoreResume } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyzeRequest = {
  sessionId: string;
};

type CandidateRecord = {
  id: string;
  sessionId: string;
  name: string;
  fileName: string;
  resumeText: string;
  score: number;
  rank: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  createdAt: Date;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    if (!body.sessionId) {
      return NextResponse.json({ message: "sessionId is required." }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: body.sessionId },
      include: { candidates: true },
    });

    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    const scoredCandidates = await Promise.all(
      session.candidates.map(async (candidate: CandidateRecord) => {
        try {
          const result = await scoreResume(
            session.jdText,
            candidate.resumeText,
            candidate.fileName
          );

          return prisma.candidate.update({
            where: { id: candidate.id },
            data: {
              name: result.name || candidate.name,
              score: result.score,
              matchedSkills: result.matchedSkills,
              missingSkills: result.missingSkills,
              summary: result.summary,
            },
          });
        } catch {
          return prisma.candidate.update({
            where: { id: candidate.id },
            data: {
              score: 0,
              matchedSkills: [],
              missingSkills: [],
              summary: "Scoring failed — check API key",
            },
          });
        }
      })
    );

    const sorted = [...scoredCandidates].sort(
      (a: CandidateRecord, b: CandidateRecord) => b.score - a.score
    );

    const ranked = await prisma.$transaction(
      sorted.map((candidate, index) =>
        prisma.candidate.update({
          where: { id: candidate.id },
          data: { rank: index + 1 },
        })
      )
    );

    const rankedSorted = ranked.sort(
      (a: CandidateRecord, b: CandidateRecord) => a.rank - b.rank
    );

    return NextResponse.json({
      sessionId: session.id,
      candidates: rankedSorted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
