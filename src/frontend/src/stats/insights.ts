import { formatLanguage } from "../utils/languageUtils";
import { groupStats, mean, type GroupStats } from "./aggregate";
import { accuracyBands, dimensionKey, dimensionLabel, type Dimension } from "./dimensions";
import type { ResultFilter } from "./filter";
import { isPerformance, recordedSeconds, type TestResult } from "./normalize";
import { sessionPositions, splitSessions } from "./sessions";
import type { Track } from "./tracks";

export interface InsightBar {
  label: string;
  value: number;
  highlight?: boolean;
}

export interface Insight {
  id: string;
  tag: string;
  title: string;
  body: string;
  /** Sample size shown on the card, e.g. "318 sessions". */
  sample: string;
  /** Higher = stronger pattern backed by more tests; decides ordering and the hero card. */
  score: number;
  bars?: InsightBar[];
  series?: number[];
  facts?: { label: string; value: string }[];
  link?: { label: string; filter: ResultFilter; group?: Dimension };
}

export interface InsightContext {
  /** All results, oldest first. */
  results: TestResult[];
  tracks: Track[];
}

const fmt = (n: number, digits = 1) => n.toFixed(digits);
const num = (n: number) => n.toLocaleString("en-US");

function stdDev(values: number[]): number {
  const m = mean(values) ?? 0;
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)) ?? 0) || 1;
}

/** Effect size in standard deviations, weighted by the smaller sample. */
function strength(diff: number, spread: number, n: number): number {
  return (Math.abs(diff) / spread) * Math.sqrt(n);
}

function bars(groups: GroupStats[], highlight: (g: GroupStats) => boolean): InsightBar[] {
  return groups.map((g) => ({ label: g.label, value: g.avgWpm, highlight: highlight(g) }));
}

function accuracyPaysOff(perf: TestResult[], spread: number): Insight | null {
  const groups = groupStats(
    perf,
    (r) => dimensionKey("accuracy", r, () => 0),
    (k) => dimensionLabel("accuracy", k),
  ).filter((g) => g.count >= 30);
  groups.sort((a, b) => a.key.localeCompare(b.key));
  if (groups.length < 2) return null;

  const top = groups[groups.length - 1];
  const band = accuracyBands.find((b) => b.key === top.key)!;
  const rest = perf.filter((r) => r.acc < band.min);
  const restAvg = mean(rest.map((r) => r.wpm));
  if (restAvg === null || rest.length < 30) return null;
  const diff = top.avgWpm - restAvg;
  if (diff < 2) return null;

  return {
    id: "accuracy",
    tag: "Accuracy pays off",
    title: `When you stay above ${band.min}% accuracy you average ${fmt(top.avgWpm)} WPM — ${fmt(diff)} faster than in your other tests.`,
    body: `Your fastest tests are the clean ones. ${num(top.count)} of ${num(perf.length)} tests landed in the ${top.label} band.`,
    sample: `${num(perf.length)} tests`,
    score: strength(diff, spread, Math.min(top.count, rest.length)),
    bars: bars(groups, (g) => g.key === top.key),
    link: { label: "Compare accuracy bands", filter: {}, group: "accuracy" },
  };
}

function warmUp(results: TestResult[], spread: number): Insight | null {
  const sessions = splitSessions(results).filter((s) => s.results.length >= 2);
  if (sessions.length < 50) return null;
  const positions = sessionPositions(sessions);
  const inSessions = sessions.flatMap((s) => s.results).filter(isPerformance);
  const groups = groupStats(
    inSessions,
    (r) => dimensionKey("session", r, (x) => positions.get(x.id)?.position ?? 0),
    (k) => dimensionLabel("session", k),
  )
    .filter((g) => g.count >= 20)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(0, 7);
  if (groups.length < 3 || groups[0].key !== "00") return null;

  const first = groups[0];
  const later = mean(groups.slice(1).map((g) => g.avgWpm))!;
  const diff = later - first.avgWpm;
  if (Math.abs(diff) < 1) return null;
  const slower = diff > 0;

  return {
    id: "warm-up",
    tag: "Warm-up",
    title: slower
      ? `Your first test of a session is your slowest: ${fmt(first.avgWpm)} WPM, against ${fmt(later)} for the tests after it.`
      : `You start sessions strong: your first test averages ${fmt(first.avgWpm)} WPM, ${fmt(-diff)} above the rest.`,
    body: slower
      ? "A throwaway warm-up before the tests you care about may be worth it. Sessions are runs of tests less than 30 minutes apart."
      : "No warm-up needed — you're fastest when fresh. Sessions are runs of tests less than 30 minutes apart.",
    sample: `${num(sessions.length)} sessions`,
    score: strength(diff, spread, first.count),
    bars: bars(groups, (g) => g.key === first.key),
    link: { label: "Compare by position in session", filter: {}, group: "session" },
  };
}

