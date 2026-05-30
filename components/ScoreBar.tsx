import React from "react";

type ScoreBarProps = {
  score: number;
};

const getScoreColor = (score: number): string => {
  if (score > 70) return "bg-[#22c55e]";
  if (score >= 40) return "bg-[#f59e0b]";
  return "bg-[#ef4444]";
};

const widthClasses: Record<number, string> = {
  0: "w-[0%]",
  5: "w-[5%]",
  10: "w-[10%]",
  15: "w-[15%]",
  20: "w-[20%]",
  25: "w-[25%]",
  30: "w-[30%]",
  35: "w-[35%]",
  40: "w-[40%]",
  45: "w-[45%]",
  50: "w-[50%]",
  55: "w-[55%]",
  60: "w-[60%]",
  65: "w-[65%]",
  70: "w-[70%]",
  75: "w-[75%]",
  80: "w-[80%]",
  85: "w-[85%]",
  90: "w-[90%]",
  95: "w-[95%]",
  100: "w-[100%]",
};

export default function ScoreBar({ score }: ScoreBarProps) {
  const width = Math.max(0, Math.min(100, score));
  const rounded = Math.round(width / 5) * 5;
  const widthClass = widthClasses[rounded] ?? "w-[0%]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-sm bg-[#1f1f1f]">
        <div className={`h-1.5 rounded-sm ${getScoreColor(score)} ${widthClass}`} />
      </div>
      <span className="text-xs font-mono text-[#e5e5e5]">{score}</span>
    </div>
  );
}
