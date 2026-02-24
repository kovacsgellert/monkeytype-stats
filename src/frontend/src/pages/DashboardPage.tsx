import { useState, useMemo, useCallback } from "react";
import { useResults } from "../hooks/useResults";
import { ResultsTable } from "../components/ResultsTable";
import { StatsSummary } from "../components/StatsSummary";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ModeFilter } from "../components/ModeFilter";
import { LanguageFilter } from "../components/LanguageFilter";
import { PeriodFilter } from "../components/PeriodFilter";
import { ResultsChart } from "../components/ResultsChart";
import { ResultDetailsModal } from "../components/ResultDetailsModal";
import type { Result } from "../types/result";
import { useResultDetails } from "../hooks/useResultDetails";

export function DashboardPage() {
  const resultsQuery = useResults();
  const resultsData = useMemo(
    () => resultsQuery.data?.data ?? [],
    [resultsQuery.data?.data],
  );
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedMode2, setSelectedMode2] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const selectedResultId = selectedResult?.id ?? null;
  const resultDetailsQuery = useResultDetails(selectedResultId);

  // Unique years derived from the data, sorted descending
  const years = useMemo(() => {
    const unique = [
      ...new Set(resultsData.map((r) => new Date(r.timestamp).getFullYear())),
    ];
    return unique.sort((a, b) => b - a);
  }, [resultsData]);

  // Unique top-level modes (e.g. "time", "words", "quote")
  const modes = useMemo(() => {
    return [...new Set(resultsData.map((r) => r.mode))].sort();
  }, [resultsData]);

  // Mode2 options for the currently selected mode
  const mode2Options = useMemo(() => {
    if (selectedMode === null) return [];
    // Quote mode has no meaningful mode2 distinction
    if (selectedMode === "quote") return [];
    const options = [
      ...new Set(
        resultsData.filter((r) => r.mode === selectedMode).map((r) => r.mode2),
      ),
    ];
    return options.sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [resultsData, selectedMode]);

  // When mode changes, reset mode2
  const handleModeChange = useCallback((mode: string | null) => {
    setSelectedMode(mode);
    setSelectedMode2(null);
  }, []);

  // Unique languages derived from the data (null/missing treated as "english")
  const languages = useMemo(() => {
    const unique = [
      ...new Set(resultsData.map((r) => r.language ?? "english")),
    ];
    return unique.sort();
  }, [resultsData]);

  const filteredResults = useMemo(() => {
    let results = resultsData;
    if (selectedPeriod === "last-month") {
      const now = new Date();
      const cutoff = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      );
      results = results.filter((r) => new Date(r.timestamp) >= cutoff);
    } else if (selectedPeriod !== null) {
      const year = Number(selectedPeriod);
      results = results.filter(
        (r) => new Date(r.timestamp).getFullYear() === year,
      );
    }
    if (selectedMode !== null) {
      results = results.filter((r) => r.mode === selectedMode);
    }
    if (selectedMode2 !== null) {
      results = results.filter((r) => r.mode2 === selectedMode2);
    }
    if (selectedLanguage !== null) {
      results = results.filter(
        (r) => (r.language ?? "english") === selectedLanguage,
      );
    }
    return results;
  }, [
    resultsData,
    selectedPeriod,
    selectedMode,
    selectedMode2,
    selectedLanguage,
  ]);

  const handleResultSelect = useCallback((result: Result) => {
    setSelectedResult(result);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedResult(null);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Dashboard</h2>
          <p className="text-sm text-zinc-500">
            Explore your recent results and trends.
          </p>
        </div>
        <button
          onClick={() => resultsQuery.refetch()}
          disabled={resultsQuery.isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm font-medium text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 ${resultsQuery.isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {resultsQuery.isLoading ? (
        <LoadingSkeleton />
      ) : resultsQuery.isError ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            Failed to load results
          </h2>
          <p className="text-zinc-500 mb-6 text-center max-w-md">
            {resultsQuery.error instanceof Error
              ? resultsQuery.error.message
              : "An unexpected error occurred"}
          </p>
          <button
            onClick={() => resultsQuery.refetch()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            Try Again
          </button>
        </div>
      ) : resultsData.length ? (
        <>
          <PeriodFilter
            years={years}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
          <ModeFilter
            modes={modes}
            selectedMode={selectedMode}
            onModeChange={handleModeChange}
            mode2Options={mode2Options}
            selectedMode2={selectedMode2}
            onMode2Change={setSelectedMode2}
          />
          <LanguageFilter
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
          <StatsSummary results={filteredResults} />
          <ResultsChart results={filteredResults} />
          <ResultsTable
            results={filteredResults}
            onSelectResult={handleResultSelect}
          />
        </>
      ) : null}

      {selectedResult ? (
        <ResultDetailsModal
          details={resultDetailsQuery.data?.data ?? null}
          isLoading={resultDetailsQuery.isLoading}
          error={
            resultDetailsQuery.isError
              ? resultDetailsQuery.error instanceof Error
                ? resultDetailsQuery.error.message
                : "Failed to load result details."
              : resultDetailsQuery.data?.isValid === false
                ? (resultDetailsQuery.data.errors[0] ??
                  "Failed to load result details.")
                : null
          }
          onClose={handleCloseDetails}
        />
      ) : null}
    </>
  );
}
