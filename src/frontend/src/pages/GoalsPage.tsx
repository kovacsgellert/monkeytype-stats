import { useMemo, useState } from "react";
import { toSaveGoalRequest, type Goal, type SaveGoalRequest } from "../api/goals";
import { GoalCard } from "../components/goals/GoalCard";
import { GoalForm } from "../components/goals/GoalForm";
import { GoalsSkeleton } from "../components/LoadingSkeleton";
import { EmptyState, primaryButtonClass } from "../components/ui";
import { useGoalMutations } from "../hooks/useGoals";
import { useGoalProgress, type GoalWithProgress } from "../hooks/useGoalProgress";

type Editing = { kind: "new" } | { kind: "edit"; goal: Goal } | null;

export function GoalsPage() {
  const { goalsQuery, resultsQuery, goals, tracks, results } = useGoalProgress();
  const { create, update, remove } = useGoalMutations();
  const [editing, setEditing] = useState<Editing>(null);
  const [showArchived, setShowArchived] = useState(false);

  const languages = useMemo(() => [...new Set(results.map((r) => r.language))].sort(), [results]);

  const active = goals.filter((g) => !g.goal.archivedAt && !g.goal.achievedAt);
  const achieved = goals.filter((g) => !g.goal.archivedAt && g.goal.achievedAt);
  const archived = goals.filter((g) => g.goal.archivedAt);

  const save = (request: SaveGoalRequest) => {
    const onSuccess = () => setEditing(null);
    if (editing?.kind === "edit") update.mutate({ id: editing.goal.id, request }, { onSuccess });
    else create.mutate(request, { onSuccess });
  };

  const patch = (goal: Goal, changes: Partial<SaveGoalRequest>) =>
    update.mutate({ id: goal.id, request: { ...toSaveGoalRequest(goal), ...changes } });

  const renderCard = (item: GoalWithProgress) => (
    <GoalCard
      key={item.goal.id}
      item={item}
      onEdit={() => setEditing({ kind: "edit", goal: item.goal })}
      onArchive={() => patch(item.goal, { archivedAt: item.goal.archivedAt ? null : new Date().toISOString() })}
      onDelete={() => {
        if (window.confirm(`Delete the goal "${item.goal.title}"?`)) remove.mutate(item.goal.id);
      }}
      onMarkAchieved={() => patch(item.goal, { achievedAt: new Date().toISOString() })}
    />
  );

  if (goalsQuery.isLoading || resultsQuery.isLoading) return <GoalsSkeleton />;

  const formError = (editing?.kind === "edit" ? update.error : create.error)?.message ?? null;
  const listError = update.error ?? remove.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100">Goals</h2>
          <p className="text-sm text-zinc-400">Set a target and watch your progress. Progress is calculated from your results.</p>
        </div>
        {editing === null ? (
          <button type="button" onClick={() => setEditing({ kind: "new" })} className={primaryButtonClass}>
            + New goal
          </button>
        ) : null}
      </div>

      {goalsQuery.isError ? (
        <p role="alert" className="text-sm text-rose-400">
          Failed to load goals: {goalsQuery.error.message}
        </p>
      ) : null}
      {listError && editing === null ? (
        <p role="alert" className="text-sm text-rose-400">
          {listError.message}
        </p>
      ) : null}

      {editing ? (
        <GoalForm
          key={editing.kind === "edit" ? editing.goal.id : "new"}
          tracks={tracks}
          languages={languages}
          initial={editing.kind === "edit" ? editing.goal : undefined}
          saving={create.isPending || update.isPending}
          error={formError}
          onSave={save}
          onCancel={() => {
            create.reset();
            update.reset();
            setEditing(null);
          }}
        />
      ) : null}

      {active.length === 0 && editing === null ? (
        <EmptyState title="No active goals">
          Try something like "70 WPM form in {tracks[0]?.name ?? "your main track"}" or "Top 25% on the 60s leaderboard".
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{active.map(renderCard)}</div>
      )}

      {achieved.length > 0 ? (
        <section aria-labelledby="achieved-heading">
          <h3 id="achieved-heading" className="mb-3 text-lg font-semibold text-zinc-100">
            Achieved
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{achieved.map(renderCard)}</div>
        </section>
      ) : null}

      {archived.length > 0 ? (
        <section>
          <button type="button" onClick={() => setShowArchived((v) => !v)} aria-expanded={showArchived} className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
            {showArchived ? "Hide" : "Show"} archived goals ({archived.length})
          </button>
          {showArchived ? <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{archived.map(renderCard)}</div> : null}
        </section>
      ) : null}
    </div>
  );
}
