import type { GoalType } from "../../api/goals";

export function formatGoalValue(type: GoalType, value: number | null): string {
  if (value === null) return "—";
  switch (type) {
    case "accuracy":
      return `${value.toFixed(1)}%`;
    case "leaderboard":
      return `top ${value.toFixed(1)}%`;
    case "practice-volume":
      return `${Math.round(value)} tests`;
    case "streak":
      return `${Math.round(value)} d`;
    default:
      return value.toFixed(1);
  }
}
