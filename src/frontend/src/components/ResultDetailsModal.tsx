import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ResultDetails } from "../types/result";
import { formatLanguage } from "../types/result";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

interface ResultDetailsModalProps {
  details: ResultDetails | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export function ResultDetailsModal({
  details,
  isLoading,
  error,
  onClose,
}: ResultDetailsModalProps) {
  const [showWpm, setShowWpm] = useState(true);
  const [showBurst, setShowBurst] = useState(true);
  const [showErrorsSeries, setShowErrorsSeries] = useState(true);
  const chartWpm = details?.chartWpm ?? [];
  const chartBurst = details?.chartBurst ?? [];
  const chartErr = details?.chartErr ?? [];
  const showErrors = showErrorsSeries && chartErr.some((value) => value > 0);
  const labels = chartWpm.map((_, idx) => `${idx + 1}s`);
  const modeLabel = details
    ? details.mode === "quote"
      ? "Quote"
      : `${details.mode} ${details.mode2}`.trim()
    : "";
  const timestampLabel = details
    ? new Date(details.timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const durationLabel = details
    ? `${Math.round(details.testDuration)}s`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl mx-4 rounded-3xl border border-zinc-800/80 bg-zinc-950/90 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">
              Result Details
            </p>
            {details ? (
              <p className="text-xs text-zinc-500 mt-1">
                {modeLabel} · {durationLabel} · {timestampLabel}
              </p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-700/60 bg-zinc-900/60 p-2 text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-200"
            aria-label="Close details"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
          {details ? (
            <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">WPM</span>
                <span className="text-zinc-100 font-semibold">
                  {Math.round(details.wpm)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Raw</span>
                <span className="text-zinc-300">
                  {Math.round(details.rawWpm)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Accuracy</span>
                <span className="text-zinc-300">
                  {details.acc.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Consistency</span>
                <span className="text-zinc-300">
                  {details.consistency.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Language</span>
                <span className="text-zinc-300 capitalize">
                  {formatLanguage(details.language ?? "english")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Personal Best</span>
                <span className="text-zinc-300">
                  {details.isPb ? "Yes" : "No"}
                </span>
              </div>
            </div>
          ) : null}
          {isLoading ? (
            <div className="h-64 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 animate-pulse" />
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-200">
              {error}
            </div>
          ) : chartWpm.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-5 py-4 text-zinc-400">
              No chart data available for this result.
            </div>
          ) : (
            <div className="h-72 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <Line
                data={{
                  labels,
                  datasets: [
                    ...(showWpm
                      ? [
                          {
                            label: "WPM",
                            data: chartWpm,
                            borderColor: "rgba(34, 211, 238, 0.9)",
                            backgroundColor: "rgba(34, 211, 238, 0.15)",
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.25,
                            fill: true,
                            yAxisID: "y",
                          },
                        ]
                      : []),
                    ...(showBurst
                      ? [
                          {
                            label: "Burst",
                            data: chartBurst,
                            borderColor: "rgba(14, 165, 233, 0.9)",
                            backgroundColor: "rgba(14, 165, 233, 0.15)",
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.2,
                            fill: false,
                            yAxisID: "y",
                          },
                        ]
                      : []),
                    ...(showErrors
                      ? [
                          {
                            label: "Errors",
                            data: chartErr.map((value) =>
                              value > 0 ? value : null,
                            ),
                            borderColor: "rgba(244, 63, 94, 0.85)",
                            backgroundColor: "rgba(244, 63, 94, 0.2)",
                            pointRadius: 3,
                            pointHoverRadius: 4,
                            showLine: false,
                            yAxisID: "yErrors",
                          },
                        ]
                      : []),
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: "index" },
                  scales: {
                    x: {
                      ticks: { color: "rgb(113, 113, 122)", maxTicksLimit: 12 },
                      grid: { color: "rgba(63, 63, 70, 0.25)" },
                      border: { color: "rgba(63, 63, 70, 0.5)" },
                    },
                    y: {
                      ticks: { color: "rgb(113, 113, 122)" },
                      grid: { color: "rgba(63, 63, 70, 0.25)" },
                      border: { color: "rgba(63, 63, 70, 0.5)" },
                    },
                    yErrors: {
                      position: "right",
                      beginAtZero: true,
                      ticks: {
                        color: "rgb(148, 163, 184)",
                        stepSize: 1,
                        precision: 0,
                      },
                      grid: { drawOnChartArea: false },
                      border: { color: "rgba(63, 63, 70, 0.5)" },
                      suggestedMax: Math.max(1, ...chartErr),
                    },
                  },
                  plugins: {
                    tooltip: {
                      backgroundColor: "rgb(24, 24, 27)",
                      titleColor: "rgb(228, 228, 231)",
                      bodyColor: "rgb(34, 211, 238)",
                      borderColor: "rgba(63, 63, 70, 0.5)",
                      borderWidth: 1,
                      padding: 10,
                      callbacks: {
                        label: (ctx) => {
                          if (ctx.dataset.label === "Errors") {
                            return `Errors: ${ctx.parsed.y}`;
                          }
                          return `${ctx.dataset.label}: ${ctx.parsed.y}`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          )}
          {!isLoading && !error && details ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setShowWpm((value) => !value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  showWpm
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-zinc-900/50 text-zinc-500 border border-zinc-800/60"
                }`}
              >
                WPM
              </button>
              <button
                onClick={() => setShowBurst((value) => !value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  showBurst
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "bg-zinc-900/50 text-zinc-500 border border-zinc-800/60"
                }`}
              >
                Burst
              </button>
              <button
                onClick={() => setShowErrorsSeries((value) => !value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  showErrorsSeries
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-zinc-900/50 text-zinc-500 border border-zinc-800/60"
                }`}
              >
                Errors
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
