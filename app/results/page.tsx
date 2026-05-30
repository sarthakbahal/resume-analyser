import { prisma } from "@/lib/db";
import ResultsView from "@/components/ResultsView";
import type { CandidateView } from "@/components/CandidateTable";

export const dynamic = "force-dynamic";

type ResultsPageProps = {
  searchParams: Promise<{ sessionId?: string }>;
};

type CandidateRecord = {
  id: string;
  rank: number;
  name: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  resumeText: string;
};

const formatTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#e5e5e5]">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Session not found.</p>
        </div>
      </div>
    );
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { candidates: true },
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#e5e5e5]">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Session not found.</p>
        </div>
      </div>
    );
  }

  const candidates: CandidateView[] = session.candidates.map(
    (candidate: CandidateRecord) => ({
    id: candidate.id,
    rank: candidate.rank,
    name: candidate.name,
    score: candidate.score,
    matchedSkills: candidate.matchedSkills,
    missingSkills: candidate.missingSkills,
    summary: candidate.summary,
    resumeText: candidate.resumeText,
    })
  );

  return (
    <ResultsView
      sessionId={session.id}
      createdAt={formatTimestamp(session.createdAt)}
      candidates={candidates}
    />
  );
}
