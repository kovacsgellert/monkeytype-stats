import type { GoalWithProgress } from "../../hooks/useGoalProgress";
import { buttonClass, ProgressBar, Sparkline } from "../ui";
import { formatDate } from "../../utils/format";
import { formatGoalValue } from "./goalFormat";

interface GoalCardProps {
  item: GoalWithProgress;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkAchieved: () => void;
}

export function GoalCard({ item, onEdit, onArchive, onDelete, onMarkAchieved }: GoalCardProps) {
  const { goal, progress } = item;
  const deadline = goal.deadline ? new Date(goal.deadline) : null;
  const overdue = deadline !== null && deadline < new Date() && !goal.achievedAt;
  // practice volume is a recurring target, so it is never "achieved" once and for all
  const canMarkAchieved = progress.achieved && !goal.achievedAt && goal.type !== "practice-volume";

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-zinc-100">{goal.title}</h3>
          <p className="text-xs text-zinc-400">
            Started {formatDate(goal.startedAt)}
            {deadline ? ` · due ${formatDate(deadline)}` : ""}
            {overdue ? " · past deadline" : ""}
            {goal.achievedAt ? ` · reached ${formatDate(goal.achievedAt)}` : ""}
          </p>
        </div>
        {progress.achieved ? (
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
            ✓ Target reached
          </span>
        ) : null}
      </div>

      {progress.noData ? (
        <p className="text-sm text-zinc-400">Not enough matching data yet to measure this goal.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-cyan-400">{formatGoalValue(goal.type, progress.current)}</span>
            <span className="text-zinc-400">/ {formatGoalValue(goal.type, goal.target)}</span>
            {progress.start !== null ? (
              <span className="ml-auto text-xs text-zinc-400">from {formatGoalValue(goal.type, progress.start)}</span>
            ) : null}
          </div>
          <ProgressBar value={progress.progress} label={`${goal.title} progress`} />
          {progress.history.length >= 2 ? (
            <Sparkline
              values={progress.history.map((h) => (goal.type === "leaderboard" ? -h.value : h.value))}
              height={48}
              label={`${goal.title} since the goal started`}
            />
          ) : null}
          {progress.etaHours !== null ? (
            <p className="text-xs text-zinc-400">
              At your current learning rate, roughly{" "}
              {progress.etaHours < 1.5 ? "1 more hour" : `${Math.round(progress.etaHours)} more hours`} of practice.
              Rough estimate, not a promise.
            </p>
          ) : null}
        </>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {canMarkAchieved ? (
          <button type="button" onClick={onMarkAchieved} className={buttonClass}>
            Mark achieved
          </button>
        ) : null}
        <button type="button" onClick={onEdit} className={buttonClass}>
          Edit
        </button>
        <button type="button" onClick={onArchive} className={buttonClass}>
          {goal.archivedAt ? "Restore" : "Archive"}
        </button>
        <button type="button" onClick={onDelete} className={`${buttonClass} hover:text-rose-300`}>
          Delete
        </button>
      </div>
    </article>
  );
}
