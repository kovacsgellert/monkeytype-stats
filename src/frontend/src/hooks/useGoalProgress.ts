import { useMemo } from "react";
import type { Goal } from "../api/goals";
import { computeGoalProgress, type GoalProgress } from "../stats/goals";
import { useGoals } from "./useGoals";
import { useAllLeaderboardHistory, useProfile } from "./useProfile";
import { useTestResults } from "./useTestResults";

export interface GoalWithProgress {
  goal: Goal;
  progress: GoalProgress;
}

/** Goals with progress computed from results, the profile snapshot and rank history. */
export function useGoalProgress() {
  const goalsQuery = useGoals();
  const { results, tracks, query: resultsQuery } = useTestResults();
  const profileQuery = useProfile();
  const leaderboardHistory = useAllLeaderboardHistory();

  const goals = useMemo<GoalWithProgress[]>(
    () =>
      (goalsQuery.data ?? []).map((goal) => ({
        goal,
        progress: computeGoalProgress(goal, {
          results,
          profile: profileQuery.data?.profile ?? null,
          leaderboardHistory,
        }),
      })),
    [goalsQuery.data, results, profileQuery.data, leaderboardHistory],
  );

  return { goalsQuery, resultsQuery, goals, tracks, results };
}
