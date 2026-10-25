import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartDataset,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { testLabel } from "../stats/dimensions";
import type { TestResult } from "../stats/normalize";
import { analyzePace, resultContext } from "../stats/resultAnalysis";
import type { ResultDetails } from "../types/result";
import { formatNumber, signed } from "../utils/format";
import { formatLanguage } from "../utils/languageUtils";
import { Pill } from "./ui";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

interface ResultDetailsModalProps {
  /** The selected test, available immediately from the results list. */
  result: TestResult;
  /** All results, for comparing this test with your usual. */
  results: TestResult[];
  /** Per-second chart data and key timings, fetched on demand. */
  details: ResultDetails | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onPrevious: (() => void) | null;
  onNext: (() => void) | null;
}

const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

function Badge({ children, tone }: { children: React.ReactNode; tone: "amber" | "emerald" | "zinc" }) {
  const tones = {
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</div>
      <div className={`mt-1 font-mono text-3xl font-bold ${color}`}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-zinc-400">{sub}</div> : null}
    </div>
  );
}

function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="mt-0.5 font-mono text-lg font-semibold text-zinc-100">{value}</div>
      {note ? <div className="text-xs text-zinc-400">{note}</div> : null}
    </div>
  );
}

const charSegments = [
  { label: "Correct", color: "bg-cyan-500" },
  { label: "Incorrect", color: "bg-rose-500" },
  { label: "Extra", color: "bg-amber-400" },
  { label: "Missed", color: "bg-zinc-500" },
];