function peakHour(perf: TestResult[], spread: number): Insight | null {
  const groups = groupStats(
    perf,
    (r) => dimensionKey("hour", r, () => 0),
    (k) => dimensionLabel("hour", k),
  )
    .filter((g) => g.count >= 20)
    .sort((a, b) => a.key.localeCompare(b.key));
  if (groups.length < 4) return null;

  const best = groups.reduce((a, b) => (b.avgWpm > a.avgWpm ? b : a));
  const worst = groups.reduce((a, b) => (b.avgWpm < a.avgWpm ? b : a));
  const diff = best.avgWpm - worst.avgWpm;
  if (diff < 2) return null;

  return {
    id: "peak-hour",
    tag: "Time of day",
    title: `You peak around ${best.label} (${fmt(best.avgWpm)} WPM) and are slowest around ${worst.label} (${fmt(worst.avgWpm)} WPM).`,
    body: "Local time. Hours with fewer than 20 tests are left out.",
    sample: `${num(perf.length)} tests`,
    score: strength(diff, spread, Math.min(best.count, worst.count)) * 0.8,
    bars: bars(groups, (g) => g.key === best.key),
    link: { label: "Break down by hour", filter: {}, group: "hour" },
  };
}

function weekday(perf: TestResult[], spread: number): Insight | null {
  const groups = groupStats(
    perf,
    (r) => dimensionKey("weekday", r, () => 0),
    (k) => dimensionLabel("weekday", k),
  )
    .filter((g) => g.count >= 30)
    .sort((a, b) => a.key.localeCompare(b.key));
  if (groups.length < 5) return null;

  const slowest = groups.reduce((a, b) => (b.avgWpm < a.avgWpm ? b : a));
  const others = perf.filter((r) => dimensionKey("weekday", r, () => 0) !== slowest.key);
  const othersAvg = mean(others.map((r) => r.wpm))!;
  const diff = othersAvg - slowest.avgWpm;
  if (diff < 1.5) return null;

  return {
    id: "weekday",
    tag: "Weekday",
    title: `${slowest.label} is your slow day — ${fmt(slowest.avgWpm)} WPM against ${fmt(othersAvg)} on other days.`,
    body: "Days with fewer than 30 tests are left out.",
    sample: `${num(slowest.count)} ${slowest.label} tests`,
    score: strength(diff, spread, slowest.count) * 0.8,
    bars: bars(groups, (g) => g.key === slowest.key),
    link: { label: "Break down by weekday", filter: {}, group: "weekday" },
  };
}

