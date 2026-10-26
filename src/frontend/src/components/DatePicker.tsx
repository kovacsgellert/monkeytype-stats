import { useEffect, useRef, useState } from "react";
import { useDatePreferences } from "../hooks/useDatePreferences";
import {
  calendarDays,
  dateOrderLabels,
  formatDay,
  formatIsoDate,
  formatMonthYear,
  fromIsoDate,
  parseDateInput,
  toIsoDate,
} from "../utils/dates";
import { inputClass } from "./ui";

interface DatePickerProps {
  /** "YYYY-MM-DD", or "" for no date. */
  value: string;
  onChange: (value: string) => void;
  /** Which edge of the field the calendar lines up with. */
  align?: "left" | "right";
  className?: string;
}

/**
 * Date field that follows the date format and first day of the week chosen in Settings,
 * instead of whatever the browser's built-in date input uses.
 */
export function DatePicker({ value, onChange, align = "left", className = "" }: DatePickerProps) {
  const { dateOrder, weekStart } = useDatePreferences();
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => monthOf(value));
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // keep the Escape from also closing a surrounding panel
        event.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  const commit = (iso: string) => {
    setDraft(null);
    setInvalid(false);
    if (iso !== value) onChange(iso);
  };

  const commitDraft = () => {
    if (draft === null) return;
    if (!draft.trim()) return commit("");
    const parsed = parseDateInput(draft, dateOrder);
    if (parsed) commit(parsed);
    else setInvalid(true);
  };

  const toggleCalendar = () => {
    if (!open) setView(monthOf(value));
    setOpen((current) => !current);
  };

  const days = calendarDays(view.year, view.month, weekStart);
  const today = toIsoDate(new Date());
  const monthLabel = formatMonthYear(new Date(view.year, view.month, 1), dateOrder);
  const shiftMonth = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={dateOrderLabels[dateOrder]}
          aria-invalid={invalid || undefined}
          value={draft ?? formatIsoDate(value, dateOrder)}
          onChange={(event) => {
            setDraft(event.target.value);
            setInvalid(false);
          }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft();
            }
          }}
          className={`${inputClass} pr-9 ${invalid ? "border-rose-500/70 focus:border-rose-500/70" : ""}`}
        />
        <button
          type="button"
          aria-label="Choose date"
          aria-expanded={open}
          onClick={toggleCalendar}
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-zinc-400 hover:text-zinc-100"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </button>
      </div>
      {invalid ? <p className="mt-1 text-xs text-rose-400">Use {dateOrderLabels[dateOrder]}</p> : null}

      {open ? (
        <div
          role="dialog"
          aria-label="Choose date"
          className={`absolute top-full z-40 mt-2 w-64 rounded-xl border border-zinc-700/70 bg-zinc-900 p-3 shadow-2xl shadow-black/50 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} className={navButtonClass}>
              ‹
            </button>
            <span className="text-sm font-semibold text-zinc-100">{monthLabel}</span>
            <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} className={navButtonClass}>
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {days.slice(0, 7).map((day) => (
              <span key={day.getDay()} className="py-1 text-[11px] font-medium text-zinc-500">
                {day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
              </span>
            ))}
            {days.map((day) => {
              const iso = toIsoDate(day);
              const inMonth = day.getMonth() === view.month;
              const selected = iso === value;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={selected}
                  aria-label={formatDay(day, dateOrder, { weekday: "long" })}
                  onClick={() => {
                    commit(iso);
                    setOpen(false);
                  }}
                  className={`rounded-md py-1.5 text-xs transition-colors ${
                    selected
                      ? "bg-cyan-500/30 font-semibold text-cyan-100"
                      : `${inMonth ? "text-zinc-200" : "text-zinc-600"} hover:bg-zinc-800 ${
                          iso === today ? "ring-1 ring-inset ring-cyan-500/50" : ""
                        }`
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between border-t border-zinc-800 pt-2">
            <button
              type="button"
              onClick={() => {
                commit("");
                setOpen(false);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                commit(today);
                setOpen(false);
              }}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const navButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100";

function monthOf(iso: string) {
  const date = fromIsoDate(iso) ?? new Date();
  return { year: date.getFullYear(), month: date.getMonth() };
}
