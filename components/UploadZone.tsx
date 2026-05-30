"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UploadZoneProps = {
  onFiles: (files: File[]) => void;
  accept: string;
  multiple: boolean;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getAllowedExtensions = (accept: string): string[] =>
  accept
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.replace(".", "").toLowerCase());

const isAllowedType = (file: File, accept: string): boolean => {
  if (!accept) return true;
  const allowed = getAllowedExtensions(accept);
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (allowed.includes(extension)) return true;
  if (allowed.includes(file.type.toLowerCase())) return true;

  return false;
};

export default function UploadZone({ onFiles, accept, multiple }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const accepted: File[] = [];

      for (const file of list) {
        if (!isAllowedType(file, accept)) {
          setError("Unsupported format. Use PDF, DOC, or DOCX.");
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("File too large. Max 5MB.");
          continue;
        }
        accepted.push(file);
      }

      if (accepted.length) {
        onFiles(multiple ? accepted : [accepted[0]]);
      }
    },
    [accept, multiple, onFiles]
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer?.files?.length) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const onBrowse = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`cursor-pointer border border-dashed rounded-md px-6 py-10 text-center text-sm transition-colors ${
          isDragging ? "border-[#6366f1]" : "border-[#1f1f1f]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={onBrowse}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onBrowse();
          }
        }}
      >
        <p className="text-[#e5e5e5]">Drop files here or click to browse</p>
        <p className="mt-2 text-xs text-[#6b7280]">
          Accepted: PDF, DOC, DOCX
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          if (event.target.files) {
            handleFiles(event.target.files);
            event.target.value = "";
          }
        }}
      />
      {error ? (
        <p className="mt-2 text-xs text-[#ef4444]">{error}</p>
      ) : null}
    </div>
  );
}
