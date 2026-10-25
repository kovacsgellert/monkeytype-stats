import { Link } from "@tanstack/react-router";
import type { Insight } from "../../stats/insights";
import { MiniBars, Sparkline } from "../ui";

function InsightVisual({ insight, hero }: { insight: Insight; hero: boolean }) {
  if (insight.bars)
    return <MiniBars bars={insight.bars} height={hero ? 150 : 76} label={`${insight.tag}: ${insight.bars.map((b) => `${b.label} ${b.value.toFixed(1)}`).join(", ")}`} />;
  if (insight.series)
    return <Sparkline values={insight.series} height={hero ? 120 : 64} stroke="#34d399" label={`${insight.tag} trend`} />;
  if (insight.facts)
    return (
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        {insight.facts.map((f) => (
          <div key={f.label} className="flex justify-between gap-3 border-b border-zinc-800/60 py-1">
            <dt className="truncate text-zinc-400">{f.label}</dt>
            <dd className="shrink-0 font-mono text-zinc-100">{f.value}</dd>
          </div>
        ))}
      </dl>
    );
  return null;
}

export function InsightCard({ insight, hero = false }: { insight: Insight; hero?: boolean }) {
  const link = insight.link ? (
    <Link
      to="/explorer"
      search={{ ...insight.link.filter, group: insight.link.group }}
      className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
    >
      {insight.link.label} →
    </Link>
  ) : null;

  if (hero) {
    return (
      <article className="flex flex-wrap items-center gap-6 rounded-2xl border border-cyan-800/70 bg-cyan-950/30 p-5 backdrop-blur-sm sm:p-7">
        <div className="min-w-0 flex-1 basis-80">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{insight.tag}</div>
          <h3 className="mt-2 text-xl font-semibold leading-snug text-zinc-50 sm:text-2xl">{insight.title}</h3>
          <p className="mt-2 text-sm text-zinc-300">{insight.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {link}
            <span className="text-xs text-zinc-400">{insight.sample}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 basis-64">
          <InsightVisual insight={insight} hero />
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">{insight.tag}</div>
        <div className="text-xs text-zinc-400">{insight.sample}</div>
      </div>
      <h3 className="text-base font-semibold leading-snug text-zinc-100">{insight.title}</h3>
      <InsightVisual insight={insight} hero={false} />
      <p className="text-sm text-zinc-400">{insight.body}</p>
      {link ? <div className="mt-auto pt-1">{link}</div> : null}
    </article>
  );
}
