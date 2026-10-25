import { Link } from "@tanstack/react-router";
import type { Track } from "../../stats/tracks";
import { SectionHeading, Sparkline } from "../ui";
import { formatNumber, formatRelativeDays, signed } from "../../utils/format";

const MAX_CARDS = 4;

export function TrackCards({ tracks }: { tracks: Track[] }) {
  if (tracks.length === 0) return null;
  const hidden = tracks.length - MAX_CARDS;

  return (
    <section aria-labelledby="tracks-heading">
      <div id="tracks-heading">
        <SectionHeading
          title="Your tracks"
          subtitle={`Setting combinations you keep coming back to${hidden > 0 ? ` · ${hidden} smaller hidden` : ""}`}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tracks.slice(0, MAX_CARDS).map((track, i) => (
          <Link
            key={track.key}
            to="/explorer"
            search={track.filter}
            className={`flex flex-col gap-2 rounded-2xl border bg-zinc-900/50 p-4 backdrop-blur-sm transition-colors hover:bg-zinc-800/50 ${i === 0 ? "border-cyan-800/70" : "border-zinc-800/50"}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="truncate font-semibold text-zinc-100">{track.name}</h3>
              <span className="shrink-0 text-xs text-zinc-400">{formatNumber(track.tests)} tests</span>
            </div>
            <p className="truncate text-xs text-zinc-400">
              {i === 0 ? "Main track · " : ""}
              {track.settings}
            </p>
            <div className="flex items-end gap-4">
              <div>
                <div className="font-mono text-2xl font-bold text-cyan-400">{track.form.toFixed(1)}</div>
                <div className="text-xs text-zinc-400">form · last 20</div>
              </div>
              <div>
                <div className="font-mono text-base font-semibold text-zinc-100">{track.best.toFixed(1)}</div>
                <div className="text-xs text-zinc-400">best</div>
              </div>
              <div>
                <div className="font-mono text-base font-semibold text-emerald-400">
                  {track.wpmPerHour !== null ? signed(track.wpmPerHour) : "—"}
                </div>
                <div className="text-xs text-zinc-400">WPM / hour</div>
              </div>
            </div>
            <Sparkline values={track.series} height={44} label={`${track.name} rolling 20-test average`} />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{track.hours.toFixed(1)} h practiced</span>
              <span>last {formatRelativeDays(track.lastPracticed)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
