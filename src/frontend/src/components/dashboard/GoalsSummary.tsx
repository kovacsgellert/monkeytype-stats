import { Link } from "@tanstack/react-router";
import type { GoalWithProgress } from "../../hooks/useGoalProgress";
import { cardClass, ProgressBar } from "../ui";
import { formatGoalValue } from "../goals/goalFormat";

export function GoalsSummary({ goals }: { goals: GoalWithProgress[] }) {
  const active = goals.filter((g) => !g.goal.archivedAt && !g.goal.achievedAt).slice(0, 3);

  return (
    <section aria-labelledby="goals-summary-heading" className={cardClass}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 id="goals-summary-heading" className="text-lg font-semibold text-zinc-100">
          Goals
        </h2>
        <Link to="/goals" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
          All goals →
        </Link>
      </div>
      {active.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No active goals.{" "}
          <Link to="/goals" className="text-cyan-400 hover:text-cyan-300">
            Set one
          </Link>{" "}
          — like reaching 70 WPM form in your main track.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {active.map(({ goal, progress }) => (
            <li key={goal.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-zinc-100">{goal.title}</span>
                <span className="shrink-0 font-mono text-zinc-300">
                  {formatGoalValue(goal.type, progress.current)} / {formatGoalValue(goal.type, goal.target)}
                </span>
              </div>
              <ProgressBar value={progress.progress} label={`${goal.title} progress`} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
