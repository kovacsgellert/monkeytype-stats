import { useState, useMemo } from "react";
import type { Result } from "../types/result";
import { formatLanguage } from "../types/result";

interface ResultsTableProps {
  results: Result[];
}

type SortColumn = "wpm" | "acc" | "consistency" | "timestamp" | null;
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWpmColor(wpm: number): string {
  if (wpm >= 120) return "text-emerald-400";
  if (wpm >= 100) return "text-cyan-400";
  if (wpm >= 80) return "text-blue-400";
  if (wpm >= 60) return "text-amber-400";
  return "text-rose-400";
}

function getAccuracyColor(acc: number): string {
  if (acc >= 98) return "text-emerald-400";
  if (acc >= 95) return "text-cyan-400";
  if (acc >= 90) return "text-amber-400";
  return "text-rose-400";
}

function getConsistencyColor(consistency: number): string {
  if (consistency >= 90) return "text-emerald-400";
  if (consistency >= 75) return "text-cyan-400";
  if (consistency >= 60) return "text-amber-400";
  return "text-rose-400";
}

interface SortableHeaderProps {
  label: string;
  column: SortColumn;
  currentSort: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
}

function SortableHeader({
  label,
  column,
  currentSort,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort === column;

  return (
    <th
      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <span className={`transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}>
          {direction === "desc" ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </span>
      </div>
    </th>
  );
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else {
        // Reset sorting
        setSortColumn(null);
        setSortDirection("desc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
    setCurrentPage(0);
  };

  const sortedResults = useMemo(() => {
    if (!sortColumn) return results;

    return [...results].sort((a, b) => {
      const modifier = sortDirection === "desc" ? -1 : 1;
      
      if (sortColumn === "timestamp") {
        const aVal = new Date(a.timestamp).getTime();
        const bVal = new Date(b.timestamp).getTime();
        return (aVal - bVal) * modifier;
      }
      
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      return (aVal - bVal) * modifier;
    });
  }, [results, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedResults.length / pageSize);
  const paginatedResults = sortedResults.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-zinc-500 text-lg">No results found</div>
        <div className="text-zinc-600 text-sm mt-2">
          Complete some typing tests to see your stats here
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm shadow-2xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/80">
              <SortableHeader
                label="WPM"
                column="wpm"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Raw
              </th>
              <SortableHeader
                label="Accuracy"
                column="acc"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Consistency"
                column="consistency"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={handleSort}
              />
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Mode
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Language
              </th>
              <SortableHeader
                label="Date"
                column="timestamp"
                currentSort={sortColumn}
                direction={sortDirection}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {paginatedResults.map((result, index) => (
              <tr
                key={result.id}
                className="group transition-all duration-200 hover:bg-zinc-800/30"
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`font-mono text-lg font-bold ${getWpmColor(result.wpm)}`}
                  >
                    {Math.round(result.wpm)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-zinc-400">
                    {Math.round(result.rawWpm)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`font-mono font-medium ${getAccuracyColor(result.acc)}`}
                  >
                    {result.acc.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`font-mono font-medium ${getConsistencyColor(result.consistency)}`}
                  >
                    {result.consistency.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-3 py-1 text-xs font-medium text-zinc-300">
                    {result.mode === "quote" ? (
                      <span className="capitalize">Quote</span>
                    ) : (
                      <>
                        <span className="capitalize">{result.mode}</span>
                        <span className="text-zinc-500">{result.mode2}</span>
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-zinc-400">
                    {formatLanguage(result.language || "english")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-zinc-500">
                    {formatDate(result.timestamp)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="border-t border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Show:</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => handlePageSizeChange(size)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pageSize === size
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">
            {currentPage * pageSize + 1}-
            {Math.min((currentPage + 1) * pageSize, sortedResults.length)} of{" "}
            {sortedResults.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
