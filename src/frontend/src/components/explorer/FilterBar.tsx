import { Link } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { SavedView } from "../../api/savedViews";
import { describeFilter, isEmptyFilter, periodPresets, timesOfDay, type ResultFilter } from "../../stats/filter";
import type { TestResult } from "../../stats/normalize";
import type { Track } from "../../stats/tracks";
import { useDatePreferences } from "../../hooks/useDatePreferences";
import { formatIsoDate } from "../../utils/dates";
import { formatLanguage } from "../../utils/languageUtils";
import { DatePicker } from "../DatePicker";
import { Pill } from "../ui";

interface FilterBarProps {
  results: TestResult[];
  filter: ResultFilter;
  tags: { id: string; name: string }[];
  tracks: Track[];
  savedViews: SavedView[];
  onChange: (patch: Partial<ResultFilter>) => void;
  onReset: () => void;
  onSaveView: () => void;
  onDeleteView: (view: SavedView) => void;
  savingView: boolean;
}

type FacetKey = "period" | "mode" | "length" | "language" | "more" | "views";

interface FacetProps {
  id: FacetKey;
  label: string;
  /** Current value shown on the button; omitted when the facet is at "any". */
  value?: string;
  open: boolean;
  disabled?: boolean;
  align?: "left" | "right";
  onToggle: (id: FacetKey) => void;
  children: ReactNode;
}

