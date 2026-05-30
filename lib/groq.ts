import Groq from "groq-sdk";

export type ScoreResult = {
  name: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
};

const SYSTEM_PROMPT = `
You are a resume screening engine. You receive a job description and 
a candidate's resume text. You return ONLY a JSON object — no 
explanation, no markdown, no prose. Just the raw JSON.

Return this exact shape:
{
  "name": "candidate full name or 'Unknown' if not found",
  "score": <integer 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "summary": "One sentence on why this candidate fits or doesn't."
}

Scoring criteria (apply in this order, these weights are strict):
- Skills match:         35 points max
- Experience relevance: 30 points max  
- Education alignment:  20 points max
- Keyword similarity:   15 points max

Be calibrated. A 90+ score means the candidate is an exceptionally 
strong fit. A 50 means mediocre. A 20 means poor fit. Do not inflate.
`;

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

const defaultNameFromFile = (fileName: string): string => {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "");
  return withoutExt.trim() || "Unknown";
};

const defaultResult = (fileName: string, summary: string): ScoreResult => ({
  name: defaultNameFromFile(fileName),
  score: 0,
  matchedSkills: [],
  missingSkills: [],
  summary,
});

const isGenericName = (name: string): boolean => {
  const normalized = name.trim().toLowerCase();
  return (
    normalized === "john doe" ||
    normalized === "jane doe" ||
    normalized === "unknown" ||
    normalized === "candidate" ||
    normalized === "n/a" ||
    normalized === "na"
  );
};

const normalizeSummaryName = (summary: string, name: string): string => {
  const cleaned = summary.trim();
  if (!cleaned) return cleaned;
  return cleaned
    .replace(/\bJohn Doe\b/gi, name)
    .replace(/\bJane Doe\b/gi, name)
    .replace(/\bCandidate\b/gi, name);
};

export const scoreResume = async (
  jdText: string,
  resumeText: string,
  fileName: string
): Promise<ScoreResult> => {
  if (!process.env.GROQ_API_KEY) {
    return defaultResult(fileName, "Scoring failed — check API key");
  }

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jdText}\n\nRESUME:\n${resumeText}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(content) as ScoreResult;
      const fallbackName = defaultNameFromFile(fileName);
      const resolvedName =
        parsed.name && !isGenericName(parsed.name) ? parsed.name : fallbackName;
      return {
        name: resolvedName,
        score: Number.isFinite(parsed.score) ? Math.round(parsed.score) : 0,
        matchedSkills: Array.isArray(parsed.matchedSkills)
          ? parsed.matchedSkills
          : [],
        missingSkills: Array.isArray(parsed.missingSkills)
          ? parsed.missingSkills
          : [],
        summary: normalizeSummaryName(parsed.summary || "", resolvedName),
      };
    } catch {
      return defaultResult(fileName, "Scoring failed — invalid response");
    }
  } catch {
    return defaultResult(fileName, "Scoring failed — check API key");
  }
};
