import { useState } from "react";
import type { MonkeyTypeProfile } from "../../api/profile";
import { canWrite, useCurrentUser } from "../../hooks/useAuth";
import { useLeaderboardHistory } from "../../hooks/useProfile";
import { cardClass, Pill, Sparkline } from "../ui";
import { formatDate, formatNumber } from "../../utils/format";

const MIN_HISTORY_POINTS = 7;

interface CommunityStandingProps {
  profile: MonkeyTypeProfile | undefined;
  isLoading: boolean;
  importedTests: number;
}

function Histogram({ buckets, wpm }: { buckets: Record<string, number>; wpm: number | null }) {
  const entries = Object.entries(buckets)
    .filter(([key]) => key !== "Other")
    .map(([key, count]) => ({ floor: Number(key), count }))
    .sort((a, b) => a.floor - b.floor);
  const maxCount = Math.max(...entries.map((e) => e.count));
  const userFloor = wpm === null ? null : Math.floor(wpm / 10) * 10;
  const total = entries.reduce((s, e) => s + e.count, 0);
  const below = userFloor === null ? 0 : entries.filter((e) => e.floor < userFloor).reduce((s, e) => s + e.count, 0);

  return (
    <figure>
      <div
        role="img"
        aria-label={`Distribution of ${formatNumber(total)} typists' personal bests in 10-WPM buckets${userFloor !== null ? `; your bucket is ${userFloor}–${userFloor + 9} WPM` : ""}`}
        className="flex h-28 items-end gap-[2px]"
      >
        {entries.map((e) => (
          <div
            key={e.floor}
            title={`${e.floor}–${e.floor + 9} WPM: ${formatNumber(e.count)} typists`}
            className={`flex-1 rounded-t-sm ${e.floor === userFloor ? "bg-cyan-400" : e.floor < (userFloor ?? -1) ? "bg-cyan-900" : "bg-zinc-700"}`}
            style={{ height: `${Math.max(2, (e.count / maxCount) * 100)}%` }}
          />
        ))}
      </div>
      <figcaption className="mt-1 flex justify-between text-[11px] text-zinc-400">
        <span>0 WPM</span>
        <span>{entries[entries.length - 1]?.floor ?? 0}+ WPM</span>
      </figcaption>
      {userFloor !== null && total > 0 ? (
        <p className="mt-2 text-xs text-zinc-400">
          {formatNumber((below / total) * 100, 0)}% of typists have a personal best below your {userFloor}–{userFloor + 9} WPM bucket.
        </p>
      ) : null}
    </figure>
  );
}

export function CommunityStanding({ profile, isLoading, importedTests }: CommunityStandingProps) {
  const currentUser = useCurrentUser();
  const [mode2, setMode2] = useState("60");
  const historyQuery = useLeaderboardHistory(mode2);

  if (isLoading) return <div className={`${cardClass} h-64 animate-pulse`} />;

  const board = profile?.leaderboards.find((l) => l.mode2 === mode2) ?? null;
  const snapshot = profile?.profile ?? null;
  const history = (historyQuery.data ?? []).filter((p) => p.rank !== null);

  return (
    <section aria-labelledby="standing-heading" className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="standing-heading" className="text-lg font-semibold text-zinc-100 sm:text-xl">
          Community standing
        </h2>
        <div role="group" aria-label="Leaderboard" className="flex gap-1.5">
          {["15", "60"].map((m) => (
            <Pill key={m} active={mode2 === m} onClick={() => setMode2(m)}>
              english {m}s
            </Pill>
          ))}
        </div>
      </div>

      {!board ? (
        <p className="text-sm text-zinc-400">
          Leaderboard data is imported once a day — the first snapshot appears after the next import
          {canWrite(currentUser.data) ? " (or run one from Settings)" : ""}.
        </p>
      ) : (
        <div className="flex flex-wrap gap-6">
          <div className="min-w-0 flex-1 basis-72">
            {board.rank !== null && board.topPercent !== null ? (
              <>
                <p className="text-2xl font-semibold leading-snug text-zinc-100 sm:text-3xl">
                  Faster than <span className="text-cyan-400">{formatNumber(100 - board.topPercent, 0)}%</span> of
                  ranked typists in english {mode2}s
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Rank #{formatNumber(board.rank)} of {formatNumber(board.leaderboardSize ?? 0)}
                  {board.wpm !== null ? ` · held by your ${board.wpm.toFixed(1)} WPM best` : ""}
                  {board.entryTimestamp ? ` from ${formatDate(board.entryTimestamp)}` : ""}.
                </p>
              </>
            ) : (
              <p className="text-base text-zinc-300">
                You're not on the english {mode2}s leaderboard yet — complete a {mode2}-second english test to
                appear there.
              </p>
            )}

            <div className="mt-5">
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400">Rank over time</h3>
              {history.length >= MIN_HISTORY_POINTS ? (
                <>
                  {/* lower rank is better, so plot the negative to make "up" mean improving */}
                  <Sparkline values={history.map((p) => -(p.rank as number))} label="Daily leaderboard rank, higher is better" />
                  <p className="text-xs text-zinc-400">
                    {(() => {
                      const change = (history[0].rank as number) - (history[history.length - 1].rank as number);
                      return change === 0
                        ? `Unchanged since ${formatDate(history[0].capturedAt)}.`
                        : `${change > 0 ? "Up" : "Down"} ${formatNumber(Math.abs(change))} places since ${formatDate(history[0].capturedAt)}.`;
                    })()}
                  </p>
                </>
              ) : (
                <p className="text-xs text-zinc-400">
                  Fills in with one point per day — {history.length} of {MIN_HISTORY_POINTS} days collected so far.
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 basis-72">
            {board.speedHistogram ? (
              <>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Where your best sits among all typists
                </h3>
                <Histogram buckets={board.speedHistogram} wpm={board.wpm} />
              </>
            ) : null}
          </div>
        </div>
      )}

      {snapshot ? (
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-zinc-400">Completed / started</dt>
            <dd className="font-mono text-zinc-100">
              {formatNumber(snapshot.completedTests)} / {formatNumber(snapshot.startedTests)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Completion rate</dt>
            <dd className="font-mono text-zinc-100">
              {snapshot.startedTests > 0 ? `${((snapshot.completedTests / snapshot.startedTests) * 100).toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Lifetime typing</dt>
            <dd className="font-mono text-zinc-100">{(snapshot.timeTypingSeconds / 3600).toFixed(1)} h</dd>
          </div>
          <div>
            <dt className="text-zinc-400">Streak</dt>
            <dd className="font-mono text-zinc-100">
              {snapshot.streakLength} d <span className="text-zinc-500">(best {snapshot.maxStreakLength})</span>
            </dd>
          </div>
          {snapshot.completedTests > importedTests ? (
            <p className="col-span-full text-xs text-zinc-400">
              {formatNumber(snapshot.completedTests - importedTests)} tests from before your import aren't in local
              history — Monkeytype only serves your latest 1,000 results.
            </p>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}
