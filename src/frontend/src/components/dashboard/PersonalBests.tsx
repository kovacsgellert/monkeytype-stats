import { Link } from "@tanstack/react-router";
import type { PersonalBest } from "../../api/profile";
import { formatLanguage } from "../../utils/languageUtils";
import { cardClass } from "../ui";
import { formatDate } from "../../utils/format";

/** The fastest official PB per mode + length, from Monkeytype's own list. */
export function PersonalBests({ personalBests }: { personalBests: PersonalBest[] }) {
  const best = new Map<string, PersonalBest>();
  for (const pb of personalBests) {
    const key = `${pb.mode} ${pb.mode2}`;
    const current = best.get(key);
    if (!current || pb.wpm > current.wpm) best.set(key, pb);
  }
  const rows = [...best.values()].sort((a, b) =>
    a.mode === b.mode ? Number(a.mode2) - Number(b.mode2) : a.mode.localeCompare(b.mode),
  );

  return (
    <section aria-labelledby="pbs-heading" className={cardClass}>
      <h2 id="pbs-heading" className="mb-3 text-lg font-semibold text-zinc-100">
        Personal bests
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-400">Official personal bests appear after the next daily import.</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {rows.map((pb) => (
            <li key={`${pb.mode}-${pb.mode2}`}>
              <Link
                to="/explorer"
                search={{ mode: pb.mode, mode2: pb.mode2, language: pb.language ?? undefined }}
                className="flex items-center justify-between gap-3 py-2.5 hover:text-cyan-300"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-zinc-100">
                    {pb.mode} {pb.mode2} · {formatLanguage(pb.language ?? "english")}
                    {pb.punctuation ? " · punct." : ""}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {formatDate(pb.timestamp)}
                    {pb.acc !== null ? ` · ${pb.acc.toFixed(1)}% acc` : ""}
                  </div>
                </div>
                <div className="shrink-0 font-mono text-lg font-bold text-emerald-400">{pb.wpm.toFixed(1)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
