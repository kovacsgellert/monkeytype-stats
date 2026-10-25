import { recordedSeconds, type TestResult } from "./normalize";

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function max(values: number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/** Rolling mean; positions before the window is full are null so lines start honestly. */
export function rollingMean(values: number[], window: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= window) sum -= values[i - window];
    out.push(i >= window - 1 ? sum / window : null);
  }
  return out;
}

export interface GroupStats {
  key: string;
  label: string;
  count: number;
  avgWpm: number;
  bestWpm: number;
  avgAcc: number;
  avgConsistency: number;
}

export function summarize(key: string, label: string, results: TestResult[]): GroupStats {
  return {
    key,
    label,
    count: results.length,
    avgWpm: mean(results.map((r) => r.wpm)) ?? 0,
    bestWpm: max(results.map((r) => r.wpm)) ?? 0,
    avgAcc: mean(results.map((r) => r.acc)) ?? 0,
    avgConsistency: mean(results.map((r) => r.consistency)) ?? 0,
  };
}

/** Groups results and summarizes each group, in the order given by `order` (or first appearance). */
export function groupStats(
  results: TestResult[],
  keyOf: (r: TestResult) => string | null,
  labelOf: (key: string) => string = (key) => key,
  order?: (a: string, b: string) => number,
): GroupStats[] {
  const groups = new Map<string, TestResult[]>();
  for (const r of results) {
    const key = keyOf(r);
    if (key === null) continue;
    const list = groups.get(key);
    if (list) list.push(r);
    else groups.set(key, [r]);
  }
  const keys = [...groups.keys()];
  if (order) keys.sort(order);
  return keys.map((key) => summarize(key, labelOf(key), groups.get(key)!));
}

export interface LearningRate {
  /** Estimated WPM change per recorded typing hour. */
  wpmPerHour: number;
  hours: number;
  tests: number;
}

/**
 * Least-squares slope of WPM against cumulative recorded hours before each test.
 * Only meaningful within one cohort; callers decide eligibility.
 */
export function learningRate(results: TestResult[]): LearningRate | null {
  if (results.length < 2) return null;
  let cumulative = 0;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const r of results) {
    xs.push(cumulative / 3600);
    ys.push(r.wpm);
    cumulative += recordedSeconds(r);
  }
  const mx = mean(xs)!;
  const my = mean(ys)!;
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  if (den === 0) return null;
  return { wpmPerHour: num / den, hours: cumulative / 3600, tests: results.length };
}

export function totalHours(results: TestResult[]): number {
  return results.reduce((sum, r) => sum + recordedSeconds(r), 0) / 3600;
}

/** Mean of the last `n` values and of the `n` before them. */
export function recentVsPrevious(values: number[], n: number) {
  const recent = mean(values.slice(-n));
  const previous = values.length >= 2 * n ? mean(values.slice(-2 * n, -n)) : null;
  return { recent, previous };
}
