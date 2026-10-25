import type { Result } from "../types/result";
import { normalizeResult, type TestResult } from "./normalize";

let counter = 0;

/** A raw API result with Monkeytype's sparse defaults; override what a test cares about. */
export function rawResult(overrides: Partial<Result> = {}): Result {
  counter += 1;
  return {
    id: `r${counter}`,
    wpm: 60,
    rawWpm: 61,
    charStats: [300, 2, 0, 0],
    acc: 97,
    mode: "time",
    mode2: "60",
    quoteLength: null,
    timestamp: "2026-01-05T12:00:00Z",
    testDuration: 60,
    consistency: 70,
    keyConsistency: 40,
    uid: "u1",
    restartCount: null,
    incompleteTestSeconds: null,
    afkDuration: null,
    tags: null,
    bailedOut: null,
    blindMode: null,
    lazyMode: null,
    funbox: null,
    language: null,
    difficulty: null,
    numbers: null,
    punctuation: null,
    isPb: null,
    ...overrides,
  };
}

export function result(overrides: Partial<Result> = {}): TestResult {
  return normalizeResult(rawResult(overrides));
}

/** `count` results one minute apart starting at `start`, with WPM from `wpm(i)`. */
export function series(
  count: number,
  wpm: (i: number) => number,
  overrides: Partial<Result> = {},
  start = "2026-01-05T12:00:00Z",
  stepMinutes = 60 * 24,
): TestResult[] {
  const t0 = new Date(start).getTime();
  return Array.from({ length: count }, (_, i) =>
    result({
      ...overrides,
      wpm: wpm(i),
      rawWpm: wpm(i) + 0.5,
      timestamp: new Date(t0 + i * stepMinutes * 60_000).toISOString(),
    }),
  );
}
