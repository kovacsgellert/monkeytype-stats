import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { BreakdownTable } from "../components/explorer/BreakdownTable";
import { ExplorerChart } from "../components/explorer/ExplorerChart";
import { FilterBar } from "../components/explorer/FilterBar";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ResultDetailsModal } from "../components/ResultDetailsModal";
import { ResultsTable } from "../components/ResultsTable";
import { EmptyState, StatTile } from "../components/ui";
import { formatDate, formatNumber, signed } from "../utils/format";
import { useProfile } from "../hooks/useProfile";
import { useResultDetails } from "../hooks/useResultDetails";
import { useSavedViewMutations, useSavedViews } from "../hooks/useSavedViews";
import { useTestResults } from "../hooks/useTestResults";
import type { ExplorerSearch } from "../router";
import { learningRate, max, mean, recentVsPrevious, totalHours } from "../stats/aggregate";
import { applyFilter, filterKey, isEmptyFilter, sanitizeFilter } from "../stats/filter";
import { isPerformance } from "../stats/normalize";
import { cohortKey } from "../stats/tracks";
import type { Result } from "../types/result";

const routeApi = getRouteApi("/explorer");

const DEFAULT_WINDOWS = [10, 100];

function parseWindows(avg: string | undefined): number[] {
  if (avg === undefined) return DEFAULT_WINDOWS;
  if (avg === "none") return [];
  return avg
    .split(",")
    .map(Number)
    .filter((n) => [10, 20, 100].includes(n));
}

