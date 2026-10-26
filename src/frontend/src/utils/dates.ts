/** Order of the day, month and year fields when a date is shown or typed. */
export type DateOrder = "dmy" | "mdy" | "ymd";

/** Day of the week a calendar starts on, as returned by Date.getDay(): 0 = Sunday, 1 = Monday. */
export type WeekStart = 0 | 1;

export type DateOrderPreference = "auto" | DateOrder;
export type WeekStartPreference = "auto" | "monday" | "sunday";

export interface DatePreferences {
  dateOrder: DateOrderPreference;
  weekStart: WeekStartPreference;
}

export const defaultDatePreferences: DatePreferences = { dateOrder: "auto", weekStart: "auto" };

export const dateOrderLabels: Record<DateOrder, string> = {
  dmy: "dd/mm/yyyy",
  mdy: "mm/dd/yyyy",
  ymd: "yyyy-mm-dd",
};

/** Field order the browser's locale uses for numeric dates. */
export function localeDateOrder(locale?: string): DateOrder {
  const parts = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date(2000, 10, 22))
    .map((p) => p.type)
    .filter((t) => t === "day" || t === "month" || t === "year");
  if (parts[0] === "year") return "ymd";
  return parts[0] === "month" ? "mdy" : "dmy";
}

interface WeekInfo {
  firstDay: number;
}

/** First day of the week for the browser's locale; Monday when the browser can't tell. */
export function localeWeekStart(locale?: string): WeekStart {
  try {
    const resolved = new Intl.Locale(locale ?? Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      getWeekInfo?: () => WeekInfo;
      weekInfo?: WeekInfo;
    };
    const firstDay = resolved.getWeekInfo?.().firstDay ?? resolved.weekInfo?.firstDay;
    if (firstDay === 7) return 0;
    return 1;
  } catch {
    return 1;
  }
}

export function resolveDateOrder(preference: DateOrderPreference): DateOrder {
  return preference === "auto" ? localeDateOrder() : preference;
}

export function resolveWeekStart(preference: WeekStartPreference): WeekStart {
  if (preference === "monday") return 1;
  if (preference === "sunday") return 0;
  return localeWeekStart();
}

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** "YYYY-MM-DD" for a local date. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local date for a "YYYY-MM-DD" string, or null when it isn't a real date. */
export function fromIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return makeDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

function makeDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

/** Shows a "YYYY-MM-DD" date in the given field order, e.g. "26/10/2026". */
export function formatIsoDate(iso: string, order: DateOrder): string {
  const date = fromIsoDate(iso);
  if (!date) return "";
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = String(date.getFullYear());
  if (order === "ymd") return `${y}-${m}-${d}`;
  return order === "mdy" ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}

/**
 * Reads a typed date in the given field order and returns it as "YYYY-MM-DD", or null when it
 * isn't a real date. Any non-digit separator works, two-digit years mean 20xx, and a leading
 * four-digit year is always read as year-month-day.
 */
export function parseDateInput(text: string, order: DateOrder): string | null {
  const fields = text.trim().split(/\D+/).filter(Boolean);
  if (fields.length !== 3) return null;
  const effectiveOrder = fields[0].length === 4 ? "ymd" : order;
  const [a, b, c] = fields.map(Number);
  const [year, month, day] =
    effectiveOrder === "ymd" ? [a, b, c] : effectiveOrder === "mdy" ? [c, a, b] : [c, b, a];
  const fullYear = fields[effectiveOrder === "ymd" ? 0 : 2].length <= 2 ? 2000 + year : year;
  const date = makeDate(fullYear, month, day);
  return date ? toIsoDate(date) : null;
}

/** The 42 days (6 weeks) shown for a month, starting on the configured first day of the week. */
export function calendarDays(year: number, month: number, weekStart: WeekStart): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - offset + i));
}

export interface DayFormatOptions {
  /** "none" leaves the year out. */
  year?: "numeric" | "2-digit" | "none";
  weekday?: "short" | "long";
  /** Format in this time zone instead of the browser's, e.g. "UTC" for UTC calendar days. */
  timeZone?: string;
}

/** A day with a short month name in the given field order: "25 Oct 2026", "Oct 25, 2026" or "2026 Oct 25". */
export function formatDay(date: Date, order: DateOrder, options: DayFormatOptions = {}): string {
  const part = (o: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString("en-US", { ...o, timeZone: options.timeZone });
  const day = part({ day: "numeric" });
  const month = part({ month: "short" });
  const yearOption = options.year ?? "numeric";
  const year = yearOption === "none" ? "" : part({ year: yearOption });
  const text =
    order === "mdy"
      ? `${month} ${day}${year ? `, ${year}` : ""}`
      : (order === "dmy" ? [day, month, year] : [year, month, day]).filter(Boolean).join(" ");
  return options.weekday ? `${part({ weekday: options.weekday })}, ${text}` : text;
}

/** A month with its year in the given field order: "Oct 2026" or "2026 Oct". */
export function formatMonthYear(date: Date, order: DateOrder): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = String(date.getFullYear());
  return order === "ymd" ? `${year} ${month}` : `${month} ${year}`;
}

/** A day plus its time of day, e.g. "25 Oct 2026, 02:30 PM". */
export function formatDayTime(date: Date, order: DateOrder): string {
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${formatDay(date, order)}, ${time}`;
}

/** Position of a date within its week (0 = first day of the week). */
export function weekdayPosition(day: number, weekStart: WeekStart): number {
  return (day - weekStart + 7) % 7;
}

const weekdayNamesFromSunday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Weekday names in display order, starting on the first day of the week. */
export function weekdayNames(weekStart: WeekStart): string[] {
  return Array.from({ length: 7 }, (_, i) => weekdayNamesFromSunday[(weekStart + i) % 7]);
}
