import { mean } from "./aggregate";
import { isPerformance, type TestResult } from "./normalize";
import { splitSessions } from "./sessions";
import { cohortKey } from "./tracks";

export interface ResultContext {
  /** Performance tests with exactly the same settings, oldest first. */
  cohortSize: number;
  cohortAverage: number | null;
  /** Average of the 20 same-settings tests before this one. */
  formBefore: number | null;
  /** Share of other same-settings tests that were slower, 0..100. */
  fasterThanPercent: number | null;
  /** 1-based rank by WPM within the same settings. */
  rank: number | null;
  /** True when no earlier same-settings test was faster. */
  bestAtTheTime: boolean;
  session: { position: number; size: number } | null;
}

export function resultContext(result: TestResult, results: TestResult[]): ResultContext {
  const key = cohortKey(result);
  const cohort = results.filter((r) => isPerformance(r) && cohortKey(r) === key);
  const others = cohort.filter((r) => r.id !== result.id);
  const before = cohort.filter((r) => r.date < result.date);

  const session = splitSessions(results).find((s) => s.results.some((r) => r.id === result.id));
  const position = session ? session.results.findIndex((r) => r.id === result.id) : -1;

  return {
    cohortSize: cohort.length,
    cohortAverage: mean(cohort.map((r) => r.wpm)),
    formBefore: before.length >= 5 ? mean(before.slice(-20).map((r) => r.wpm)) : null,
    fasterThanPercent:
      others.length >= 5 ? (others.filter((r) => r.wpm < result.wpm).length / others.length) * 100 : null,
    rank: cohort.length > 0 ? cohort.filter((r) => r.wpm > result.wpm).length + 1 : null,
    bestAtTheTime: before.length > 0 && before.every((r) => r.wpm <= result.wpm),
    session: session && position >= 0 ? { position: position + 1, size: session.results.length } : null,
  };
}

export interface PaceAnalysis {
  /** Average burst (per-second raw speed) in the first and second half of the test. */
  firstHalf: number;
  secondHalf: number;
  peakBurst: { value: number; second: number };
  totalErrors: number;
  secondsWithErrors: number;
  /** The second with the most errors, if any. */
  worstSecond: { second: number; errors: number } | null;
  /** Longest run of consecutive seconds without errors. */
  longestCleanStreak: number;
}

/** Reads Monkeytype's per-second chart arrays; null when the test has no chart data. */
export function analyzePace(burst: number[] | null, errors: number[] | null): PaceAnalysis | null {
  if (!burst || burst.length < 4) return null;
  const half = Math.floor(burst.length / 2);
  const errs = errors ?? [];

  let peak = { value: -Infinity, second: 0 };
  burst.forEach((value, i) => {
    if (value > peak.value) peak = { value, second: i + 1 };
  });

  let worst: PaceAnalysis["worstSecond"] = null;
  let streak = 0;
  let longest = 0;
  for (let i = 0; i < burst.length; i++) {
    const e = errs[i] ?? 0;
    if (e > 0 && (!worst || e > worst.errors)) worst = { second: i + 1, errors: e };
    streak = e > 0 ? 0 : streak + 1;
    longest = Math.max(longest, streak);
  }

  return {
    firstHalf: mean(burst.slice(0, half))!,
    secondHalf: mean(burst.slice(half))!,
    peakBurst: peak,
    totalErrors: errs.reduce((s, e) => s + e, 0),
    secondsWithErrors: errs.filter((e) => e > 0).length,
    worstSecond: worst,
    longestCleanStreak: longest,
  };
}