function languageGap(perf: TestResult[], spread: number): Insight | null {
  // the most practiced fixed-length test with at least two well-practiced languages
  const byTest = new Map<string, TestResult[]>();
  for (const r of perf) {
    if (r.mode === "quote") continue;
    const key = `${r.mode} ${r.mode2}`;
    byTest.set(key, [...(byTest.get(key) ?? []), r]);
  }
  for (const [test, list] of [...byTest.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const groups = groupStats(list, (r) => r.language, formatLanguage)
      .filter((g) => g.count >= 50)
      .sort((a, b) => b.count - a.count);
    if (groups.length < 2) continue;

    const [a, b] = groups;
    const [fast, slow] = a.avgWpm >= b.avgWpm ? [a, b] : [b, a];
    const diff = fast.avgWpm - slow.avgWpm;
    if (diff < 2) return null;
    const [mode, mode2] = test.split(" ");
    const accNote =
      Math.abs(fast.avgAcc - slow.avgAcc) < 0.5
        ? `Accuracy is nearly identical (${fmt(slow.avgAcc)}% vs ${fmt(fast.avgAcc)}%), so the gap is the text, not mistakes.`
        : `Accuracy differs too: ${fmt(slow.avgAcc)}% vs ${fmt(fast.avgAcc)}%.`;

    return {
      id: "language-gap",
      tag: "Language gap",
      title: `${slow.label} costs you ${fmt(diff)} WPM compared with ${fast.label} at ${test}.`,
      body: accNote,
      sample: `${num(slow.count)} vs ${num(fast.count)} tests`,
      score: strength(diff, spread, slow.count),
      bars: groups.map((g) => ({ label: g.label, value: g.avgWpm, highlight: g.key === slow.key })),
      link: { label: "Compare languages", filter: { mode, mode2 }, group: "language" },
    };
  }
  return null;
}

function learningCurve(tracks: Track[]): Insight | null {
  const track = tracks.find((t) => t.tests >= 100);
  if (!track) return null;
  const first = mean(track.results.slice(0, 20).map((r) => r.wpm))!;
  const diff = track.form - first;
  const rate =
    track.wpmPerHour !== null
      ? ` That's about ${track.wpmPerHour >= 0 ? "+" : ""}${fmt(track.wpmPerHour)} WPM per recorded hour (${fmt(track.hours)} h in this track).`
      : "";

  return {
    id: "learning-curve",
    tag: "Learning curve",
    title: `${track.name} went from ${fmt(first, 0)} to ${fmt(track.form, 0)} WPM over ${num(track.tests)} tests.`,
    body: `First 20 tests vs your last 20.${rate}`,
    sample: `${num(track.tests)} tests`,
    // a slope over many tests is a strong signal, but keep it below striking contrasts
    score: Math.min(8, Math.abs(diff) / 2),
    series: track.series,
    link: { label: "Show the trend", filter: track.filter },
  };
}

function endurance(perf: TestResult[]): Insight | null {
  const timed = perf.filter((r) => r.mode === "time");
  const byCohort = new Map<string, TestResult[]>();
  for (const r of timed) {
    const key = `${r.language}|${r.punctuation}|${r.numbers}`;
    byCohort.set(key, [...(byCohort.get(key) ?? []), r]);
  }
  let best: { key: string; groups: GroupStats[] } | null = null;
  for (const [key, list] of byCohort) {
    const groups = groupStats(list, (r) => r.mode2, (k) => `${k}s`)
      .filter((g) => g.count >= 5)
      .sort((a, b) => Number(a.key) - Number(b.key));
    if (groups.length >= 3 && (!best || groups.length > best.groups.length)) best = { key, groups };
  }
  if (!best) return null;

  const { groups } = best;
  const [language, punctuation] = best.key.split("|");
  const short = groups[0];
  const long = groups[groups.length - 1];
  const diff = short.avgWpm - long.avgWpm;
  if (diff < 2) return null;

  return {
    id: "endurance",
    tag: "Endurance",
    title: `You lose ${fmt(diff)} WPM between ${short.label} and ${long.label} tests.`,
    body: `Average WPM by test length in ${formatLanguage(language)}${punctuation === "true" ? " with punctuation" : ""}. Longer tests leave less room for a fast burst.`,
    sample: `${num(groups.reduce((s, g) => s + g.count, 0))} tests`,
    score: Math.min(6, diff / 2),
    bars: bars(groups, (g) => g.key === long.key),
    link: {
      label: "Compare test lengths",
      filter: { mode: "time", language, punctuation: punctuation === "true" },
      group: "duration",
    },
  };
}

function thenVsNow(perf: TestResult[], tracks: Track[]): Insight | null {
  if (perf.length < 100) return null;
  const overallThen = mean(perf.slice(0, 50).map((r) => r.wpm))!;
  const overallNow = mean(perf.slice(-50).map((r) => r.wpm))!;
  const overallDiff = overallNow - overallThen;
  const perTrack = tracks
    .filter((t) => t.tests >= 40)
    .slice(0, 4)
    .map((t) => ({
      track: t,
      then: mean(t.results.slice(0, 20).map((r) => r.wpm))!,
      now: t.form,
    }));
  if (perTrack.length === 0) return null;
  const improved = perTrack.filter((p) => p.now > p.then).length;

  const mixEffect = overallDiff < 0 && improved === perTrack.length;
  return {
    id: "then-vs-now",
    tag: "Then vs now",
    title: mixEffect
      ? `Your average dropped ${fmt(-overallDiff)} WPM — but only because your tests got harder. Like for like, you're faster in every track.`
      : `Like for like, you've improved in ${improved} of ${perTrack.length} tracks.`,
    body: "Overall: first 50 vs last 50 tests. Tracks: first 20 vs last 20 tests in the same settings.",
    sample: `${num(perf.length)} tests`,
    score: mixEffect ? 9 : 2,
    facts: [
      { label: "All tests (mixed)", value: `${fmt(overallThen)} → ${fmt(overallNow)}` },
      ...perTrack.map((p) => ({
        label: p.track.name,
        value: `${fmt(p.then)} → ${fmt(p.now)}`,
      })),
    ],
  };
}

/** The most recent break of 14+ days in the main track, if there were enough tests around it. */
export function breakRecovery(tracks: Track[]) {
  const track = tracks[0];
  if (!track) return null;
  const list = track.results;
  for (let i = list.length - 1; i >= 20; i--) {
    const gapDays = (list[i].date.getTime() - list[i - 1].date.getTime()) / 86_400_000;
    if (gapDays < 14 || list.length - i < 5) continue;
    return {
      track,
      gapDays: Math.round(gapDays),
      before: mean(list.slice(i - 20, i).map((r) => r.wpm))!,
      after: mean(list.slice(i, i + 5).map((r) => r.wpm))!,
      returnedAt: list[i].date,
    };
  }
  return null;
}

function breakRecoveryInsight(tracks: Track[]): Insight | null {
  const recovery = breakRecovery(tracks);
  if (!recovery) return null;
  const diff = recovery.after - recovery.before;
  const rusty = diff <= -2;
  return {
    id: "break-recovery",
    tag: "Breaks",
    title: rusty
      ? `After your ${recovery.gapDays}-day break you came back ${fmt(-diff)} WPM slower — expect a few rusty tests.`
      : `Breaks don't seem to hurt you: after a ${recovery.gapDays}-day break your first 5 tests averaged ${fmt(recovery.after)} WPM, against ${fmt(recovery.before)} before.`,
    body: `${recovery.track.name}, break ending ${recovery.returnedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Last 20 tests before vs first 5 after.`,
    sample: `${recovery.gapDays} days off`,
    score: 3,
    link: { label: "See that track", filter: recovery.track.filter },
  };
}

function cleanTypist(perf: TestResult[]): Insight | null {
  if (perf.length < 50) return null;
  const gap = mean(perf.map((r) => r.rawWpm - r.wpm))!;
  const clean = gap < 1;
  return {
    id: "clean-typist",
    tag: clean ? "Clean typist" : "Error cost",
    title: clean
      ? `Only ${fmt(gap)} WPM between your raw and net speed — mistakes almost never survive.`
      : `Uncorrected mistakes cost you ${fmt(gap)} WPM on average (raw vs net speed).`,
    body: "Net WPM only counts correct words; raw counts everything you typed.",
    sample: `${num(perf.length)} tests`,
    score: clean ? 1.5 : Math.min(6, gap),
  };
}

function milestones(perf: TestResult[]): Insight | null {
  if (perf.length < 20) return null;
  const facts: { label: string; value: string }[] = [];
  const best = Math.max(...perf.map((r) => r.wpm));
  for (let threshold = 50; threshold <= best; threshold += 10) {
    const first = perf.find((r) => r.wpm >= threshold);
    if (first)
      facts.push({
        label: `First ${threshold}+ WPM`,
        value: first.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
  }
  if (facts.length === 0) return null;
  const top = facts[facts.length - 1];
  return {
    id: "milestones",
    tag: "Milestones",
    title: `${top.label.replace("First", "Your first")} test was on ${top.value}.`,
    body: "Every 10-WPM threshold you've crossed so far.",
    sample: `${num(perf.length)} tests`,
    score: 1,
    facts: facts.slice(-5).reverse(),
  };
}

function funFacts(results: TestResult[]): Insight | null {
  if (results.length < 20) return null;
  const correctChars = results.reduce((sum, r) => sum + (r.charStats[0] ?? 0), 0);
  const words = Math.round(correctChars / 5);
  const hours = results.reduce((sum, r) => sum + recordedSeconds(r), 0) / 3600;
  const sessions = splitSessions(results);
  const longest = Math.max(...sessions.map((s) => s.results.length));
  // ~275 words per printed novel page
  const pages = Math.round(words / 275);

  return {
    id: "fun-facts",
    tag: "Fun fact",
    title: `You've typed ${num(correctChars)} correct characters — about ${num(Math.round(words / 1000) * 1000)} words, roughly ${num(pages)} pages of a novel.`,
    body: "A session is a run of tests with less than 30 minutes between them.",
    sample: `${num(results.length)} tests`,
    score: 0.5,
    facts: [
      { label: "recorded typing", value: `${fmt(hours)} h` },
      { label: "sessions", value: num(sessions.length) },
      { label: "longest session", value: `${longest} tests` },
    ],
  };
}

/** Every insight that qualifies for this data, strongest first. */
export function computeInsights({ results, tracks }: InsightContext): Insight[] {
  const perf = results.filter(isPerformance);
  if (perf.length === 0) return [];
  const spread = stdDev(perf.map((r) => r.wpm));

  return [
    accuracyPaysOff(perf, spread),
    warmUp(results, spread),
    peakHour(perf, spread),
    weekday(perf, spread),
    languageGap(perf, spread),
    learningCurve(tracks),
    endurance(perf),
    thenVsNow(perf, tracks),
    breakRecoveryInsight(tracks),
    cleanTypist(perf),
    milestones(perf),
    funFacts(results),
  ]
    .filter((insight): insight is Insight => insight !== null)
    .sort((a, b) => b.score - a.score);
}