function Facet({ id, label, value, open, disabled, align = "left", onToggle, children }: FacetProps) {
  const panelId = useId();
  const active = value !== undefined;
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(id)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          active
            ? "border-cyan-700 bg-cyan-950/60 text-cyan-100"
            : "border-zinc-700/60 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        }`}
      >
        <span className={active ? "text-cyan-300/80" : undefined}>{label}</span>
        {active ? <span className="max-w-40 truncate font-medium">{value}</span> : null}
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div
          id={panelId}
          role="group"
          aria-label={`${label} filter`}
          className={`absolute top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-700/70 bg-zinc-900 p-4 shadow-2xl shadow-black/50 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function OptionGroup({ legend, children }: { legend?: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      {legend ? <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">{legend}</legend> : null}
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function TriState({ legend, value, onChange }: { legend: string; value: boolean | undefined; onChange: (value: boolean | undefined) => void }) {
  return (
    <OptionGroup legend={legend}>
      <Pill active={value === undefined} onClick={() => onChange(undefined)}>Any</Pill>
      <Pill active={value === true} onClick={() => onChange(true)}>On</Pill>
      <Pill active={value === false} onClick={() => onChange(false)}>Off</Pill>
    </OptionGroup>
  );
}

export function FilterBar({
  results,
  filter,
  tags,
  tracks,
  savedViews,
  onChange,
  onReset,
  onSaveView,
  onDeleteView,
  savingView,
}: FilterBarProps) {
  const [open, setOpen] = useState<FacetKey | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = useMemo(() => {
    const years = [...new Set(results.map((r) => r.date.getFullYear()))].sort((a, b) => b - a);
    const modes = [...new Set(results.map((r) => r.mode))].sort();
    const mode2 =
      filter.mode && filter.mode !== "quote"
        ? [...new Set(results.filter((r) => r.mode === filter.mode).map((r) => r.mode2))].sort(
            (a, b) => Number(a) - Number(b) || a.localeCompare(b),
          )
        : [];
    const languageCounts = new Map<string, number>();
    for (const r of results) languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1);
    const languages = [...languageCounts.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l);
    const usedTags = [...new Set(results.flatMap((r) => r.tags))];
    return { years, modes, mode2, languages, usedTags };
  }, [results, filter.mode]);

  const toggle = (id: FacetKey) => setOpen((current) => (current === id ? null : id));
  // single-choice facets close once a value is picked
  const pick = (patch: Partial<ResultFilter>) => {
    onChange(patch);
    setOpen(null);
  };

  const { dateOrder } = useDatePreferences();
  const tagName = (id: string) => tags.find((t) => t.id === id)?.name ?? id;
  const periodLabel = filter.period
    ? (periodPresets.find((p) => p.key === filter.period)?.label ?? filter.period)
    : filter.from || filter.to
      ? `${filter.from ? formatIsoDate(filter.from, dateOrder) : "…"} – ${filter.to ? formatIsoDate(filter.to, dateOrder) : "…"}`
      : undefined;
  const moreCount = [filter.punctuation, filter.numbers, filter.timeOfDay, filter.tag, filter.includeBailed].filter(
    (v) => v !== undefined,
  ).length;
  const moreSummary = describeFilter({
    punctuation: filter.punctuation,
    numbers: filter.numbers,
    timeOfDay: filter.timeOfDay,
    tag: filter.tag,
    includeBailed: filter.includeBailed,
  }, tagName)
    .map((c) => c.label)
    .join(", ");

  return (
    <div
      ref={barRef}
      role="toolbar"
      aria-label="Filters"
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800/70 bg-zinc-950/85 p-2 shadow-lg shadow-black/30 backdrop-blur-md"
    >
      <Facet id="period" label="Period" value={periodLabel} open={open === "period"} onToggle={toggle}>
        <div className="flex flex-col gap-4">
          <OptionGroup>
            <Pill active={!periodLabel} onClick={() => pick({ period: undefined, from: undefined, to: undefined })}>All time</Pill>
            {periodPresets.map((p) => (
              <Pill key={p.key} active={filter.period === p.key} onClick={() => pick({ period: p.key, from: undefined, to: undefined })}>
                {p.label}
              </Pill>
            ))}
            {options.years.map((y) => (
              <Pill key={y} active={filter.period === String(y)} onClick={() => pick({ period: String(y), from: undefined, to: undefined })}>
                {y}
              </Pill>
            ))}
          </OptionGroup>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-zinc-400">
              From
              <DatePicker
                value={filter.period ? "" : (filter.from ?? "")}
                onChange={(value) => onChange({ period: undefined, from: value || undefined })}
                align="left"
                className="mt-1"
              />
            </label>
            <label className="text-xs text-zinc-400">
              To
              <DatePicker
                value={filter.period ? "" : (filter.to ?? "")}
                onChange={(value) => onChange({ period: undefined, to: value || undefined })}
                align="right"
                className="mt-1"
              />
            </label>
          </div>
        </div>
      </Facet>

      <Facet id="mode" label="Mode" value={filter.mode} open={open === "mode"} onToggle={toggle}>
        <OptionGroup>
          <Pill active={!filter.mode} onClick={() => pick({ mode: undefined, mode2: undefined })}>Any</Pill>
          {options.modes.map((m) => (
            <Pill key={m} active={filter.mode === m} onClick={() => pick({ mode: m, mode2: undefined })}>
              {m}
            </Pill>
          ))}
        </OptionGroup>
      </Facet>

      <Facet
        id="length"
        label={filter.mode === "time" ? "Duration" : "Length"}
        value={filter.mode2 ? `${filter.mode2}${filter.mode === "time" ? "s" : ""}` : undefined}
        open={open === "length"}
        disabled={options.mode2.length === 0}
        onToggle={toggle}
      >
        <OptionGroup>
          <Pill active={!filter.mode2} onClick={() => pick({ mode2: undefined })}>Any</Pill>
          {options.mode2.map((m) => (
            <Pill key={m} active={filter.mode2 === m} onClick={() => pick({ mode2: m })}>
              {m}
            </Pill>
          ))}
        </OptionGroup>
      </Facet>

      <Facet id="language" label="Language" value={filter.language ? formatLanguage(filter.language) : undefined} open={open === "language"} onToggle={toggle}>
        <OptionGroup>
          <Pill active={!filter.language} onClick={() => pick({ language: undefined })}>Any</Pill>
          {options.languages.map((l) => (
            <Pill key={l} active={filter.language === l} onClick={() => pick({ language: l })}>
              {formatLanguage(l)}
            </Pill>
          ))}
        </OptionGroup>
      </Facet>

      <Facet id="more" label="More" value={moreCount > 0 ? moreSummary : undefined} open={open === "more"} onToggle={toggle}>
        <div className="flex flex-col gap-4">
          <TriState legend="Punctuation" value={filter.punctuation} onChange={(v) => onChange({ punctuation: v })} />
          <TriState legend="Numbers" value={filter.numbers} onChange={(v) => onChange({ numbers: v })} />
          <OptionGroup legend="Time of day">
            <Pill active={!filter.timeOfDay} onClick={() => onChange({ timeOfDay: undefined })}>Any</Pill>
            {timesOfDay.map((t) => (
              <Pill key={t.key} active={filter.timeOfDay === t.key} onClick={() => onChange({ timeOfDay: t.key })}>
                {t.label}
              </Pill>
            ))}
          </OptionGroup>
          {options.usedTags.length > 0 ? (
            <OptionGroup legend="Tag">
              <Pill active={!filter.tag} onClick={() => onChange({ tag: undefined })}>Any</Pill>
              {options.usedTags.map((id) => (
                <Pill key={id} active={filter.tag === id} onClick={() => onChange({ tag: id })}>
                  {tagName(id)}
                </Pill>
              ))}
            </OptionGroup>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={filter.includeBailed ?? false}
              onChange={(e) => onChange({ includeBailed: e.target.checked || undefined })}
              className="h-4 w-4 accent-cyan-500"
            />
            Include bailed-out tests
          </label>
        </div>
      </Facet>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {!isEmptyFilter(filter) ? (
          <button
            type="button"
            onClick={() => {
              onReset();
              setOpen(null);
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-cyan-400 hover:bg-zinc-800 hover:text-cyan-300"
          >
            Clear all
          </button>
        ) : null}
        <Facet id="views" label="Views" open={open === "views"} align="right" onToggle={toggle}>
          <ul className="flex flex-col gap-0.5 text-sm">
            {tracks.map((t) => (
              <li key={t.key}>
                <Link
                  to="/explorer"
                  search={t.filter}
                  resetScroll={false}
                  onClick={() => setOpen(null)}
                  className="block truncate rounded-md px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-cyan-300"
                >
                  <span className="text-zinc-500" aria-hidden="true">▸ </span>
                  {t.name} <span className="text-zinc-500">· track</span>
                </Link>
              </li>
            ))}
            {savedViews.map((v) => (
              <li key={v.id} className="flex items-center gap-1">
                <Link
                  to="/explorer"
                  search={v.filter}
                  resetScroll={false}
                  onClick={() => setOpen(null)}
                  className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-cyan-300"
                >
                  <span className="text-amber-400" aria-hidden="true">★ </span>
                  {v.name}
                </Link>
                <button
                  type="button"
                  onClick={() => onDeleteView(v)}
                  aria-label={`Delete saved view ${v.name}`}
                  className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(null);
              onSaveView();
            }}
            disabled={savingView}
            className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-cyan-400 hover:bg-zinc-800 hover:text-cyan-300 disabled:opacity-50"
          >
            + Save current filters
          </button>
        </Facet>
      </div>
    </div>
  );
}
