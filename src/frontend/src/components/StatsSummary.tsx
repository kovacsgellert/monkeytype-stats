import type { Result } from "../types/result";

interface StatsSummaryProps {
  results: Result[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  delay: number;
}

function StatCard({ label, value, subValue, color, delay }: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-800/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
          {label}
        </div>
        <div className={`text-3xl font-bold font-mono ${color}`}>{value}</div>
        {subValue && (
          <div className="text-sm text-zinc-500 mt-1">{subValue}</div>
        )}
      </div>
    </div>
  );
}

export function StatsSummary({ results }: StatsSummaryProps) {
  if (results.length === 0) return null;

  const bestWpm = Math.max(...results.map((r) => r.wpm));
  const avgWpm = results.reduce((sum, r) => sum + r.wpm, 0) / results.length;
  const avgAccuracy =
    results.reduce((sum, r) => sum + r.acc, 0) / results.length;
  const avgConsistency =
    results.reduce((sum, r) => sum + r.consistency, 0) / results.length;
  const totalTests = results.length;
  const pbCount = results.filter((r) => r.isPb).length;

  const last10 = [...results]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10);

  const recentAvgWpm =
    last10.length > 0
      ? last10.reduce((sum, r) => sum + r.wpm, 0) / last10.length
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <StatCard
        label="Best WPM"
        value={Math.round(bestWpm)}
        subValue="All time high"
        color="text-emerald-400"
        delay={0}
      />
      <StatCard
        label="Average WPM"
        value={Math.round(avgWpm)}
        subValue="Lifetime average"
        color="text-cyan-400"
        delay={50}
      />
      <StatCard
        label="Recent Avg WPM"
        value={Math.round(recentAvgWpm)}
        subValue="Last 10 tests"
        color="text-blue-400"
        delay={100}
      />
      <StatCard
        label="Accuracy"
        value={`${avgAccuracy.toFixed(1)}%`}
        subValue="Average"
        color="text-amber-400"
        delay={150}
      />
      <StatCard
        label="Consistency"
        value={`${avgConsistency.toFixed(1)}%`}
        subValue="Average"
        color="text-purple-400"
        delay={200}
      />
      <StatCard
        label="Total Tests"
        value={totalTests}
        subValue={`${pbCount} personal bests`}
        color="text-rose-400"
        delay={250}
      />
    </div>
  );
}
