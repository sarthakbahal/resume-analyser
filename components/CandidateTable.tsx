"use client";

import { Fragment, useMemo, useState } from "react";
import ScoreBar from "@/components/ScoreBar";

type SortOrder = "score" | "name";

export type CandidateView = {
  id: string;
  rank: number;
  name: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  resumeText: string;
};

type CandidateTableProps = {
  candidates: CandidateView[];
  searchQuery: string;
  sortOrder: SortOrder;
};

const matchQuery = (candidate: CandidateView, query: string): boolean => {
  if (!query) return true;
  const lower = query.toLowerCase();
  const inName = candidate.name.toLowerCase().includes(lower);
  const inMatched = candidate.matchedSkills.some((skill) =>
    skill.toLowerCase().includes(lower)
  );
  const inMissing = candidate.missingSkills.some((skill) =>
    skill.toLowerCase().includes(lower)
  );
  return inName || inMatched || inMissing;
};

const sortCandidates = (list: CandidateView[], order: SortOrder): CandidateView[] => {
  if (order === "name") {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }
  return [...list].sort((a, b) => b.score - a.score);
};

const renderSkills = (skills: string[], accent: string) => {
  const visible = skills.slice(0, 4);
  const remainder = skills.length - visible.length;
  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((skill) => (
        <span
          key={skill}
          className={`rounded-full border border-[#1f1f1f] px-2 py-0.5 text-xs ${accent}`}
        >
          {skill}
        </span>
      ))}
      {remainder > 0 ? (
        <span className="text-xs text-[#6b7280]">+{remainder} more</span>
      ) : null}
    </div>
  );
};

export default function CandidateTable({
  candidates,
  searchQuery,
  sortOrder,
}: CandidateTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const matched = candidates.filter((candidate) =>
      matchQuery(candidate, searchQuery)
    );
    return sortCandidates(matched, sortOrder);
  }, [candidates, searchQuery, sortOrder]);

  if (filtered.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center text-sm text-[#6b7280]">
        No candidates found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <div className="overflow-x-auto border border-[#1f1f1f]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#1f1f1f] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Matched Skills</th>
                <th className="px-4 py-3">Missing Skills</th>
                <th className="px-4 py-3">Summary</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((candidate) => (
                <Fragment key={candidate.id}>
                  <tr
                    className="cursor-pointer border-b border-[#1f1f1f] hover:bg-[#1a1a1a]"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === candidate.id ? null : candidate.id
                      )
                    }
                    role="button"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">
                      {candidate.rank}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#e5e5e5]">
                      {candidate.name}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={candidate.score} />
                    </td>
                    <td className="px-4 py-3">
                      {renderSkills(candidate.matchedSkills, "text-[#6366f1]")}
                    </td>
                    <td className="px-4 py-3">
                      {renderSkills(candidate.missingSkills, "text-[#ef4444]")}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-[#6b7280] truncate max-w-60"
                      title={candidate.summary}
                    >
                      {candidate.summary}
                    </td>
                  </tr>
                  {expandedId === candidate.id ? (
                    <tr className="border-b border-[#1f1f1f] bg-[#111111]">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs uppercase text-[#6b7280]">Matched Skills</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {candidate.matchedSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-[#1f1f1f] px-2 py-0.5 text-xs text-[#6366f1]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[#6b7280]">Missing Skills</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {candidate.missingSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-[#1f1f1f] px-2 py-0.5 text-xs text-[#ef4444]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[#6b7280]">Summary</p>
                            <p className="mt-2 text-sm text-[#e5e5e5]">
                              {candidate.summary}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[#6b7280]">Resume Text</p>
                            <pre className="mt-2 max-h-50 overflow-y-auto rounded-md border border-[#1f1f1f] bg-[#0a0a0a] p-3 text-xs text-[#6b7280]">
{candidate.resumeText}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {filtered.map((candidate) => (
          <div
            key={candidate.id}
            className="cursor-pointer border border-[#1f1f1f] p-4"
            onClick={() =>
              setExpandedId((prev) => (prev === candidate.id ? null : candidate.id))
            }
            role="button"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#6b7280]">#{candidate.rank}</span>
              <ScoreBar score={candidate.score} />
            </div>
            <p className="mt-2 text-sm font-semibold text-[#e5e5e5]">
              {candidate.name}
            </p>
            <p className="mt-2 text-xs text-[#6b7280]" title={candidate.summary}>
              {candidate.summary}
            </p>
            {expandedId === candidate.id ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase text-[#6b7280]">Matched Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {candidate.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[#1f1f1f] px-2 py-0.5 text-xs text-[#6366f1]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-[#6b7280]">Missing Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {candidate.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[#1f1f1f] px-2 py-0.5 text-xs text-[#ef4444]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-[#6b7280]">Resume Text</p>
                  <pre className="mt-2 max-h-50 overflow-y-auto rounded-md border border-[#1f1f1f] bg-[#0a0a0a] p-3 text-xs text-[#6b7280]">
{candidate.resumeText}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
