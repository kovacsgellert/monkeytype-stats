import type { Goal, GoalType } from "../api/goals";
import type { LeaderboardHistoryPoint, ProfileSnapshot } from "../api/profile";
import { learningRate, max, mean } from "./aggregate";
import { applyFilter, sanitizeFilter } from "./filter";
import { isPerformance, type TestResult } from "./normalize";

export const goalTypes: {
  key: GoalType;
  label: string;
  description: string;
  unit: string;
  usesFilter: boolean;
  usesWindow: boolean;
}[] = [
  { key: "form", label: "Form", description: "Average WPM of your last N tests", unit: "WPM", usesFilter: true, usesWindow: true },
  { key: "personal-best", label: "Personal best", description: "A single test at or above the target", unit: "WPM", usesFilter: true, usesWindow: false },
  { key: "accuracy", label: "Accuracy", description: "Average accuracy of your last N tests", unit: "%", usesFilter: true, usesWindow: true },
  { key: "practice-volume", label: "Practice volume", description: "Tests in the last 7 days", unit: "tests/week", usesFilter: true, usesWindow: false },
  { key: "streak", label: "Streak", description: "Days in a row with at least one test (Monkeytype's streak)", unit: "days", usesFilter: false, usesWindow: false },
  { key: "leaderboard", label: "Leaderboard", description: "Reach the top X% of the english all-time leaderboard", unit: "% top", usesFilter: false, usesWindow: false },
];

export interface GoalProgress {
  current: number | null;
  start: number | null;
  /** 0..1, clamped. */
  progress: number;
  achieved: boolean;
  unit: string;
  /** Metric over time since the goal started, for the mini chart. */
  history: { date: Date; value: number }[];
  /** Rough hours of practice left, only for form goals with a positive learning rate. */
  etaHours: number | null;
  /** True when the metric can't be computed yet (no matching tests or no data). */
  noData: boolean;
}

export interface GoalData {
  results: TestResult[];
  profile: ProfileSnapshot | null;
  leaderboardHistory: Record<string, LeaderboardHistoryPoint[]>;
  now?: Date;
}

export function leaderboardMode2(goal: Pick<Goal, "filter">): string {
  return goal.filter?.mode2 === "15" ? "15" : "60";
}

function progressBetween(start: number | null, current: number | null, target: number, lowerIsBetter = false) {
  if (current === null) return 0;
  if (lowerIsBetter ? current <= target : current >= target) return 1;
  if (start === null || start === target) return 0;
  const p = (current - start) / (target - start);
  return Math.max(0, Math.min(1, p));
}

function windowed(values: number[], dates: Date[], window: number) {
  const history: { date: Date; value: number }[] = [];
  for (let i = window - 1; i < values.length; i++) {
    history.push({ date: dates[i], value: mean(values.slice(i - window + 1, i + 1))! });
  }
  return history;
}

export function computeGoalProgress(goal: Goal, data: GoalData): GoalProgress {
  const unit = goalTypes.find((t) => t.key === goal.type)?.unit ?? "";
  const startedAt = new Date(goal.startedAt);
  const now = data.now ?? new Date();
  const empty: GoalProgress = { current: null, start: null, progress: 0, achieved: false, unit, history: [], etaHours: null, noData: true };

  const filtered = applyFilter(data.results, sanitizeFilter(goal.filter as Record<string, unknown> | null), now).filter(isPerformance);
  const before = filtered.filter((r) => r.date < startedAt);
  const since = filtered.filter((r) => r.date >= startedAt);

  switch (goal.type) {
    case "form":
    case "accuracy": {
      const window = goal.windowSize ?? 20;
      const metric = (r: TestResult) => (goal.type === "form" ? r.wpm : r.acc);
      if (filtered.length < window) return empty;
      const values = filtered.map(metric);
      const current = mean(values.slice(-window));
      const start = before.length >= window ? mean(before.slice(-window).map(metric)) : mean(filtered.slice(0, window).map(metric));
      // history from just before the start so the line begins at the starting value
      const fromIndex = Math.max(0, before.length - 1);
      const history = windowed(values, filtered.map((r) => r.date), window).slice(Math.max(0, fromIndex - window + 1));
      let etaHours: number | null = null;
      if (goal.type === "form" && current !== null && current < goal.target && filtered.length >= 50) {
        const rate = learningRate(filtered);
        if (rate && rate.wpmPerHour > 0.05) etaHours = (goal.target - current) / rate.wpmPerHour;
      }
      return {
        current,
        start,
        progress: progressBetween(start, current, goal.target),
        achieved: current !== null && current >= goal.target,
        unit,
        history,
        etaHours,
        noData: false,
      };
    }
    case "personal-best": {
      if (filtered.length === 0) return empty;
      const current = max(filtered.map((r) => r.wpm));
      const start = max(before.map((r) => r.wpm));
      let running = start ?? 0;
      const history = since.map((r) => {
        running = Math.max(running, r.wpm);
        return { date: r.date, value: running };
      });
      return { current, start, progress: progressBetween(start, current, goal.target), achieved: (current ?? 0) >= goal.target, unit, history, etaHours: null, noData: false };
    }
    case "practice-volume": {
      const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
      const current = filtered.filter((r) => r.date >= weekAgo).length;
      const history: { date: Date; value: number }[] = [];
      for (let end = new Date(Math.max(startedAt.getTime() + 7 * 86_400_000, now.getTime() - 12 * 7 * 86_400_000)); end <= now; end = new Date(end.getTime() + 7 * 86_400_000)) {
        const from = new Date(end.getTime() - 7 * 86_400_000);
        history.push({ date: end, value: filtered.filter((r) => r.date >= from && r.date < end).length });
      }
      return { current, start: 0, progress: progressBetween(0, current, goal.target), achieved: current >= goal.target, unit, history, etaHours: null, noData: false };
    }
    case "streak": {
      if (!data.profile) return empty;
      const current = data.profile.streakLength;
      return { current, start: 0, progress: progressBetween(0, current, goal.target), achieved: current >= goal.target, unit, history: [], etaHours: null, noData: false };
    }
    case "leaderboard": {
      const points = (data.leaderboardHistory[leaderboardMode2(goal)] ?? []).filter((p) => p.topPercent !== null);
      if (points.length === 0) return empty;
      const current = points[points.length - 1].topPercent;
      const startPoint = points.find((p) => new Date(p.capturedAt) >= startedAt) ?? points[0];
      const start = startPoint.topPercent;
      const history = points
        .filter((p) => new Date(p.capturedAt) >= startedAt)
        .map((p) => ({ date: new Date(p.capturedAt), value: p.topPercent! }));
      return {
        current,
        start,
        progress: progressBetween(start, current, goal.target, true),
        achieved: current !== null && current <= goal.target,
        unit,
        history,
        etaHours: null,
        noData: false,
      };
    }
  }
}
