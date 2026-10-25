import { formatLanguage } from "../utils/languageUtils";
import { learningRate, max, mean, rollingMean, totalHours } from "./aggregate";
import type { ResultFilter } from "./filter";
import { isPerformance, type TestResult } from "./normalize";

export const MIN_TRACK_TESTS = 50;
const FORM_WINDOW = 20;

/** A setting combination the user keeps repeating; computed, never stored. */
export interface Track {
  key: string;
  name: string;
  settings: string;
  filter: ResultFilter;
  tests: number;
  hours: number;
  /** Average of the last 20 tests. */
  form: number;
  average: number;
  best: number;
  /** WPM per recorded hour; null when there is too little data for a slope. */
  wpmPerHour: number | null;
  /** Rolling 20-test average, sampled to at most ~40 points for sparklines. */
  series: number[];
  firstPracticed: Date;
  lastPracticed: Date;
  results: TestResult[];
}

/**
 * Settings that change what is being typed. Quotes are one track per language because
 * their mode2 is a quote id, not a length.
 */
export function cohortKey(r: TestResult): string {
  return [
    r.mode,
    r.mode === "quote" ? "*" : r.mode2,
    r.language,
    r.difficulty,
    r.punctuation ? "p" : "",
    r.numbers ? "n" : "",
    r.blindMode ? "b" : "",
    r.lazyMode ? "l" : "",
    r.funbox.join("+"),
  ].join("|");
}

function trackName(r: TestResult): string {
  const language = r.language;
  if (r.mode === "quote") return `Quotes · ${language}`;
  return `${language} · ${r.mode2}${r.mode === "time" ? "s" : " words"}`;
}

function trackSettings(r: TestResult): string {
  const parts = [r.mode, formatLanguage(r.language)];
  if (r.punctuation) parts.push("punctuation");
  if (r.numbers) parts.push("numbers");
  if (r.difficulty !== "normal") parts.push(r.difficulty);
  if (r.blindMode) parts.push("blind");
  if (r.lazyMode) parts.push("lazy");
  if (r.funbox.length > 0) parts.push(r.funbox.join(", "));
  return parts.join(" · ");
}

function trackFilter(r: TestResult): ResultFilter {
  return {
    mode: r.mode,
    mode2: r.mode === "quote" ? undefined : r.mode2,
    language: r.language,
    punctuation: r.punctuation,
    numbers: r.numbers,
  };
}

function sample(values: number[], points: number): number[] {
  if (values.length <= points) return values;
  const step = (values.length - 1) / (points - 1);
  return Array.from({ length: points }, (_, i) => values[Math.round(i * step)]);
}

export function buildTrack(key: string, results: TestResult[]): Track {
  const first = results[0];
  const wpms = results.map((r) => r.wpm);
  const rolling = rollingMean(wpms, Math.min(FORM_WINDOW, wpms.length)).filter(
    (v): v is number => v !== null,
  );
  const rate = results.length >= MIN_TRACK_TESTS ? learningRate(results) : null;
  return {
    key,
    name: trackName(first),
    settings: trackSettings(first),
    filter: trackFilter(first),
    tests: results.length,
    hours: totalHours(results),
    form: mean(wpms.slice(-FORM_WINDOW)) ?? 0,
    average: mean(wpms) ?? 0,
    best: max(wpms) ?? 0,
    wpmPerHour: rate?.wpmPerHour ?? null,
    series: sample(rolling, 40),
    firstPracticed: first.date,
    lastPracticed: results[results.length - 1].date,
    results,
  };
}

/**
 * Tracks with at least `minTests` performance tests, most recently practiced first
 * (ties broken by size). The first one is the main track.
 */
export function detectTracks(results: TestResult[], minTests = MIN_TRACK_TESTS): Track[] {
  const groups = new Map<string, TestResult[]>();
  for (const r of results) {
    if (!isPerformance(r)) continue;
    const key = cohortKey(r);
    const list = groups.get(key);
    if (list) list.push(r);
    else groups.set(key, [r]);
  }

  const tracks = [...groups.entries()]
    .filter(([, list]) => list.length >= minTests)
    .map(([key, list]) => buildTrack(key, list));

  // "recent" means practiced within 30 days of the latest test overall
  const latest = Math.max(0, ...tracks.map((t) => t.lastPracticed.getTime()));
  const recent = (t: Track) => latest - t.lastPracticed.getTime() <= 30 * 86_400_000;
  return tracks.sort((a, b) => {
    if (recent(a) !== recent(b)) return recent(a) ? -1 : 1;
    if (recent(a)) return b.tests - a.tests;
    return b.lastPracticed.getTime() - a.lastPracticed.getTime();
  });
}
