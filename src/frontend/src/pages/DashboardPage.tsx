import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { CommunityStanding } from "../components/dashboard/CommunityStanding";
import { GoalsSummary } from "../components/dashboard/GoalsSummary";
import { InsightCard } from "../components/dashboard/InsightCard";
import { PersonalBests } from "../components/dashboard/PersonalBests";
import { TrackCards } from "../components/dashboard/TrackCards";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import { buttonClass, EmptyState, StatTile } from "../components/ui";
import { formatDate, formatNumber, formatRelativeDays, signed } from "../utils/format";
import { useGoalProgress } from "../hooks/useGoalProgress";
import { useProfile } from "../hooks/useProfile";
import { max, mean, recentVsPrevious, totalHours } from "../stats/aggregate";
import { breakRecovery, computeInsights } from "../stats/insights";
import { isPerformance } from "../stats/normalize";

const WELCOME_BACK_DAYS = 14;
const MAX_INSIGHT_CARDS = 6;

export function DashboardPage() {
  const { resultsQuery, results, tracks, goals } = useGoalProgress();
  const profileQuery = useProfile();
  const profile = profileQuery.data;

  const insights = useMemo(() => computeInsights({ results, tracks }), [results, tracks]);

  const vitals = useMemo(() => {
    const perf = results.filter(isPerformance);
    const wpms = perf.map((r) => r.wpm);
    const { recent, previous } = recentVsPrevious(wpms, 20);
    const officialBest = profile?.personalBests.reduce<(typeof profile.personalBests)[number] | null>(
      (best, pb) => (!best || pb.wpm > best.wpm ? pb : best),
      null,
    );
    return {
      recent,
      previous,
      best: officialBest?.wpm ?? max(wpms),
      bestLabel: officialBest ? `${officialBest.mode} ${officialBest.mode2} · ${formatDate(officialBest.timestamp)}` : "best imported test",
      acc: mean(perf.map((r) => r.acc)),
      cons: mean(perf.map((r) => r.consistency)),
      importedHours: totalHours(results),
    };
  }, [results, profile]);

  if (resultsQuery.isLoading) return <DashboardSkeleton />;
  if (resultsQuery.isError)
    return (
      <EmptyState title="Failed to load results">
        <p>{resultsQuery.error instanceof Error ? resultsQuery.error.message : "An unexpected error occurred"}</p>
        <button type="button" onClick={() => resultsQuery.refetch()} className={`${buttonClass} mt-4`}>
          Try again
        </button>
      </EmptyState>
    );
  if (results.length === 0)
    return (
      <EmptyState title="No results yet">
        Import your Monkeytype results from{" "}
        <Link to="/settings" className="text-cyan-400 hover:text-cyan-300">
          Settings
        </Link>{" "}
        to see your insights.
      </EmptyState>
    );

  const lastTest = results[results.length - 1];
  const daysSinceLast = (Date.now() - lastTest.date.getTime()) / 86_400_000;
  const mainTrack = tracks[0];
  const recovery = breakRecovery(tracks);
  const [hero, ...rest] = insights;
  const lifetimeHours = profile?.profile ? profile.profile.timeTypingSeconds / 3600 : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">
            Last test {formatDate(lastTest.date)} · {formatNumber(results.length)} results imported
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-100 sm:text-3xl">Your typing, at a glance</h2>
        </div>
        <Link to="/explorer" className={buttonClass}>
          Open Explorer →
        </Link>
      </div>

      {daysSinceLast >= WELCOME_BACK_DAYS && mainTrack ? (
        <section className="rounded-2xl border border-amber-700/50 bg-amber-950/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            Welcome back · last test {formatRelativeDays(lastTest.date)}
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">
            You left off at {mainTrack.form.toFixed(1)} WPM in {mainTrack.name}.
          </p>
          {recovery ? (
            <p className="mt-1 text-sm text-zinc-300">
              After your last {recovery.gapDays}-day break your first 5 tests averaged {recovery.after.toFixed(1)} WPM,
              against {recovery.before.toFixed(1)} before it.
            </p>
          ) : null}
        </section>
      ) : null}

      <section aria-label="Vitals" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatTile
          label="Recent average"
          value={vitals.recent?.toFixed(1) ?? "—"}
          sub={vitals.previous !== null && vitals.recent !== null ? `last 20 · ${signed(vitals.recent - vitals.previous)} vs prior 20` : "last 20 tests"}
          color="text-cyan-400"
        />
        <StatTile label="Best WPM" value={vitals.best?.toFixed(1) ?? "—"} sub={vitals.bestLabel} color="text-emerald-400" />
        <StatTile label="Accuracy" value={vitals.acc !== null ? `${vitals.acc.toFixed(1)}%` : "—"} sub="average" color="text-amber-400" />
        <StatTile label="Consistency" value={vitals.cons !== null ? `${vitals.cons.toFixed(1)}%` : "—"} sub="within-test average" color="text-purple-400" />
        <StatTile
          label="Time typed"
          value={`${(lifetimeHours ?? vitals.importedHours).toFixed(1)} h`}
          sub={lifetimeHours !== null ? `lifetime · ${vitals.importedHours.toFixed(1)} h imported` : "imported results"}
        />
      </section>

      <TrackCards tracks={tracks} />

      <CommunityStanding profile={profile} isLoading={profileQuery.isLoading} importedTests={results.length} />

      {hero ? (
        <section aria-labelledby="insights-heading" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="insights-heading" className="text-lg font-semibold text-zinc-100 sm:text-xl">
              Insights
            </h2>
            <p className="text-sm text-zinc-400">Strongest patterns first · recomputed from your results</p>
          </div>
          <InsightCard insight={hero} hero />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rest.slice(0, MAX_INSIGHT_CARDS).map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
      ) : null}

      <ActivityHeatmap results={resultsQuery.data?.data ?? []} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PersonalBests personalBests={profile?.personalBests ?? []} />
        <GoalsSummary goals={goals} />
      </div>
    </div>
  );
}
