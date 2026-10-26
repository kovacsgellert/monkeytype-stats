import { currentDateSettings } from "./datePreferences";
import { formatDay, formatDayTime } from "./dates";

export const formatNumber = (n: number, digits = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** A day in the date format chosen in Settings, e.g. "25 Oct 2026". */
export const formatDate = (d: Date | string) => formatDay(new Date(d), currentDateSettings().dateOrder);

/** A day and time in the date format chosen in Settings, e.g. "25 Oct 2026, 02:30 PM". */
export const formatDateTime = (d: Date | string) => formatDayTime(new Date(d), currentDateSettings().dateOrder);

export function formatRelativeDays(d: Date, now = new Date()): string {
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${(days / 365).toFixed(1)} years ago`;
}

export function signed(n: number, digits = 1): string {
  return `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(digits)}`;
}
