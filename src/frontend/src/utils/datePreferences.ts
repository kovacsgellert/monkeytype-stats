import {
  defaultDatePreferences,
  resolveDateOrder,
  resolveWeekStart,
  type DateOrder,
  type DatePreferences,
  type WeekStart,
} from "./dates";

const STORAGE_KEY = "monkeytype-stats-date-preferences";
const listeners = new Set<() => void>();
let cached: DatePreferences | null = null;

/** The date preferences saved in this browser. */
export function readDatePreferences(): DatePreferences {
  if (cached) return cached;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DatePreferences> | null;
    cached = { ...defaultDatePreferences, ...stored };
  } catch {
    cached = defaultDatePreferences;
  }
  return cached;
}

export function subscribeToDatePreferences(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Saves the date preferences for this browser and notifies everything that shows dates. */
export function saveDatePreferences(preferences: DatePreferences) {
  cached = preferences;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // storage unavailable; the preference only lasts until reload
  }
  listeners.forEach((listener) => listener());
}

/** What the saved preferences resolve to in this browser, for code outside React components. */
export function currentDateSettings(): { dateOrder: DateOrder; weekStart: WeekStart } {
  const preferences = readDatePreferences();
  return {
    dateOrder: resolveDateOrder(preferences.dateOrder),
    weekStart: resolveWeekStart(preferences.weekStart),
  };
}
