import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartDataset,
} from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { ExplorerMetric, ExplorerXAxis } from "../../router";
import { rollingMean } from "../../stats/aggregate";
import { testLabel } from "../../stats/dimensions";
import { recordedSeconds, type TestResult } from "../../stats/normalize";
import { formatLanguage } from "../../utils/languageUtils";
import { Pill } from "../ui";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const rollingWindows = [
  { window: 10, color: "rgb(250, 204, 21)" },
  { window: 20, color: "rgb(244, 114, 182)" },
  { window: 100, color: "rgb(52, 211, 153)" },
];

const metrics: { key: ExplorerMetric; label: string; unit: string; color: string }[] = [
  { key: "wpm", label: "WPM", unit: " WPM", color: "6, 182, 212" },
  { key: "acc", label: "Accuracy", unit: "%", color: "251, 191, 36" },
  { key: "consistency", label: "Consistency", unit: "%", color: "168, 85, 247" },
  { key: "rawWpm", label: "Raw", unit: " WPM", color: "96, 165, 250" },
];

const xAxes: { key: ExplorerXAxis; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "test", label: "Test #" },
  { key: "hours", label: "Recorded hours" },
];

interface ExplorerChartProps {
  results: TestResult[];
  metric: ExplorerMetric;
  xAxis: ExplorerXAxis;
  windows: number[];
  showPbs: boolean;
  showTrend: boolean;
  onChange: (patch: { metric?: ExplorerMetric; x?: ExplorerXAxis; windows?: number[]; pb?: boolean; trend?: boolean }) => void;
}

type Point = { x: number; y: number };

function linearFit(points: Point[]): Point[] {
  if (points.length < 2) return [];
  const n = points.length;
  const mx = points.reduce((s, p) => s + p.x, 0) / n;
  const my = points.reduce((s, p) => s + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  if (den === 0) return [];
  const slope = num / den;
  const first = points[0].x;
  const last = points[n - 1].x;
  return [first, last].map((x) => ({ x, y: my + slope * (x - mx) }));
}

export function ExplorerChart({ results, metric, xAxis, windows, showPbs, showTrend, onChange }: ExplorerChartProps) {
  const active = metrics.find((m) => m.key === metric)!;

  const { datasets, xs } = useMemo(() => {
    let cumulative = 0;
    const xs = results.map((r, i) => {
      if (xAxis === "date") return r.date.getTime();
      if (xAxis === "test") return i + 1;
      const x = cumulative / 3600;
      cumulative += recordedSeconds(r);
      return x;
    });
    const values = results.map((r) => r[metric]);
    const points = values.map((y, i) => ({ x: xs[i], y }));

    const datasets: ChartDataset<"line", Point[]>[] = [
      {
        label: active.label,
        data: points,
        showLine: false,
        pointRadius: results.length > 1500 ? 1.5 : 2.5,
        pointHoverRadius: 5,
        pointBackgroundColor: `rgba(${active.color}, 0.45)`,
        pointBorderColor: `rgba(${active.color}, 0.45)`,
        borderColor: `rgb(${active.color})`,
        backgroundColor: `rgba(${active.color}, 0.45)`,
      },
    ];

    for (const { window, color } of rollingWindows) {
      if (!windows.includes(window)) continue;
      const rolling = rollingMean(values, window);
      datasets.push({
        label: `Avg ${window}`,
        data: rolling.flatMap((y, i) => (y === null ? [] : [{ x: xs[i], y }])),
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.25,
      });
    }

    if (showPbs && (metric === "wpm" || metric === "rawWpm")) {
      let best = -Infinity;
      const pbs: Point[] = [];
      values.forEach((y, i) => {
        if (y > best) {
          best = y;
          pbs.push({ x: xs[i], y });
        }
      });
      datasets.push({
        label: "New best",
        data: pbs,
        showLine: false,
        pointStyle: "star",
        pointRadius: 7,
        pointHoverRadius: 9,
        borderColor: "rgb(251, 191, 36)",
        backgroundColor: "rgb(251, 191, 36)",
      });
    }

    if (showTrend) {
      datasets.push({
        label: "Trend",
        data: linearFit(points),
        borderColor: "rgb(228, 228, 231)",
        backgroundColor: "rgb(228, 228, 231)",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
      });
    }

    return { datasets, xs };
  }, [results, metric, xAxis, windows, showPbs, showTrend, active]);

  const formatX = (value: number) => {
    if (xAxis === "date")
      return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
    if (xAxis === "hours") return `${value.toFixed(1)} h`;
    return `#${Math.round(value)}`;
  };

  const toggleWindow = (window: number) =>
    onChange({
      windows: windows.includes(window) ? windows.filter((w) => w !== window) : [...windows, window].sort((a, b) => a - b),
    });

  return (
    <section className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div role="group" aria-label="Metric" className="flex flex-wrap gap-1.5">
          {metrics.map((m) => (
            <Pill key={m.key} active={metric === m.key} onClick={() => onChange({ metric: m.key })}>
              {m.label}
            </Pill>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          X axis
          <select
            value={xAxis}
            onChange={(e) => onChange({ x: e.target.value as ExplorerXAxis })}
            className="rounded-lg border border-zinc-700/60 bg-zinc-950/60 px-2 py-1.5 text-sm text-zinc-100"
          >
            {xAxes.map((x) => (
              <option key={x.key} value={x.key}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="h-64 sm:h-80">
        <Line
          data={{ datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            parsing: false,
            interaction: { intersect: true, mode: "nearest" },
            scales: {
              x: {
                type: "linear",
                min: xs[0],
                max: xs[xs.length - 1],
                ticks: { color: "rgb(161, 161, 170)", maxTicksLimit: 8, callback: (v) => formatX(Number(v)) },
                grid: { color: "rgba(63, 63, 70, 0.3)" },
                border: { color: "rgba(63, 63, 70, 0.5)" },
              },
              y: {
                ticks: { color: "rgb(161, 161, 170)" },
                grid: { color: "rgba(63, 63, 70, 0.3)" },
                border: { color: "rgba(63, 63, 70, 0.5)" },
              },
            },
            plugins: {
              legend: {
                labels: { color: "rgb(212, 212, 216)", boxWidth: 12, usePointStyle: true },
              },
              tooltip: {
                backgroundColor: "rgb(24, 24, 27)",
                titleColor: "rgb(228, 228, 231)",
                bodyColor: "rgb(212, 212, 216)",
                borderColor: "rgba(63, 63, 70, 0.5)",
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  title: (items) => {
                    const item = items[0];
                    if (!item) return "";
                    // the scatter dataset maps 1:1 to results, so show the test there
                    if (item.datasetIndex === 0) {
                      const r = results[item.dataIndex];
                      return `${r.date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · ${testLabel(r)} · ${formatLanguage(r.language)}`;
                    }
                    return formatX(item.parsed.x ?? 0);
                  },
                  label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(1)}${active.unit}`,
                },
              },
            },
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-4" role="group" aria-label="Overlays">
        {rollingWindows.map(({ window }) => (
          <Pill key={window} active={windows.includes(window)} onClick={() => toggleWindow(window)}>
            Avg {window}
          </Pill>
        ))}
        <Pill active={showPbs} onClick={() => onChange({ pb: !showPbs })} title="Mark every test that set a new best in this view">
          New bests
        </Pill>
        <Pill active={showTrend} onClick={() => onChange({ trend: !showTrend })}>
          Trend line
        </Pill>
      </div>
    </section>
  );
}
