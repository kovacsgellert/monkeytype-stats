import { useState, useMemo } from "react";
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
import type { ChartDataset } from "chart.js";
import type { Result } from "../types/result";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

interface WpmChartProps {
  results: Result[];
}

function rollingAverage(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const w = Math.min(window, i + 1);
    const slice = values.slice(i - w + 1, i + 1);
    return Math.round(slice.reduce((sum, v) => sum + v, 0) / w);
  });
}

const pillBase =
  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200";
const pillActive = (color: string) =>
  `${color} border border-current/50`;
const pillInactive =
  "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300";

export function WpmChart({ results }: WpmChartProps) {
  const [showAvg10, setShowAvg10] = useState(false);
  const [showAvg100, setShowAvg100] = useState(false);

  const chartData = useMemo(() => {
    const sorted = [...results].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const labels = sorted.map((r) =>
      new Date(r.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    );

    const wpmValues = sorted.map((r) => Math.round(r.wpm));

    const datasets: ChartDataset<"line", number[]>[] = [
      {
        label: "WPM",
        data: wpmValues,
        borderColor: "transparent",
        backgroundColor: "rgba(6, 182, 212, 0.5)",
        borderWidth: 0,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "rgba(6, 182, 212, 0.5)",
        pointBorderColor: "rgba(6, 182, 212, 0.5)",
        showLine: false,
        fill: false,
      },
    ];

    if (showAvg10) {
      datasets.push({
        label: "Avg 10",
        data: rollingAverage(wpmValues, 10),
        borderColor: "rgb(250, 204, 21)",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: false,
      });
    }

    if (showAvg100) {
      datasets.push({
        label: "Avg 100",
        data: rollingAverage(wpmValues, 100),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: false,
      });
    }

    return { labels, datasets };
  }, [results, showAvg10, showAvg100]);

  if (results.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">WPM Over Time</h3>
      <div className="h-64">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: "index",
            },
            scales: {
              x: {
                ticks: { color: "rgb(113, 113, 122)", maxTicksLimit: 12 },
                grid: { color: "rgba(63, 63, 70, 0.3)" },
                border: { color: "rgba(63, 63, 70, 0.5)" },
              },
              y: {
                ticks: { color: "rgb(113, 113, 122)" },
                grid: { color: "rgba(63, 63, 70, 0.3)" },
                border: { color: "rgba(63, 63, 70, 0.5)" },
              },
            },
            plugins: {
              tooltip: {
                backgroundColor: "rgb(24, 24, 27)",
                titleColor: "rgb(228, 228, 231)",
                bodyColor: "rgb(6, 182, 212)",
                borderColor: "rgba(63, 63, 70, 0.5)",
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} WPM`,
                },
              },
            },
          }}
        />
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => setShowAvg10((v) => !v)}
          className={`${pillBase} ${showAvg10 ? pillActive("bg-yellow-400/20 text-yellow-400") : pillInactive}`}
        >
          Avg 10
        </button>
        <button
          onClick={() => setShowAvg100((v) => !v)}
          className={`${pillBase} ${showAvg100 ? pillActive("bg-purple-400/20 text-purple-400") : pillInactive}`}
        >
          Avg 100
        </button>
      </div>
    </div>
  );
}
