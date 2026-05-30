"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import JDInput from "@/components/JDInput";

type JDMode = "text" | "file";

type UploadResponse = {
  sessionId: string;
  candidateCount: number;
};

type AnalyzeResponse = {
  sessionId: string;
};

const MAX_FILES = 20;

const formatSize = (size: number): string => {
  const kb = size / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export default function HomePage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<File[]>([]);
  const [jdMode, setJdMode] = useState<JDMode>("text");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [statusStep, setStatusStep] = useState<number | null>(null);
  const [error, setError] = useState("");

  const canContinue = resumes.length > 0;

  const resumeCountText = useMemo(() => {
    if (resumes.length === 0) return "No resumes uploaded yet.";
    return `${resumes.length} resume${resumes.length > 1 ? "s" : ""} ready.`;
  }, [resumes.length]);

  const handleResumes = (files: File[]) => {
    setError("");
    setResumes((prev) => {
      const next = [...prev, ...files];
      return next.slice(0, MAX_FILES);
    });
  };

  const handleJDFile = (files: File[]) => {
    setError("");
    setJdFile(files[0] ?? null);
  };

  const removeResume = (index: number) => {
    setResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const statusText = useMemo(() => {
    if (statusStep === null) return "";
    const steps = [
      "Uploading...",
      "Parsing resumes...",
      "Scoring with AI...",
      "Done",
    ];
    return steps.slice(0, statusStep + 1).join(" → ");
  }, [statusStep]);

  const handleAnalyze = async () => {
    setError("");

    if (resumes.length === 0) {
      setError("Please upload at least one resume.");
      return;
    }

    if (jdMode === "text" && jdText.trim().length === 0) {
      setError("Please provide the job description.");
      return;
    }

    if (jdMode === "file" && !jdFile) {
      setError("Please upload a job description file.");
      return;
    }

    try {
      setStatusStep(0);
      const formData = new FormData();
      resumes.forEach((file) => formData.append("files", file));
      formData.append("jdText", jdMode === "text" ? jdText : "");
      if (jdMode === "file" && jdFile) {
        formData.append("jdFile", jdFile);
      }

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json()) as { message?: string };
        throw new Error(payload.message || "Upload failed.");
      }

      const uploadData = (await uploadResponse.json()) as UploadResponse;
      setStatusStep(1);

      setStatusStep(2);
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: uploadData.sessionId }),
      });

      if (!analyzeResponse.ok) {
        const payload = (await analyzeResponse.json()) as { message?: string };
        throw new Error(payload.message || "Analysis failed.");
      }

      const analyzeData = (await analyzeResponse.json()) as AnalyzeResponse;
      setStatusStep(3);
      router.push(`/results?sessionId=${analyzeData.sessionId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setStatusStep(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-[#e5e5e5]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Resume Screening
          </h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Upload resumes and a job description to generate ranked candidates.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#e5e5e5]">
              Step 1 — Upload Resumes
            </h2>
            <p className="text-xs text-[#6b7280]">Max {MAX_FILES} files</p>
          </div>
          <UploadZone
            accept=".pdf,.doc,.docx"
            multiple={true}
            onFiles={handleResumes}
          />
          <p className="text-xs text-[#6b7280]">{resumeCountText}</p>
          <div className="space-y-2">
            {resumes.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between border border-[#1f1f1f] px-3 py-2 text-sm"
              >
                <div>
                  <p className="text-[#e5e5e5]">{file.name}</p>
                  <p className="text-xs text-[#6b7280]">
                    {formatSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeResume(index)}
                  className="cursor-pointer text-xs text-[#ef4444]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {canContinue ? (
            <button
              type="button"
              onClick={() =>
                document.getElementById("jd-step")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="cursor-pointer text-xs text-[#6366f1]"
            >
              Continue →
            </button>
          ) : null}
        </section>

        <section id="jd-step" className="space-y-4">
          <h2 className="text-sm font-semibold text-[#e5e5e5]">
            Step 2 — Job Description
          </h2>
          <JDInput
            mode={jdMode}
            jdText={jdText}
            onModeChange={setJdMode}
            onTextChange={setJdText}
            onFiles={handleJDFile}
            jdFileName={jdFile?.name ?? null}
          />
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full cursor-pointer rounded-md bg-[#6366f1] px-4 py-2 text-sm font-medium text-white"
          >
            Analyze Candidates
          </button>
          {statusText ? (
            <p className="text-xs text-[#6b7280]">{statusText}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-[#ef4444]">{error}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
