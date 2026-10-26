import { saveDatePreferences, useDatePreferences } from "../hooks/useDatePreferences";
import {
  dateOrderLabels,
  localeDateOrder,
  localeWeekStart,
  type DateOrder,
  type DateOrderPreference,
  type WeekStartPreference,
} from "../utils/dates";
import { inputClass } from "./ui";

const dateOrders: DateOrder[] = ["dmy", "mdy", "ymd"];

export function DisplaySettings() {
  const { preferences } = useDatePreferences();
  const autoOrder = dateOrderLabels[localeDateOrder()];
  const autoWeekStart = localeWeekStart() === 1 ? "Monday" : "Sunday";

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-lg shadow-black/20 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">Display</p>
        <p className="text-sm text-zinc-500 mt-1 max-w-xl">
          How dates are shown and typed across the app, and which day weeks start on in the calendar, heatmap and weekly stats. Automatic follows this browser's language. Saved in this browser only.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-zinc-400">
          Date format
          <select
            value={preferences.dateOrder}
            onChange={(event) =>
              saveDatePreferences({ ...preferences, dateOrder: event.target.value as DateOrderPreference })
            }
            className={`${inputClass} mt-1`}
          >
            <option value="auto">Automatic ({autoOrder})</option>
            {dateOrders.map((order) => (
              <option key={order} value={order}>
                {dateOrderLabels[order]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-zinc-400">
          Week starts on
          <select
            value={preferences.weekStart}
            onChange={(event) =>
              saveDatePreferences({ ...preferences, weekStart: event.target.value as WeekStartPreference })
            }
            className={`${inputClass} mt-1`}
          >
            <option value="auto">Automatic ({autoWeekStart})</option>
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </select>
        </label>
      </div>
    </section>
  );
}
