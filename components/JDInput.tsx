"use client";

import UploadZone from "@/components/UploadZone";

type JDMode = "text" | "file";

type JDInputProps = {
  mode: JDMode;
  jdText: string;
  onModeChange: (mode: JDMode) => void;
  onTextChange: (value: string) => void;
  onFiles: (files: File[]) => void;
  jdFileName?: string | null;
};

export default function JDInput({
  mode,
  jdText,
  onModeChange,
  onTextChange,
  onFiles,
  jdFileName,
}: JDInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-sm">
        <button
          type="button"
          onClick={() => onModeChange("text")}
          className={`pb-1 border-b-2 ${
            mode === "text" ? "border-[#6366f1] text-[#e5e5e5]" : "border-transparent text-[#6b7280]"
          }`}
        >
          Type JD
        </button>
        <button
          type="button"
          onClick={() => onModeChange("file")}
          className={`pb-1 border-b-2 ${
            mode === "file" ? "border-[#6366f1] text-[#e5e5e5]" : "border-transparent text-[#6b7280]"
          }`}
        >
          Upload JD
        </button>
      </div>

      {mode === "text" ? (
        <textarea
          className="w-full min-h-50 rounded-md border border-[#1f1f1f] bg-[#0a0a0a] p-3 text-sm text-[#e5e5e5] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
          rows={8}
          placeholder="Paste the job description here..."
          value={jdText}
          onChange={(event) => onTextChange(event.target.value)}
        />
      ) : (
        <div className="space-y-2">
          <UploadZone
            accept=".pdf,.doc,.docx"
            multiple={false}
            onFiles={onFiles}
          />
          {jdFileName ? (
            <p className="text-xs text-[#6b7280]">Selected: {jdFileName}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
