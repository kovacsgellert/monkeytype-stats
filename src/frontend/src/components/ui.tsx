import type { ReactNode } from "react";
import type { InsightBar } from "../stats/insights";

export const pillBase =
  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 sm:text-sm";
export const pillActive = "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50";
export const pillInactive =
  "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-200";

export const cardClass =
  "rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-6";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm font-medium text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

export const inputClass =
  "w-full rounded-lg border border-zinc-700/60 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500/60 focus:outline-none";

export function Pill({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={`${pillBase} ${active ? pillActive : pillInactive}`}
    >
      {children}
    </button>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3 sm:mb-4">
      <h2 className="text-lg font-semibold text-zinc-100 sm:text-xl">{title}</h2>
      {subtitle ? <p className="text-sm text-zinc-400">{subtitle}</p> : null}
      {action}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  color = "text-zinc-100",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-5">
      <div className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
        {label}
      </div>
      <div className={`text-2xl sm:text-3xl font-bold font-mono ${color}`}>{value}</div>
      {sub ? <div className="text-xs sm:text-sm text-zinc-400 mt-1">{sub}</div> : null}
    </div>
  );
}

/** Small vertical bar chart; the highlighted bar carries the insight's point. */
export function MiniBars({
  bars,
  height = 72,
  color = "bg-cyan-400",
  label,
}: {
  bars: InsightBar[];
  height?: number;
  color?: string;
  label: string;
}) {
  const values = bars.map((b) => b.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // start bars a little below the minimum so differences stay visible
  const floor = Math.max(0, min - (max - min || 1) * 0.6);
  return (
    <div role="img" aria-label={label} className="flex items-end gap-1" style={{ height }}>
      {bars.map((b, i) => (
        <div key={i} className="flex flex-1 min-w-0 flex-col items-center justify-end gap-1 h-full">
          <div
            title={`${b.label}: ${b.value.toFixed(1)}`}
            className={`w-full rounded-t-sm ${b.highlight ? color : "bg-zinc-700"}`}
            style={{ height: `${Math.max(6, ((b.value - floor) / (max - floor || 1)) * (height - 18))}px` }}
          />
          <div className="w-full truncate text-center text-[10px] text-zinc-400">{b.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({
  values,
  height = 56,
  stroke = "#22d3ee",
  label,
}: {
  values: number[];
  height?: number;
  stroke?: string;
  label: string;
}) {
  if (values.length < 2) return null;
  const width = 240;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => `${((i / (values.length - 1)) * width).toFixed(1)},${(height - 4 - ((v - min) / range) * (height - 8)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
    >
      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-14 text-center">
      <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
      {children ? <div className="mt-2 max-w-md text-sm text-zinc-400">{children}</div> : null}
    </div>
  );
}
