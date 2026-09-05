import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Result } from "../types/result";
import { formatLanguage } from "../utils/languageUtils";

interface ActivityHeatmapProps {
  results: Result[];
}

// "12m" = last 12 months, otherwise a UTC year like "2026".
type RangeKey = string;

// Cell colors (dark -> light cyan), matching the app's zinc/cyan theme.
const levelClasses = [
  "bg-zinc-800/50",
  "bg-cyan-950",
  "bg-cyan-800",
  "bg-cyan-500",
  "bg-cyan-300",
];

// Pill styles shared with the dashboard filters.
const pillBase =
  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200";
const pillActive = "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50";
const pillInactive =
  "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300";

// Fixed layout metrics (px) for the fluid grid.
const LABEL_COL_WIDTH = 80; // w-20
const LABEL_GRID_GAP = 24; // gap-6
const MAX_CELL = 16;

function dateKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

// Monday = 0 ... Sunday = 6
function mondayIndexUTC(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

function addDaysUTC(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function getLevel(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 4) return Math.min(count, 4);
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function ActivityHeatmap({ results }: ActivityHeatmapProps) {
  const [range, setRange] = useState<RangeKey>("12m");

  // Years with actual activity (UTC), newest first.
  const years = useMemo(() => {
    const unique = new Set<number>();
    for (const r of results) {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) unique.add(d.getUTCFullYear());
    }
    return [...unique].sort((a, b) => b - a);
  }, [results]);

  // Dashboard filters can remove the selected year; fall back to 12m then.
  useEffect(() => {
    if (range !== "12m" && !years.includes(Number(range))) {
      setRange("12m");
    }
  }, [range, years]);

  const { weeks, counts, byDay, totalTests } = useMemo(() => {
    const counts = new Map<string, number>();
    const byDay = new Map<string, Result[]>();
    for (const r of results) {
      const d = new Date(r.timestamp);
      if (isNaN(d.getTime())) continue;
      const key = dateKeyUTC(d);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      const list = byDay.get(key);
      if (list) list.push(r);
      else byDay.set(key, [r]);
    }

    const today = startOfTodayUTC();
    let windowStart: Date;
    let windowEnd: Date;
    if (range === "12m") {
      windowStart = new Date(today);
      windowStart.setUTCFullYear(windowStart.getUTCFullYear() - 1);
      windowEnd = today;
    } else {
      const year = Number(range);
      windowStart = new Date(Date.UTC(year, 0, 1));
      windowEnd = new Date(Date.UTC(year, 11, 31));
    }

    // Drop days outside the selected window so counts match the range.
    const startKey = dateKeyUTC(windowStart);
    const endKey = dateKeyUTC(windowEnd);
    for (const key of [...counts.keys()]) {
      if (key < startKey || key > endKey) {
        counts.delete(key);
        byDay.delete(key);
      }
    }

    // Align to full Mon-Sun weeks for stable columns.
    const startMonday = addDaysUTC(windowStart, -mondayIndexUTC(windowStart));
    const endSunday = addDaysUTC(windowEnd, 6 - mondayIndexUTC(windowEnd));

    const weeks: Date[][] = [];
    let cursor = startMonday;
    while (cursor <= endSunday) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(addDaysUTC(cursor, i));
      }
      weeks.push(week);
      cursor = addDaysUTC(cursor, 7);
    }

    let totalTests = 0;
    for (const c of counts.values()) totalTests += c;

    return { weeks, counts, byDay, totalTests };
  }, [results, range]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Breakdown of the selected day grouped by language + mode + mode2,
  // most tests first.
  const selectedBreakdown = useMemo(() => {
    if (selectedDay === null) return null;
    const dayResults = byDay.get(selectedDay) ?? [];
    const groups = new Map<string, number>();
    for (const r of dayResults) {
      // Quote mode has no meaningful mode2 distinction (it's the quote id).
      const label =
        r.mode === "quote"
          ? `${formatLanguage(r.language ?? "english")} quote`
          : `${formatLanguage(r.language ?? "english")} ${r.mode} ${r.mode2}`.trim();
      groups.set(label, (groups.get(label) ?? 0) + 1);
    }
    return {
      total: dayResults.length,
      groups: [...groups.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [selectedDay, byDay]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const c of counts.values()) max = Math.max(max, c);
    return max;
  }, [counts]);

  // Fluid cell sizing so the whole grid fits without scrolling.
  // Callback ref: the grid may mount after results load, so observe on attach.
  const [gridOuterWidth, setGridOuterWidth] = useState(0);
  const observeGridWidth = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      setGridOuterWidth(entries[0].contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { cellSize, colGap, showLabels } = useMemo(() => {
    const weekCount = weeks.length || 1;
    const withLabels =
      Math.floor(
        (gridOuterWidth - LABEL_COL_WIDTH - LABEL_GRID_GAP - (weekCount - 1) * 4) /
          weekCount,
      ) >= 12;
    const available = withLabels
      ? gridOuterWidth - LABEL_COL_WIDTH - LABEL_GRID_GAP
      : gridOuterWidth;
    const roomy = Math.floor((available - (weekCount - 1) * 4) / weekCount);
    if (roomy >= 6) {
      return {
        cellSize: Math.min(roomy, MAX_CELL),
        colGap: 4,
        showLabels: withLabels,
      };
    }
    const tight = Math.floor((available - (weekCount - 1) * 2) / weekCount);
    return {
      cellSize: Math.max(Math.min(tight, MAX_CELL), 2),
      colGap: 2,
      showLabels: withLabels,
    };
  }, [gridOuterWidth, weeks.length]);

  if (results.length === 0) return null;

  const todayKey = dateKeyUTC(startOfTodayUTC());
  const selectedLabel = range === "12m" ? "last 12 months" : range;

  return (
    <div className="mb-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[{ key: "12m", label: "last 12 months" }]
          .concat(years.map((y) => ({ key: String(y), label: String(y) })))
          .map((o) => (
            <button
              key={o.key}
              onClick={() => setRange(o.key)}
              className={`${pillBase} ${range === o.key ? pillActive : pillInactive}`}
            >
              {o.label}
            </button>
          ))}
      </div>

      <div className="overflow-x-auto overflow-y-hidden" ref={observeGridWidth}>
        <div
          className="flex gap-6"
          role="img"
          aria-label={`Test activity heatmap for ${selectedLabel}: ${totalTests} tests`}
        >
          {showLabels ? (
            <div
              className="grid grid-rows-7 w-20 shrink-0 text-sm text-zinc-500"
              style={{ rowGap: colGap }}
            >
              {[
                "monday",
                "",
                "wednesday",
                "",
                "friday",
                "",
                "sunday",
              ].map((label, i) => (
                <div
                  key={i}
                  className="flex items-center pr-1 whitespace-nowrap leading-none overflow-hidden"
                  style={{ height: cellSize, fontSize: Math.min(14, cellSize) }}
                >
                  {label}
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-1" style={{ columnGap: colGap }}>
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="grid grid-rows-7"
                style={{ rowGap: colGap }}
              >
                {week.map((day, di) => {
                  const key = dateKeyUTC(day);
                  const count = counts.get(key) ?? 0;
                  const isFuture = key > todayKey;
                  const level = isFuture ? 0 : getLevel(count, maxCount);
                  const label = day.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  });
                  return (
                    <button
                      key={di}
                      type="button"
                      disabled={isFuture}
                      onClick={() => setSelectedDay(key)}
                      title={
                        isFuture
                          ? undefined
                          : `${count} ${count === 1 ? "test" : "tests"} on ${label}`
                      }
                      aria-label={
                        isFuture
                          ? undefined
                          : `${count} ${count === 1 ? "test" : "tests"} on ${label}`
                      }
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderRadius: Math.max(
                          1,
                          Math.min(4, cellSize / 3),
                        ),
                      }}
                      className={`${levelClasses[level]} ${isFuture ? "opacity-30 cursor-default" : "cursor-pointer hover:ring-1 hover:ring-cyan-300/70"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDay && selectedBreakdown
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedDay(null)}
            >
          <div
            className="w-full max-w-sm mx-4 rounded-3xl border border-zinc-800/80 bg-zinc-950/90 shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Activity on ${selectedDay}`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">
                  Day Activity
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(`${selectedDay}T00:00:00Z`).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    },
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-full border border-zinc-700/60 bg-zinc-900/60 p-2 text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-200"
                aria-label="Close day activity"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3 mb-3">
                <span className="text-sm text-zinc-500">Total tests</span>
                <span className="text-xl font-bold text-zinc-100">
                  {selectedBreakdown.total}
                </span>
              </div>
              {selectedBreakdown.groups.length > 0 ? (
                <ul className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 divide-y divide-zinc-800/60">
                  {selectedBreakdown.groups.map(([mode, count]) => (
                    <li
                      key={mode}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className="text-zinc-300">{mode}</span>
                      <span className="text-zinc-500">
                        {count} {count === 1 ? "test" : "tests"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 text-center">
                  No tests on this day.
                </p>
              )}
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}
