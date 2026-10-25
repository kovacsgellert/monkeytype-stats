import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { SavedView } from "../../api/savedViews";
import { periodPresets, timesOfDay, type ResultFilter } from "../../stats/filter";
import type { TestResult } from "../../stats/normalize";
import type { Track } from "../../stats/tracks";
import { formatLanguage } from "../../utils/languageUtils";
import { inputClass, Pill } from "../ui";

interface FilterSidebarProps {
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

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function TriState({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}) {
  return (
    <FilterGroup legend={label}>
      <Pill active={value === undefined} onClick={() => onChange(undefined)}>Any</Pill>
      <Pill active={value === true} onClick={() => onChange(true)}>On</Pill>
      <Pill active={value === false} onClick={() => onChange(false)}>Off</Pill>
    </FilterGroup>
  );
}

export function FilterSidebar({
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
}: FilterSidebarProps) {
  const options = useMemo(() => {
    const years = [...new Set(results.map((r) => r.date.getFullYear()))].sort((a, b) => b - a);
    const modes = [...new Set(results.map((r) => r.mode))].sort();
    const mode2 = filter.mode && filter.mode !== "quote"
      ? [...new Set(results.filter((r) => r.mode === filter.mode).map((r) => r.mode2))].sort(
          (a, b) => Number(a) - Number(b) || a.localeCompare(b),
        )
      : [];
    const languageCounts = new Map<string, number>();
    for (const r of results) languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1);
    const languages = [...languageCounts.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l);
    const usedTags = new Set(results.flatMap((r) => r.tags));
    return { years, modes, mode2, languages, usedTags };
  }, [results, filter.mode]);

  const tagOptions = [...options.usedTags].map((id) => ({
    id,
    name: tags.find((t) => t.id === id)?.name ?? id,
  }));

  return (
    <aside
      aria-label="Filters"
      className="flex min-w-0 flex-col gap-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">Filters</h2>
        <button type="button" onClick={onReset} className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
          Reset
        </button>
      </div>

      <FilterGroup legend="Period">
        <Pill active={!filter.period && !filter.from && !filter.to} onClick={() => onChange({ period: undefined, from: undefined, to: undefined })}>
          All
        </Pill>
        {periodPresets.map((p) => (
          <Pill key={p.key} active={filter.period === p.key} onClick={() => onChange({ period: p.key, from: undefined, to: undefined })}>
            {p.label.replace("Last ", "")}
          </Pill>
        ))}
        {options.years.map((y) => (
          <Pill key={y} active={filter.period === String(y)} onClick={() => onChange({ period: String(y), from: undefined, to: undefined })}>
            {y}
          </Pill>
        ))}
      </FilterGroup>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-zinc-400">
          From
          <input
            type="date"
            value={filter.period ? "" : (filter.from ?? "")}
            onChange={(e) => onChange({ period: undefined, from: e.target.value || undefined })}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="text-xs text-zinc-400">
          To
          <input
            type="date"
            value={filter.period ? "" : (filter.to ?? "")}
            onChange={(e) => onChange({ period: undefined, to: e.target.value || undefined })}
            className={`${inputClass} mt-1`}
          />
        </label>
      </div>

      <FilterGroup legend="Mode">
        <Pill active={!filter.mode} onClick={() => onChange({ mode: undefined, mode2: undefined })}>Any</Pill>
        {options.modes.map((m) => (
          <Pill key={m} active={filter.mode === m} onClick={() => onChange({ mode: m, mode2: undefined })}>
            {m}
          </Pill>
        ))}
      </FilterGroup>

      {options.mode2.length > 0 ? (
        <FilterGroup legend={filter.mode === "time" ? "Duration (s)" : "Length"}>
          <Pill active={!filter.mode2} onClick={() => onChange({ mode2: undefined })}>Any</Pill>
          {options.mode2.map((m) => (
            <Pill key={m} active={filter.mode2 === m} onClick={() => onChange({ mode2: m })}>
              {m}
            </Pill>
          ))}
        </FilterGroup>
      ) : null}

      <FilterGroup legend="Language">
        <Pill active={!filter.language} onClick={() => onChange({ language: undefined })}>Any</Pill>
        {options.languages.map((l) => (
          <Pill key={l} active={filter.language === l} onClick={() => onChange({ language: l })}>
            {formatLanguage(l)}
          </Pill>
        ))}
      </FilterGroup>

      <TriState label="Punctuation" value={filter.punctuation} onChange={(v) => onChange({ punctuation: v })} />
      <TriState label="Numbers" value={filter.numbers} onChange={(v) => onChange({ numbers: v })} />

      <FilterGroup legend="Time of day">
        <Pill active={!filter.timeOfDay} onClick={() => onChange({ timeOfDay: undefined })}>Any</Pill>
        {timesOfDay.map((t) => (
          <Pill key={t.key} active={filter.timeOfDay === t.key} onClick={() => onChange({ timeOfDay: t.key })}>
            {t.label}
          </Pill>
        ))}
      </FilterGroup>

      {tagOptions.length > 0 ? (
        <FilterGroup legend="Tag">
          <Pill active={!filter.tag} onClick={() => onChange({ tag: undefined })}>Any</Pill>
          {tagOptions.map((t) => (
            <Pill key={t.id} active={filter.tag === t.id} onClick={() => onChange({ tag: t.id })}>
              {t.name}
            </Pill>
          ))}
        </FilterGroup>
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

      <div className="border-t border-zinc-800 pt-4">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Views</h3>
        <ul className="flex flex-col gap-1 text-sm">
          {tracks.map((t) => (
            <li key={t.key}>
              <Link to="/explorer" search={t.filter} className="block truncate rounded-md px-2 py-1.5 text-zinc-300 hover:bg-zinc-800/60 hover:text-cyan-300">
                <span className="text-zinc-500" aria-hidden="true">▸ </span>
                {t.name} <span className="text-zinc-500">· track</span>
              </Link>
            </li>
          ))}
          {savedViews.map((v) => (
            <li key={v.id} className="flex items-center gap-1">
              <Link to="/explorer" search={v.filter} className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-zinc-300 hover:bg-zinc-800/60 hover:text-cyan-300">
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
          onClick={onSaveView}
          disabled={savingView}
          className="mt-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
        >
          + Save current filters
        </button>
      </div>
    </aside>
  );
}