export function ExplorerPage() {
  const search = routeApi.useSearch();
  const navigate = useNavigate({ from: "/explorer" });
  const { query, results, tracks } = useTestResults();
  const profileQuery = useProfile();
  const savedViewsQuery = useSavedViews();
  const savedViewMutations = useSavedViewMutations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const resultDetailsQuery = useResultDetails(selectedId);

  const filter = useMemo(() => sanitizeFilter(search as Record<string, unknown>), [search]);
  const tags = profileQuery.data?.tags ?? [];

  const setSearch = useCallback(
    (patch: Partial<ExplorerSearch>) =>
      navigate({
        search: (prev) => {
          const next: Record<string, unknown> = { ...prev, ...patch };
          for (const key of Object.keys(next)) if (next[key] === undefined) delete next[key];
          return next as ExplorerSearch;
        },
        replace: true,
        resetScroll: false,
      }),
    [navigate],
  );

  const filtered = useMemo(() => applyFilter(results, filter), [results, filter]);
  const perf = useMemo(() => filtered.filter(isPerformance), [filtered]);
  const rawById = useMemo(
    () => new Map((query.data?.data ?? []).map((r) => [r.id, r])),
    [query.data?.data],
  );
  // newest first, like the table always showed
  const tableResults = useMemo(
    () => filtered.map((r) => rawById.get(r.id)).filter((r): r is Result => r !== undefined).reverse(),
    [filtered, rawById],
  );

  const kpis = useMemo(() => {
    const wpms = perf.map((r) => r.wpm);
    const { recent, previous } = recentVsPrevious(wpms, 20);
    const singleCohort = new Set(perf.map(cohortKey)).size === 1;
    const rate = singleCohort && perf.length >= 50 ? learningRate(perf) : null;
    return {
      avg: mean(wpms),
      best: max(wpms),
      recent,
      previous,
      acc: mean(perf.map((r) => r.acc)),
      cons: mean(perf.map((r) => r.consistency)),
      singleCohort,
      rate,
      hours: totalHours(filtered),
    };
  }, [perf, filtered]);

  // previous/next step through the filtered tests by date
  const selectedIndex = selectedId === null ? -1 : filtered.findIndex((r) => r.id === selectedId);
  const selectedResult = selectedIndex >= 0 ? filtered[selectedIndex] : null;
  const closeDetails = useCallback(() => setSelectedId(null), []);
  const olderId = selectedIndex > 0 ? filtered[selectedIndex - 1].id : null;
  const newerId = selectedIndex >= 0 && selectedIndex < filtered.length - 1 ? filtered[selectedIndex + 1].id : null;
  const showOlder = useMemo(() => (olderId ? () => setSelectedId(olderId) : null), [olderId]);
  const showNewer = useMemo(() => (newerId ? () => setSelectedId(newerId) : null), [newerId]);

  const handleSaveView = () => {
    if (isEmptyFilter(filter)) {
      window.alert("Pick some filters first — an empty view would just show everything.");
      return;
    }
    const name = window.prompt("Name this view:");
    if (!name?.trim()) return;
    savedViewMutations.create.mutate({ name: name.trim(), filter });
  };

  const handleDeleteView = (view: { id: string; name: string }) => {
    if (window.confirm(`Delete the saved view "${view.name}"?`)) savedViewMutations.remove.mutate(view.id);
  };

  const mutationError =
    savedViewMutations.create.error ?? savedViewMutations.remove.error ?? null;

  if (query.isLoading) return <LoadingSkeleton />;
  if (query.isError)
    return (
      <EmptyState title="Failed to load results">
        {query.error instanceof Error ? query.error.message : "An unexpected error occurred"}
      </EmptyState>
    );
  if (results.length === 0)
    return (
      <EmptyState title="No results yet">
        Import your Monkeytype results from the Settings page to get started.
      </EmptyState>
    );

  const windows = parseWindows(search.avg);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Explorer</h2>
          <p className="text-sm text-zinc-400">Filter, chart and drill into every result.</p>
        </div>
        <p className="text-sm text-zinc-400">
          {formatNumber(filtered.length)} tests · {kpis.hours.toFixed(1)} h
          {filtered.length > 0
            ? ` · ${formatDate(filtered[0].date)} – ${formatDate(filtered[filtered.length - 1].date)}`
            : ""}
        </p>
      </div>

      {/* sticks right below the 89px nav from sm up; on phones it wraps to several rows, so it scrolls away */}
      <div className="relative z-10 sm:sticky sm:top-[89px]">
        <FilterBar
          results={results}
          filter={filter}
          tags={tags}
          tracks={tracks}
          savedViews={savedViewsQuery.data ?? []}
          onChange={(patch) => setSearch(patch)}
          onReset={() =>
            navigate({
              search: (prev) => ({ metric: prev.metric, x: prev.x, group: prev.group, avg: prev.avg, pb: prev.pb, trend: prev.trend }),
              replace: true,
              resetScroll: false,
            })
          }
          onSaveView={handleSaveView}
          onDeleteView={handleDeleteView}
          savingView={savedViewMutations.create.isPending}
        />
        {mutationError ? (
          <p role="alert" className="mt-2 text-sm text-rose-400">
            {mutationError.message}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-6">
          {perf.length === 0 ? (
            <EmptyState title="No tests match these filters">
              <button
                type="button"
                onClick={() => navigate({ search: {}, replace: true })}
                className="text-cyan-400 hover:text-cyan-300"
              >
                Clear all filters
              </button>
            </EmptyState>
          ) : (
            <>
              <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile label="Avg WPM" value={kpis.avg!.toFixed(1)} color="text-cyan-400" />
                <StatTile label="Best WPM" value={kpis.best!.toFixed(1)} color="text-emerald-400" />
                <StatTile
                  label="Last 20"
                  value={kpis.recent!.toFixed(1)}
                  sub={kpis.previous !== null ? `${signed(kpis.recent! - kpis.previous)} vs prior 20` : undefined}
                  color="text-cyan-300"
                />
                <StatTile label="Accuracy" value={`${kpis.acc!.toFixed(1)}%`} color="text-amber-400" />
                <StatTile label="Consistency" value={`${kpis.cons!.toFixed(1)}%`} color="text-purple-400" />
                <StatTile
                  label="Learning rate"
                  value={kpis.rate ? `${signed(kpis.rate.wpmPerHour)}/h` : "—"}
                  sub={
                    kpis.rate
                      ? "WPM per recorded hour"
                      : kpis.singleCohort
                        ? "needs 50+ tests"
                        : "mixed settings — pick one track"
                  }
                />
              </section>

              <ExplorerChart
                results={perf}
                metric={search.metric ?? "wpm"}
                xAxis={search.x ?? "test"}
                windows={windows}
                showPbs={search.pb !== false}
                showTrend={search.trend === true}
                onChange={(patch) =>
                  setSearch({
                    metric: patch.metric ?? search.metric,
                    x: patch.x ?? search.x,
                    avg:
                      patch.windows === undefined
                        ? search.avg
                        : patch.windows.length === 0
                          ? "none"
                          : patch.windows.join(",") === DEFAULT_WINDOWS.join(",")
                            ? undefined
                            : patch.windows.join(","),
                    pb: patch.pb === undefined ? search.pb : patch.pb ? undefined : false,
                    trend: patch.trend === undefined ? search.trend : patch.trend || undefined,
                  })
                }
              />

              <BreakdownTable
                results={perf}
                allResults={filtered}
                group={search.group ?? "month"}
                onGroupChange={(group) => setSearch({ group })}
                onDrill={(patch) => setSearch(patch)}
              />

              <ResultsTable
                key={filterKey(filter)}
                results={tableResults}
                onSelectResult={(r) => setSelectedId(r.id)}
              />
            </>
          )}
      </div>

      {selectedResult ? (
        <ResultDetailsModal
          result={selectedResult}
          results={results}
          onPrevious={showOlder}
          onNext={showNewer}
          details={resultDetailsQuery.data?.data ?? null}
          isLoading={resultDetailsQuery.isLoading}
          error={
            resultDetailsQuery.isError
              ? resultDetailsQuery.error instanceof Error
                ? resultDetailsQuery.error.message
                : "Failed to load result details."
              : resultDetailsQuery.data?.isValid === false
                ? (resultDetailsQuery.data.errors[0] ?? "Failed to load result details.")
                : null
          }
          onClose={closeDetails}
        />
      ) : null}
    </div>
  );
}
