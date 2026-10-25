import type { Result } from "../types/result";

/** A result with Monkeytype's omitted defaults filled in and the timestamp parsed. */
export interface TestResult {
  id: string;
  date: Date;
  wpm: number;
  rawWpm: number;
  acc: number;
  consistency: number;
  mode: string;
  mode2: string;
  quoteLength: number | null;
  /** Seconds spent in the saved test. */
  testDuration: number;
  /** Seconds spent in abandoned attempts since the previous saved result. */
  incompleteSeconds: number;
  restartCount: number;
  language: string;
  difficulty: string;
  punctuation: boolean;
  numbers: boolean;
  blindMode: boolean;
  lazyMode: boolean;
  funbox: string[];
  tags: string[];
  bailedOut: boolean;
  isPb: boolean;
  /** [correct, incorrect, extra, missed]; may be empty for old results. */
  charStats: number[];
}

/** Monkeytype stores only non-default values, so missing fields mean the default. */
export function normalizeResult(result: Result): TestResult {
  return {
    id: result.id,
    date: new Date(result.timestamp),
    wpm: result.wpm,
    rawWpm: result.rawWpm,
    acc: result.acc,
    consistency: result.consistency,
    mode: result.mode,
    mode2: result.mode2,
    quoteLength: result.quoteLength,
    testDuration: result.testDuration,
    incompleteSeconds: result.incompleteTestSeconds ?? 0,
    restartCount: result.restartCount ?? 0,
    language: result.language ?? "english",
    difficulty: result.difficulty ?? "normal",
    punctuation: result.punctuation ?? false,
    numbers: result.numbers ?? false,
    blindMode: result.blindMode ?? false,
    lazyMode: result.lazyMode ?? false,
    funbox: [...(result.funbox ?? [])].sort(),
    tags: result.tags ?? [],
    bailedOut: result.bailedOut ?? false,
    isPb: result.isPb ?? false,
    charStats: result.charStats ?? [],
  };
}

/** Normalizes and sorts oldest first, which every stat in this module expects. */
export function normalizeResults(results: Result[]): TestResult[] {
  return results
    .map(normalizeResult)
    .filter((r) => !Number.isNaN(r.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Completed tests with sane values; speed, accuracy and consistency stats use only these. */
export function isPerformance(result: TestResult): boolean {
  return (
    !result.bailedOut &&
    Number.isFinite(result.wpm) &&
    result.wpm > 0 &&
    result.testDuration > 0 &&
    result.acc >= 0 &&
    result.acc <= 100
  );
}

/** Recorded typing time for a result, including abandoned attempts before it. */
export function recordedSeconds(result: TestResult): number {
  return result.testDuration + result.incompleteSeconds;
}
