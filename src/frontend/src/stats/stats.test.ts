import { describe, expect, it } from "vitest";
import type { Goal } from "../api/goals";
import { learningRate, rollingMean } from "./aggregate";
import { applyFilter, describeFilter, sanitizeFilter } from "./filter";
import { computeGoalProgress } from "./goals";
import { computeInsights } from "./insights";
import { isPerformance, normalizeResults } from "./normalize";
import { analyzePace, resultContext } from "./resultAnalysis";
import { splitSessions } from "./sessions";
import { rawResult, result, series } from "./testUtils";
import { cohortKey, detectTracks } from "./tracks";

describe("normalize", () => {
  it("fills in Monkeytype's omitted defaults and sorts oldest first", () => {
    const [first, second] = normalizeResults([
      rawResult({ timestamp: "2026-02-01T00:00:00Z" }),
      rawResult({ timestamp: "2026-01-01T00:00:00Z", funbox: ["b", "a"] }),
    ]);
    expect(first.date.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(first.language).toBe("english");
    expect(first.difficulty).toBe("normal");
    expect(first.punctuation).toBe(false);
    expect(first.funbox).toEqual(["a", "b"]);
    expect(second.incompleteSeconds).toBe(0);
  });

  it("excludes bailed-out and zero-WPM tests from performance stats", () => {
    expect(isPerformance(result())).toBe(true);
    expect(isPerformance(result({ bailedOut: true }))).toBe(false);
    expect(isPerformance(result({ wpm: 0 }))).toBe(false);
  });
});

describe("aggregate", () => {
  it("starts a rolling mean only once its window is full", () => {
    expect(rollingMean([1, 2, 3, 4], 3)).toEqual([null, null, 2, 3]);
  });

  it("estimates WPM gained per recorded hour", () => {
    // 60 one-minute tests, +1 WPM per test => +60 WPM per hour
    const results = series(60, (i) => 50 + i, { testDuration: 60 });
    expect(learningRate(results)?.wpmPerHour).toBeCloseTo(60, 5);
  });
});

describe("sessions", () => {
  it("splits on gaps longer than 30 minutes", () => {
    const results = [
      result({ timestamp: "2026-01-01T10:00:00Z" }),
      result({ timestamp: "2026-01-01T10:20:00Z" }),
      result({ timestamp: "2026-01-01T11:00:00Z" }),
    ];
    expect(splitSessions(results).map((s) => s.results.length)).toEqual([2, 1]);
  });
});

describe("filter", () => {
  const now = new Date("2026-06-15T12:00:00Z");
  const results = [
    result({ timestamp: "2026-06-10T12:00:00Z", mode2: "15" }),
    result({ timestamp: "2025-03-01T12:00:00Z", language: "code_csharp" }),
    result({ timestamp: "2026-06-12T12:00:00Z", bailedOut: true }),
  ];

  it("filters by preset period, year and fields, and hides bailed-out tests by default", () => {
    expect(applyFilter(results, { period: "30d" }, now)).toHaveLength(1);
    expect(applyFilter(results, { period: "2025" }, now)).toHaveLength(1);
    expect(applyFilter(results, { language: "code_csharp" }, now)).toHaveLength(1);
    expect(applyFilter(results, { includeBailed: true }, now)).toHaveLength(3);
  });

  it("sanitizes untrusted input and describes active fields", () => {
    const filter = sanitizeFilter({ mode: "time", punctuation: "true", bogus: 1, timeOfDay: "brunch", mode2: 60 });
    expect(filter).toEqual({ mode: "time", punctuation: true, mode2: "60" });
    expect(describeFilter(filter).map((c) => c.label)).toEqual(["time", "60", "Punctuation"]);
  });
});

describe("tracks", () => {
  it("groups quotes regardless of quote id and needs 50 tests per track", () => {
    expect(cohortKey(result({ mode: "quote", mode2: "123" }))).toBe(cohortKey(result({ mode: "quote", mode2: "456" })));
    const tracks = detectTracks([
      ...series(60, () => 60),
      ...series(10, () => 70, { language: "code_csharp" }),
    ]);
    expect(tracks).toHaveLength(1);
    expect(tracks[0].tests).toBe(60);
  });

  it("puts the busiest recently practiced track first", () => {
    const old = series(200, () => 60, { mode2: "15" }, "2025-01-01T00:00:00Z");
    const busy = series(120, () => 60, { mode2: "120" }, "2026-01-01T00:00:00Z", 60);
    const small = series(60, () => 60, { mode2: "30" }, "2026-01-02T00:00:00Z", 60);
    expect(detectTracks([...old, ...busy, ...small].sort((a, b) => a.date.getTime() - b.date.getTime())).map((t) => t.filter.mode2)).toEqual(["120", "30", "15"]);
  });
});

describe("insights", () => {
  it("returns nothing it can't back with enough tests", () => {
    expect(computeInsights({ results: series(5, () => 60), tracks: [] })).toEqual([]);
  });

  it("finds the accuracy pattern when clean tests are clearly faster", () => {
    const clean = series(40, () => 75, { acc: 99 });
    const sloppy = series(60, () => 60, { acc: 95 }, "2026-03-01T00:00:00Z");
    const insights = computeInsights({ results: [...clean, ...sloppy], tracks: [] });
    const accuracy = insights.find((i) => i.id === "accuracy");
    expect(accuracy?.title).toContain("75.0 WPM");
    expect(accuracy?.title).toContain("15.0 faster");
  });
});

describe("result analysis", () => {
  it("ranks a test against tests with the same settings only", () => {
    const track = series(10, (i) => 50 + i); // 50..59
    const other = series(5, () => 90, { mode2: "15" });
    const test = track[7]; // 57
    const context = resultContext(test, [...track, ...other]);
    expect(context.cohortSize).toBe(10);
    expect(context.rank).toBe(3);
    expect(context.fasterThanPercent).toBeCloseTo((7 / 9) * 100);
    expect(context.bestAtTheTime).toBe(true);
  });

  it("summarizes pace and errors from the per-second arrays", () => {
    const pace = analyzePace([80, 70, 60, 50], [0, 2, 0, 1]);
    expect(pace).toMatchObject({
      firstHalf: 75,
      secondHalf: 55,
      peakBurst: { value: 80, second: 1 },
      totalErrors: 3,
      secondsWithErrors: 2,
      worstSecond: { second: 2, errors: 2 },
      longestCleanStreak: 1,
    });
    expect(analyzePace(null, null)).toBeNull();
  });
});

describe("goals", () => {
  const goal = (overrides: Partial<Goal>): Goal => ({
    id: "g1",
    type: "form",
    title: "t",
    filter: null,
    target: 70,
    windowSize: 10,
    deadline: null,
    startedAt: "2026-02-01T00:00:00Z",
    achievedAt: null,
    archivedAt: null,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
    ...overrides,
  });

  it("measures form progress from the value at the start date", () => {
    // 20 tests at 50 before the start, then 10 tests at 60
    const results = [...series(20, () => 50), ...series(10, () => 60, {}, "2026-02-02T00:00:00Z")];
    const progress = computeGoalProgress(goal({}), { results, profile: null, leaderboardHistory: {} });
    expect(progress.start).toBe(50);
    expect(progress.current).toBe(60);
    expect(progress.progress).toBeCloseTo(0.5);
    expect(progress.achieved).toBe(false);
  });

  it("treats a lower leaderboard percent as better", () => {
    const history = {
      "60": [
        { capturedAt: "2026-02-01T00:00:00Z", rank: 300, leaderboardSize: 1000, topPercent: 30, wpm: 90 },
        { capturedAt: "2026-02-10T00:00:00Z", rank: 250, leaderboardSize: 1000, topPercent: 25, wpm: 92 },
      ],
    };
    const progress = computeGoalProgress(goal({ type: "leaderboard", target: 20, filter: { mode2: "60" } }), {
      results: [],
      profile: null,
      leaderboardHistory: history,
    });
    expect(progress.current).toBe(25);
    expect(progress.progress).toBeCloseTo(0.5);
  });
});
