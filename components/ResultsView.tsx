"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CandidateTable, { CandidateView } from "@/components/CandidateTable";
import SearchSort from "@/components/SearchSort";

export type ResultsViewProps = {
  sessionId: string;
  createdAt: string;
  candidates: CandidateView[];
};

type SortOrder = "score" | "name";

export default function ResultsView({
  sessionId,
  createdAt,
  candidates,
}: ResultsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("score");

  const stats = useMemo(() => {
    const total = candidates.length;
    const avg = total
      ? Math.round(
          candidates.reduce((sum, candidate) => sum + candidate.score, 0) / total
        )
      : 0;
    const top = total ? Math.max(...candidates.map((c) => c.score)) : 0;
    const below50 = total
      ? Math.round(
          (candidates.filter((candidate) => candidate.score < 50).length / total) *
            100
        )
      : 0;

    return { total, avg, top, below50 };
  }, [candidates]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#e5e5e5]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
            <p className="mt-1 text-sm text-[#6b7280]">Session {createdAt}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/export?sessionId=${sessionId}`}
              className="rounded-md border border-[#1f1f1f] px-3 py-1.5 text-xs text-[#e5e5e5] hover:border-[#6366f1]"
            >
              Export CSV
            </a>
            <Link
              href="/"
              className="rounded-md bg-[#6366f1] px-3 py-1.5 text-xs font-medium text-white"
            >
              New Analysis
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border border-[#1f1f1f] md:grid-cols-4">
          <div className="border-b border-[#1f1f1f] px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-2xl font-mono">{stats.total}</p>
            <p className="text-xs text-[#6b7280]">Total Candidates</p>
          </div>
          <div className="border-b border-[#1f1f1f] px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-2xl font-mono">{stats.avg}</p>
            <p className="text-xs text-[#6b7280]">Avg Score</p>
          </div>
          <div className="border-b border-[#1f1f1f] px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-2xl font-mono">{stats.top}</p>
            <p className="text-xs text-[#6b7280]">Top Score</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-2xl font-mono">{stats.below50}%</p>
            <p className="text-xs text-[#6b7280]">Below 50%</p>
          </div>
        </div>

        <SearchSort
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        <CandidateTable
          candidates={candidates}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}
