import { formatLanguage } from "../utils/languageUtils";
import type { TestResult } from "./normalize";

export type PeriodPreset = "30d" | "90d" | "365d";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/**
 * One filter shape for the Explorer URL, insight deep links, tracks, saved views and goals.
 * Every field is optional; a missing field means "any".
 */
export interface ResultFilter {
  /** A preset like "30d" or a calendar year like "2025". */
  period?: string;
  /** Inclusive local dates (YYYY-MM-DD) for a custom range; ignored when `period` is set. */
  from?: string;
  to?: string;
  mode?: string;
  mode2?: string;
  language?: string;
  punctuation?: boolean;
  numbers?: boolean;
  tag?: string;
  timeOfDay?: TimeOfDay;
  includeBailed?: boolean;
}

export const periodPresets: { key: PeriodPreset; label: string; days: number }[] = [
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "365d", label: "Last 12 months", days: 365 },
];

export const timesOfDay: { key: TimeOfDay; label: string; from: number; to: number }[] = [
  { key: "morning", label: "Morning (5–12)", from: 5, to: 12 },
  { key: "afternoon", label: "Afternoon (12–17)", from: 12, to: 17 },
  { key: "evening", label: "Evening (17–22)", from: 17, to: 22 },
  { key: "night", label: "Night (22–5)", from: 22, to: 5 },
];

function periodStart(period: string, now: Date): Date | null {
  const preset = periodPresets.find((p) => p.key === period);
  if (!preset) return null;
  return new Date(now.getTime() - preset.days * 86_400_000);
}

function inTimeOfDay(date: Date, timeOfDay: TimeOfDay): boolean {
  const slot = timesOfDay.find((t) => t.key === timeOfDay)!;
  const hour = date.getHours();
  return slot.from < slot.to
    ? hour >= slot.from && hour < slot.to
    : hour >= slot.from || hour < slot.to;
}

function parseLocalDate(value: string, endOfDay: boolean): Date | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return endOfDay ? new Date(y, m - 1, d, 23, 59, 59, 999) : new Date(y, m - 1, d);
}

export function matchesFilter(r: TestResult, filter: ResultFilter, now = new Date()): boolean {
  if (!filter.includeBailed && r.bailedOut) return false;

  if (filter.period) {
    const start = periodStart(filter.period, now);
    if (start) {
      if (r.date < start) return false;
    } else if (r.date.getFullYear() !== Number(filter.period)) {
      return false;
    }
  } else {
    const from = filter.from ? parseLocalDate(filter.from, false) : null;
    const to = filter.to ? parseLocalDate(filter.to, true) : null;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
  }

  if (filter.mode && r.mode !== filter.mode) return false;
  if (filter.mode2 && r.mode2 !== filter.mode2) return false;
  if (filter.language && r.language !== filter.language) return false;
  if (filter.punctuation !== undefined && r.punctuation !== filter.punctuation) return false;
  if (filter.numbers !== undefined && r.numbers !== filter.numbers) return false;
  if (filter.tag && !r.tags.includes(filter.tag)) return false;
  if (filter.timeOfDay && !inTimeOfDay(r.date, filter.timeOfDay)) return false;
  return true;
}

export function applyFilter(
  results: TestResult[],
  filter: ResultFilter,
  now = new Date(),
): TestResult[] {
  return results.filter((r) => matchesFilter(r, filter, now));
}

export function isEmptyFilter(filter: ResultFilter): boolean {
  return describeFilter(filter).length === 0;
}

/** Human-readable chips for the active filter fields. */
export function describeFilter(
  filter: ResultFilter,
  tagName: (id: string) => string = (id) => id,
): { field: keyof ResultFilter; label: string }[] {
  const chips: { field: keyof ResultFilter; label: string }[] = [];
  if (filter.period) {
    const preset = periodPresets.find((p) => p.key === filter.period);
    chips.push({ field: "period", label: preset?.label ?? filter.period });
  } else {
    if (filter.from) chips.push({ field: "from", label: `From ${filter.from}` });
    if (filter.to) chips.push({ field: "to", label: `To ${filter.to}` });
  }
  if (filter.mode) chips.push({ field: "mode", label: filter.mode });
  if (filter.mode2) chips.push({ field: "mode2", label: filter.mode2 });
  if (filter.language) chips.push({ field: "language", label: formatLanguage(filter.language) });
  if (filter.punctuation !== undefined)
    chips.push({ field: "punctuation", label: filter.punctuation ? "Punctuation" : "No punctuation" });
  if (filter.numbers !== undefined)
    chips.push({ field: "numbers", label: filter.numbers ? "Numbers" : "No numbers" });
  if (filter.tag) chips.push({ field: "tag", label: `Tag: ${tagName(filter.tag)}` });
  if (filter.timeOfDay)
    chips.push({
      field: "timeOfDay",
      label: timesOfDay.find((t) => t.key === filter.timeOfDay)?.label ?? filter.timeOfDay,
    });
  if (filter.includeBailed) chips.push({ field: "includeBailed", label: "Incl. bailed out" });
  return chips;
}

/** Copies only known filter fields with valid types, e.g. from URL search params or stored JSON. */
export function sanitizeFilter(input: Record<string, unknown> | null | undefined): ResultFilter {
  if (!input) return {};
  const str = (v: unknown) => (typeof v === "string" && v !== "" ? v : typeof v === "number" ? String(v) : undefined);
  const bool = (v: unknown) =>
    typeof v === "boolean" ? v : v === "true" ? true : v === "false" ? false : undefined;
  const filter: ResultFilter = {
    period: str(input.period),
    from: str(input.from),
    to: str(input.to),
    mode: str(input.mode),
    mode2: str(input.mode2),
    language: str(input.language),
    punctuation: bool(input.punctuation),
    numbers: bool(input.numbers),
    tag: str(input.tag),
    timeOfDay: timesOfDay.some((t) => t.key === input.timeOfDay)
      ? (input.timeOfDay as TimeOfDay)
      : undefined,
    includeBailed: bool(input.includeBailed) || undefined,
  };
  return Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== undefined),
  ) as ResultFilter;
}

export function filterKey(filter: ResultFilter): string {
  return JSON.stringify(
    Object.keys(filter)
      .sort()
      .map((k) => [k, filter[k as keyof ResultFilter]]),
  );
}
