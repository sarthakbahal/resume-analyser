"use client";

type SortOrder = "score" | "name";

type SearchSortProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOrder: SortOrder;
  onSortChange: (value: SortOrder) => void;
};

export default function SearchSort({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
}: SearchSortProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#1f1f1f] pb-4 md:flex-row md:items-center md:justify-between">
      <input
        className="w-full md:max-w-sm rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
        placeholder="Search by name or skill..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => onSortChange("score")}
          className={`rounded-md border px-3 py-1.5 cursor-pointer ${
            sortOrder === "score"
              ? "border-[#6366f1] text-[#e5e5e5]"
              : "border-[#1f1f1f] text-[#6b7280]"
          }`}
        >
          Sort by Score
        </button>
        <button
          type="button"
          onClick={() => onSortChange("name")}
          className={`rounded-md border px-3 py-1.5 cursor-pointer ${
            sortOrder === "name"
              ? "border-[#6366f1] text-[#e5e5e5]"
              : "border-[#1f1f1f] text-[#6b7280]"
          }`}
        >
          Sort by Name
        </button>
      </div>
    </div>
  );
}
