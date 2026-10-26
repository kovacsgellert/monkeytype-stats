import { useMemo, useState, type FormEvent } from "react";
import type { Goal, GoalType, SaveGoalRequest } from "../../api/goals";
import type { ResultFilter } from "../../stats/filter";
import { goalTypes, leaderboardMode2 } from "../../stats/goals";
import type { Track } from "../../stats/tracks";
import { formatLanguage } from "../../utils/languageUtils";
import { DatePicker } from "../DatePicker";
import { buttonClass, inputClass, primaryButtonClass } from "../ui";

interface GoalFormProps {
  tracks: Track[];
  languages: string[];
  initial?: Goal;
  saving: boolean;
  error: string | null;
  onSave: (request: SaveGoalRequest) => void;
  onCancel: () => void;
}

type Scope = { kind: "track"; key: string } | { kind: "all" } | { kind: "custom" };

function scopeFromFilter(filter: ResultFilter | null, tracks: Track[]): Scope {
  if (!filter || Object.keys(filter).length === 0) return tracks[0] ? { kind: "track", key: tracks[0].key } : { kind: "all" };
  const track = tracks.find((t) => JSON.stringify(t.filter) === JSON.stringify(filter));
  return track ? { kind: "track", key: track.key } : { kind: "custom" };
}

const defaultTargets: Record<GoalType, number> = {
  form: 70,
  "personal-best": 80,
  accuracy: 97,
  "practice-volume": 20,
  streak: 14,
  leaderboard: 25,
};

const labelClass = "flex flex-col gap-1 text-sm text-zinc-300";

export function GoalForm({ tracks, languages, initial, saving, error, onSave, onCancel }: GoalFormProps) {
  const [type, setType] = useState<GoalType>(initial?.type ?? "form");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [target, setTarget] = useState(String(initial?.target ?? defaultTargets.form));
  const [windowSize, setWindowSize] = useState(String(initial?.windowSize ?? 20));
  const [deadline, setDeadline] = useState(initial?.deadline?.slice(0, 10) ?? "");
  const [scope, setScope] = useState<Scope>(() => scopeFromFilter(initial?.filter ?? null, tracks));
  const [custom, setCustom] = useState<ResultFilter>(initial?.filter ?? {});
  const [board, setBoard] = useState(initial ? leaderboardMode2(initial) : "60");

  const typeInfo = goalTypes.find((t) => t.key === type)!;

  const filter = useMemo<ResultFilter | null>(() => {
    if (type === "leaderboard") return { mode2: board };
    if (!typeInfo.usesFilter || scope.kind === "all") return null;
    if (scope.kind === "track") return tracks.find((t) => t.key === scope.key)?.filter ?? null;
    return Object.fromEntries(Object.entries(custom).filter(([, v]) => v !== undefined && v !== "")) as ResultFilter;
  }, [type, typeInfo, scope, tracks, custom, board]);

  const scopeName =
    type === "leaderboard"
      ? `english ${board}s`
      : scope.kind === "track"
        ? (tracks.find((t) => t.key === scope.key)?.name ?? "")
        : scope.kind === "all"
          ? "all tests"
          : [custom.mode, custom.mode2, custom.language].filter(Boolean).join(" ") || "custom filter";

  const suggestedTitle = (() => {
    const t = Number(target) || 0;
    switch (type) {
      case "form":
        return `${t} WPM form in ${scopeName}`;
      case "personal-best":
        return `${t} WPM test in ${scopeName}`;
      case "accuracy":
        return `${t}% accuracy in ${scopeName}`;
      case "practice-volume":
        return `${t} tests a week`;
      case "streak":
        return `${t}-day streak`;
      case "leaderboard":
        return `Top ${t}% in ${scopeName}`;
    }
  })();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      title: title.trim() || suggestedTitle,
      filter,
      target: Number(target),
      windowSize: typeInfo.usesWindow ? Number(windowSize) : null,
      deadline: deadline ? new Date(deadline + "T23:59:59").toISOString() : null,
      startedAt: initial?.startedAt ?? null,
      achievedAt: initial?.achievedAt ?? null,
      archivedAt: initial?.archivedAt ?? null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-cyan-800/60 bg-zinc-900/70 p-5">
      <h3 className="text-lg font-semibold text-zinc-100">{initial ? "Edit goal" : "New goal"}</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Type
          <select
            value={type}
            onChange={(e) => {
              const next = e.target.value as GoalType;
              setType(next);
              if (!initial) setTarget(String(defaultTargets[next]));
            }}
            className={inputClass}
          >
            {goalTypes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-400">{typeInfo.description}</span>
        </label>

        {type === "leaderboard" ? (
          <label className={labelClass}>
            Leaderboard
            <select value={board} onChange={(e) => setBoard(e.target.value)} className={inputClass}>
              <option value="60">english · time 60</option>
              <option value="15">english · time 15</option>
            </select>
          </label>
        ) : typeInfo.usesFilter ? (
          <label className={labelClass}>
            Applies to
            <select
              value={scope.kind === "track" ? `track:${scope.key}` : scope.kind}
              onChange={(e) => {
                const v = e.target.value;
                setScope(v.startsWith("track:") ? { kind: "track", key: v.slice(6) } : v === "all" ? { kind: "all" } : { kind: "custom" });
              }}
              className={inputClass}
            >
              {tracks.map((t) => (
                <option key={t.key} value={`track:${t.key}`}>
                  Track: {t.name}
                </option>
              ))}
              <option value="all">All tests</option>
              <option value="custom">Custom filter…</option>
            </select>
          </label>
        ) : null}
      </div>

      {typeInfo.usesFilter && scope.kind === "custom" && type !== "leaderboard" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className={labelClass}>
            Mode
            <select value={custom.mode ?? ""} onChange={(e) => setCustom({ ...custom, mode: e.target.value || undefined })} className={inputClass}>
              <option value="">Any</option>
              <option value="time">time</option>
              <option value="words">words</option>
              <option value="quote">quote</option>
            </select>
          </label>
          <label className={labelClass}>
            Length
            <input
              value={custom.mode2 ?? ""}
              onChange={(e) => setCustom({ ...custom, mode2: e.target.value || undefined })}
              placeholder="e.g. 60"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Language
            <select value={custom.language ?? ""} onChange={(e) => setCustom({ ...custom, language: e.target.value || undefined })} className={inputClass}>
              <option value="">Any</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {formatLanguage(l)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className={labelClass}>
          Target ({typeInfo.unit})
          <input
            type="number"
            required
            min={type === "leaderboard" ? 0.01 : 1}
            max={type === "accuracy" || type === "leaderboard" ? 100 : undefined}
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className={inputClass}
          />
        </label>
        {typeInfo.usesWindow ? (
          <label className={labelClass}>
            Over the last N tests
            <input type="number" required min={1} max={1000} value={windowSize} onChange={(e) => setWindowSize(e.target.value)} className={inputClass} />
          </label>
        ) : null}
        <label className={labelClass}>
          Deadline (optional)
          <DatePicker value={deadline} onChange={setDeadline} />
        </label>
      </div>

      <label className={labelClass}>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={suggestedTitle} maxLength={100} className={inputClass} />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create goal"}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}
