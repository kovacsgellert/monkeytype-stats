import { useSyncExternalStore } from "react";
import { readDatePreferences, subscribeToDatePreferences } from "../utils/datePreferences";
import { resolveDateOrder, resolveWeekStart } from "../utils/dates";

export { saveDatePreferences } from "../utils/datePreferences";

/** The stored preferences plus what "Automatic" resolves to in this browser. */
export function useDatePreferences() {
  const preferences = useSyncExternalStore(subscribeToDatePreferences, readDatePreferences);
  return {
    preferences,
    dateOrder: resolveDateOrder(preferences.dateOrder),
    weekStart: resolveWeekStart(preferences.weekStart),
  };
}
