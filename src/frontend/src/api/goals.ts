import type { ResultFilter } from "../stats/filter";
import { apiRequest } from "./apiClient";

export type GoalType =
  | "form"
  | "personal-best"
  | "accuracy"
  | "practice-volume"
  | "streak"
  | "leaderboard";

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  filter: ResultFilter | null;
  target: number;
  windowSize: number | null;
  deadline: string | null;
  startedAt: string;
  achievedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveGoalRequest {
  type: GoalType;
  title: string;
  filter: ResultFilter | null;
  target: number;
  windowSize: number | null;
  deadline: string | null;
  startedAt?: string | null;
  achievedAt: string | null;
  archivedAt: string | null;
}

export function toSaveGoalRequest(goal: Goal): SaveGoalRequest {
  return {
    type: goal.type,
    title: goal.title,
    filter: goal.filter,
    target: goal.target,
    windowSize: goal.windowSize,
    deadline: goal.deadline,
    startedAt: goal.startedAt,
    achievedAt: goal.achievedAt,
    archivedAt: goal.archivedAt,
  };
}

export function fetchGoals(): Promise<Goal[]> {
  return apiRequest<Goal[]>("api/goals");
}

export function createGoal(request: SaveGoalRequest) {
  return apiRequest<Goal>("api/goals", { method: "POST", body: request });
}

export function updateGoal(id: string, request: SaveGoalRequest) {
  return apiRequest<Goal>(`api/goals/${id}`, { method: "PUT", body: request });
}

export function deleteGoal(id: string) {
  return apiRequest<null>(`api/goals/${id}`, { method: "DELETE" });
}
