import { formatLanguage } from "../utils/languageUtils";
import type { TestResult } from "./normalize";

/** Ways to split results in the Explorer breakdown and in insights. */
export type Dimension =
  | "month"
  | "week"
  | "weekday"
  | "hour"
  | "session"
  | "language"
  | "duration"
  | "accuracy";

export const dimensions: { key: Dimension; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "weekday", label: "Weekday" },
  { key: "hour", label: "Hour of day" },
  { key: "session", label: "Position in session" },
  { key: "language", label: "Language" },
  { key: "duration", label: "Mode & length" },
  { key: "accuracy", label: "Accuracy band" },
];

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const accuracyBands = [
  { key: "a0", label: "< 92%", min: 0, max: 92 },
  { key: "a1", label: "92–94%", min: 92, max: 94 },
  { key: "a2", label: "94–96%", min: 94, max: 96 },
  { key: "a3", label: "96–98%", min: 96, max: 98 },
  { key: "a4", label: "98%+", min: 98, max: 101 },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function testLabel(r: Pick<TestResult, "mode" | "mode2">): string {
  return r.mode === "quote" ? "quote" : `${r.mode} ${r.mode2}`;
}

/** Key for a result in a dimension; keys sort in display order as plain strings or numbers. */
export function dimensionKey(
  dimension: Dimension,
  r: TestResult,
  sessionPosition: (r: TestResult) => number,
): string | null {
  switch (dimension) {
    case "month":
      return `${r.date.getFullYear()}-${pad(r.date.getMonth() + 1)}`;
    case "week": {
      const d = isoWeekStart(r.date);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    case "weekday":
      return String((r.date.getDay() + 6) % 7);
    case "hour":
      return pad(r.date.getHours());
    case "session":
      return pad(Math.min(sessionPosition(r), 9));
    case "language":
      return r.language;
    case "duration":
      return testLabel(r);
    case "accuracy":
      return accuracyBands.find((b) => r.acc >= b.min && r.acc < b.max)?.key ?? null;
  }
}

export function dimensionLabel(dimension: Dimension, key: string): string {
  switch (dimension) {
    case "month": {
      const [y, m] = key.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    case "week":
      return `Week of ${new Date(key + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    case "weekday":
      return weekdayNames[Number(key)];
    case "hour":
      return `${key}:00`;
    case "session": {
      const n = Number(key) + 1;
      return n >= 10 ? "10th+" : `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
    }
    case "language":
      return formatLanguage(key);
    case "duration":
      return key;
    case "accuracy":
      return accuracyBands.find((b) => b.key === key)?.label ?? key;
  }
}

export function dimensionOrder(dimension: Dimension): (a: string, b: string) => number {
  if (dimension === "duration") {
    return (a, b) => {
      const [ma, na] = a.split(" ");
      const [mb, nb] = b.split(" ");
      return ma === mb ? Number(na ?? 0) - Number(nb ?? 0) : ma.localeCompare(mb);
    };
  }
  return (a, b) => a.localeCompare(b);
}