export function ResultDetailsModal({
  result,
  results,
  details,
  isLoading,
  error,
  onClose,
  onPrevious,
  onNext,
}: ResultDetailsModalProps) {
  const [series, setSeries] = useState({ wpm: true, burst: true, errors: true, average: true });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && onPrevious) onPrevious();
      else if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, onPrevious, onNext]);

  const context = useMemo(() => resultContext(result, results), [result, results]);
  const chartWpm = details?.chartWpm ?? [];
  const chartBurst = details?.chartBurst ?? [];
  const chartErr = details?.chartErr ?? [];
  const pace = useMemo(() => analyzePace(details?.chartBurst ?? null, details?.chartErr ?? null), [details]);

  const settings = [
    testLabel(result),
    formatLanguage(result.language),
    result.punctuation ? "punctuation" : null,
    result.numbers ? "numbers" : null,
    result.difficulty !== "normal" ? result.difficulty : null,
    ...result.funbox,
  ].filter(Boolean);

  const deltaVsForm = context.formBefore !== null ? result.wpm - context.formBefore : null;
  const [correct = 0, incorrect = 0, extra = 0, missed = 0] = result.charStats;
  const charTotal = correct + incorrect + extra + missed;

  const datasets: ChartDataset<"line", (number | null)[]>[] = [];
  if (series.wpm)
    datasets.push({
      label: "WPM",
      data: chartWpm,
      borderColor: "rgb(34, 211, 238)",
      backgroundColor: "rgba(34, 211, 238, 0.12)",
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.3,
      fill: true,
      yAxisID: "y",
    });
  if (series.burst)
    datasets.push({
      label: "Burst",
      data: chartBurst,
      borderColor: "rgba(167, 139, 250, 0.8)",
      backgroundColor: "rgba(167, 139, 250, 0.8)",
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.2,
      yAxisID: "y",
    });
  if (series.average && context.cohortAverage !== null && chartWpm.length > 0)
    datasets.push({
      label: "Your average",
      data: chartWpm.map(() => context.cohortAverage),
      borderColor: "rgba(212, 212, 216, 0.6)",
      backgroundColor: "rgba(212, 212, 216, 0.6)",
      borderDash: [6, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      yAxisID: "y",
    });
  if (series.errors && chartErr.some((e) => e > 0))
    datasets.push({
      label: "Errors",
      data: chartErr.map((e) => (e > 0 ? e : null)),
      borderColor: "rgb(244, 63, 94)",
      backgroundColor: "rgb(244, 63, 94)",
      pointStyle: "crossRot",
      pointRadius: 5,
      pointBorderWidth: 2,
      showLine: false,
      yAxisID: "yErrors",
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-details-title"
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <h2 id="result-details-title" className="text-lg font-semibold text-zinc-100">
              {settings.join(" · ")}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{result.date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
              {result.isPb ? <Badge tone="amber">★ Personal best</Badge> : null}
              {!result.isPb && context.bestAtTheTime ? <Badge tone="emerald">Best in this setting at the time</Badge> : null}
              {result.bailedOut ? <Badge tone="zinc">Bailed out</Badge> : null}
              {result.tags.length > 0 ? <Badge tone="zinc">{result.tags.length} tag{result.tags.length > 1 ? "s" : ""}</Badge> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevious ?? undefined}
              disabled={!onPrevious}
              aria-label="Previous (older) test"
              title="Older test (←)"
              className="rounded-full border border-zinc-700/60 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onNext ?? undefined}
              disabled={!onNext}
              aria-label="Next (newer) test"
              title="Newer test (→)"
              className="rounded-full border border-zinc-700/60 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              title="Close (Esc)"
              className="ml-1 rounded-full border border-zinc-700/60 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
          <section aria-label="Result" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric
              label="WPM"
              value={result.wpm.toFixed(1)}
              sub={deltaVsForm !== null ? `${signed(deltaVsForm)} vs your form` : undefined}
              color="text-cyan-400"
            />
            <Metric label="Raw" value={result.rawWpm.toFixed(1)} sub={`${Math.max(0, result.rawWpm - result.wpm).toFixed(1)} WPM lost to errors`} color="text-violet-300" />
            <Metric label="Accuracy" value={`${result.acc.toFixed(1)}%`} color="text-amber-400" />
            <Metric label="Consistency" value={`${result.consistency.toFixed(1)}%`} sub="steadiness within the test" color="text-emerald-400" />
          </section>

          {context.rank !== null && context.cohortSize >= 5 ? (
            <p className="rounded-2xl border border-cyan-900/60 bg-cyan-950/30 px-4 py-3 text-sm text-zinc-200">
              {context.fasterThanPercent !== null ? (
                <>
                  Faster than <strong className="text-cyan-300">{formatNumber(context.fasterThanPercent, 0)}%</strong> of your{" "}
                </>
              ) : (
                "Ranked against your "
              )}
              {formatNumber(context.cohortSize)} tests with these settings — <strong className="text-cyan-300">#{context.rank}</strong> overall
              {context.cohortAverage !== null ? `, where you average ${context.cohortAverage.toFixed(1)} WPM` : ""}.
            </p>
          ) : null}

          <section aria-label="Per-second chart" className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-3 sm:p-4">
            {isLoading ? (
              <div className="h-60 animate-pulse rounded-xl bg-zinc-800/40 sm:h-72" />
            ) : error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
            ) : chartWpm.length === 0 ? (
              <p className="px-2 py-6 text-sm text-zinc-400">Monkeytype has no per-second data for this test.</p>
            ) : (
              <>
                <div className="h-60 sm:h-72">
                  <Line
                    data={{ labels: chartWpm.map((_, i) => `${i + 1}s`), datasets }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: false,
                      interaction: { intersect: false, mode: "index" },
                      scales: {
                        x: {
                          ticks: { color: "rgb(161, 161, 170)", maxTicksLimit: 12 },
                          grid: { color: "rgba(63, 63, 70, 0.25)" },
                        },
                        y: {
                          ticks: { color: "rgb(161, 161, 170)" },
                          grid: { color: "rgba(63, 63, 70, 0.25)" },
                        },
                        yErrors: {
                          position: "right",
                          beginAtZero: true,
                          display: series.errors && chartErr.some((e) => e > 0),
                          ticks: { color: "rgb(251, 113, 133)", stepSize: 1, precision: 0 },
                          grid: { drawOnChartArea: false },
                          suggestedMax: Math.max(3, ...chartErr),
                        },
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgb(24, 24, 27)",
                          titleColor: "rgb(228, 228, 231)",
                          bodyColor: "rgb(212, 212, 216)",
                          borderColor: "rgba(63, 63, 70, 0.5)",
                          borderWidth: 1,
                          padding: 10,
                          callbacks: {
                            label: (ctx) =>
                              ctx.dataset.label === "Errors"
                                ? `Errors: ${ctx.parsed.y}`
                                : `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(0)}`,
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Chart series">
                  <Pill active={series.wpm} onClick={() => setSeries((s) => ({ ...s, wpm: !s.wpm }))}>WPM</Pill>
                  <Pill active={series.burst} onClick={() => setSeries((s) => ({ ...s, burst: !s.burst }))} title="Speed in each individual second">
                    Burst
                  </Pill>
                  <Pill active={series.errors} onClick={() => setSeries((s) => ({ ...s, errors: !s.errors }))}>Errors</Pill>
                  {context.cohortAverage !== null ? (
                    <Pill active={series.average} onClick={() => setSeries((s) => ({ ...s, average: !s.average }))}>
                      Your average
                    </Pill>
                  ) : null}
                </div>
              </>
            )}
          </section>

          {pace || details?.keySpacingAverage ? (
            <section aria-labelledby="pace-heading">
              <h3 id="pace-heading" className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                How it went
              </h3>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {pace ? (
                  <>
                    <Fact
                      label="Start → finish"
                      value={`${pace.firstHalf.toFixed(0)} → ${pace.secondHalf.toFixed(0)}`}
                      note={
                        Math.abs(pace.secondHalf - pace.firstHalf) < 2
                          ? "even pace"
                          : pace.secondHalf < pace.firstHalf
                            ? `faded ${(pace.firstHalf - pace.secondHalf).toFixed(0)} WPM in the 2nd half`
                            : `sped up ${(pace.secondHalf - pace.firstHalf).toFixed(0)} WPM in the 2nd half`
                      }
                    />
                    <Fact label="Peak burst" value={`${pace.peakBurst.value.toFixed(0)} WPM`} note={`at ${pace.peakBurst.second}s`} />
                    <Fact
                      label="Mistyped keys"
                      value={`${pace.totalErrors} in ${pace.secondsWithErrors}s`}
                      note={pace.worstSecond ? `incl. corrected ones · worst ${pace.worstSecond.errors} at ${pace.worstSecond.second}s · longest clean run ${pace.longestCleanStreak}s` : "not a single slip"}
                    />
                  </>
                ) : null}
                {details?.keySpacingAverage ? (
                  <Fact
                    label="Key timing"
                    value={`${details.keySpacingAverage.toFixed(0)} ms`}
                    note={`between keys${details.keySpacingSd ? ` (±${details.keySpacingSd.toFixed(0)})` : ""}${details.keyDurationAverage ? ` · held ${details.keyDurationAverage.toFixed(0)} ms` : ""}`}
                  />
                ) : null}
              </div>
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {charTotal > 0 ? (
              <section aria-labelledby="chars-heading" className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4">
                <h3 id="chars-heading" className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Characters
                </h3>
                <div className="flex h-3 overflow-hidden rounded-full bg-zinc-800" role="img" aria-label={`Correct ${correct}, incorrect ${incorrect}, extra ${extra}, missed ${missed}`}>
                  {[correct, incorrect, extra, missed].map((n, i) =>
                    n > 0 ? <div key={i} className={charSegments[i].color} style={{ width: `${(n / charTotal) * 100}%` }} /> : null,
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-2 text-sm">
                  {[correct, incorrect, extra, missed].map((n, i) => (
                    <div key={charSegments[i].label}>
                      <dt className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className={`h-2 w-2 rounded-full ${charSegments[i].color}`} aria-hidden="true" />
                        {charSegments[i].label}
                      </dt>
                      <dd className="font-mono text-zinc-100">{formatNumber(n)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section aria-labelledby="session-heading" className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4">
              <h3 id="session-heading" className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Session
              </h3>
              <ul className="flex flex-col gap-1.5 text-sm text-zinc-300">
                {context.session ? (
                  <li>
                    {context.session.size === 1
                      ? "The only test in its session — no warm-up."
                      : `${ordinal(context.session.position)} of ${context.session.size} tests in this session.`}
                  </li>
                ) : null}
                <li>
                  {result.restartCount > 0
                    ? `${result.restartCount} restart${result.restartCount > 1 ? "s" : ""} before it, ${Math.round(result.incompleteSeconds)}s in abandoned attempts.`
                    : "No restarts before it."}
                </li>
                <li>
                  {Math.round(result.testDuration)}s typed
                  {details?.afkDuration ? `, ${Math.round(details.afkDuration)}s AFK` : ""}.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
