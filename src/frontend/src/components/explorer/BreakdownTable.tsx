import { useMemo } from "react";
import { groupStats } from "../../stats/aggregate";
import {
  dimensionKey,
  dimensionLabel,
  dimensionOrder,
  dimensions,
  type Dimension,
} from "../../stats/dimensions";
import type { ResultFilter } from "../../stats/filter";
import type { TestResult } from "../../stats/normalize";
import { sessionPositions, splitSessions } from "../../stats/sessions";

interface BreakdownTableProps {
  /** Performance results in the current filter. */
  results: TestResult[];
  /** All results in the current filter, for session positions. */
  allResults: TestResult[];
  group: Dimension;
  onGroupChange: (group: Dimension) => void;
  onDrill: (patch: Partial<ResultFilter>) => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** The filter that narrows the Explorer to one breakdown row, where the filter model can express it. */
function drillFilter(group: Dimension, key: string): Partial<ResultFilter> | null {
  switch (group) {
    case "month": {
      const [y, m] = key.split("-").map(Number);
      const last = new Date(y, m, 0).getDate();
      return { period: undefined, from: `${key}-01`, to: `${y}-${pad(m)}-${pad(last)}` };
    }
    case "week": {
      const start = new Date(key + "T00:00:00");
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        period: undefined,
        from: key,
        to: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
      };
    }
    case "language":
      return { language: key };
    case "duration": {
      const [mode, mode2] = key.split(" ");
      return { mode, mode2: mode === "quote" ? undefined : mode2 };
    }
    default:
      return null;
  }
}

export function BreakdownTable({ results, allResults, group, onGroupChange, onDrill }: BreakdownTableProps) {
  const rows = useMemo(() => {
    const positions = sessionPositions(splitSessions(allResults));
    return groupStats(
      results,
      (r) => dimensionKey(group, r, (x) => positions.get(x.id)?.position ?? 0),
      (k) => dimensionLabel(group, k),
      dimensionOrder(group),
    );
  }, [results, allResults, group]);

  const maxAvg = Math.max(1, ...rows.map((r) => r.avgWpm));
  const minAvg = Math.min(...rows.map((r) => r.avgWpm), maxAvg);
  const floor = Math.max(0, minAvg - 10);
  const canDrill = drillFilter(group, rows[0]?.key ?? "") !== null;

  return (
    <section className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 sm:text-lg">Breakdown</h2>
          {canDrill ? <p className="text-xs text-zinc-400">Click a row to filter to it.</p> : null}
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          Group by
          <select
            value={group}
            onChange={(e) => onGroupChange(e.target.value as Dimension)}
            className="rounded-lg border border-zinc-700/60 bg-zinc-950/60 px-2 py-1.5 text-sm text-zinc-100"
          >
            {dimensions.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-zinc-400">
              <th className="px-2 py-2 font-medium">{dimensions.find((d) => d.key === group)?.label}</th>
              <th className="px-2 py-2 font-medium">Tests</th>
              <th className="px-2 py-2 font-medium w-2/5">Avg WPM</th>
              <th className="px-2 py-2 font-medium">Best</th>
              <th className="px-2 py-2 font-medium">Acc</th>
              <th className="px-2 py-2 font-medium">Cons</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row) => {
              const drill = drillFilter(group, row.key);
              return (
                <tr key={row.key} className="border-t border-zinc-800/70">
                  <td className="px-2 py-2 font-sans">
                    {drill ? (
                      <button type="button" onClick={() => onDrill(drill)} className="text-cyan-400 hover:text-cyan-300 hover:underline">
                        {row.label}
                      </button>
                    ) : (
                      <span className="text-zinc-200">{row.label}</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-zinc-300">{row.count}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-zinc-100">{row.avgWpm.toFixed(1)}</span>
                      <div
                        className="h-2 rounded-full bg-cyan-600"
                        style={{ width: `${Math.max(2, ((row.avgWpm - floor) / (maxAvg - floor)) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 text-zinc-300">{row.bestWpm.toFixed(1)}</td>
                  <td className="px-2 py-2 text-zinc-300">{row.avgAcc.toFixed(1)}%</td>
                  <td className="px-2 py-2 text-zinc-300">{row.avgConsistency.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
