import type { ReactNode } from "react";
import { cardClass } from "./ui";

/** A pulsing placeholder block; size and shape come from className. */
function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-800/70 ${className}`} />;
}

function SkeletonPage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/** Same frame as StatTile. */
function StatTileSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-5">
      <Bone className="mb-3 h-3 w-20" />
      <Bone className="h-8 w-24" />
      <Bone className="mt-2 h-3 w-28 bg-zinc-800/50" />
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-2 sm:mb-4">
      <Bone className="h-5 w-32" />
      <Bone className="hidden h-3 w-56 bg-zinc-800/50 sm:block" />
    </div>
  );
}

function ChartSkeleton({ height = "h-72" }: { height?: string }) {
  return <Bone className={`${height} w-full rounded-xl bg-zinc-800/40`} />;
}

export function DashboardSkeleton() {
  return (
    <SkeletonPage label="Loading your dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Bone className="h-4 w-56 bg-zinc-800/50" />
          <h2 className="mt-1 text-2xl font-semibold text-zinc-100 sm:text-3xl">Your typing, at a glance</h2>
        </div>
        <Bone className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <StatTileSkeleton key={i} />
        ))}
      </div>

      <section>
        <SectionHeadingSkeleton />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={cardClass}>
              <div className="flex items-baseline justify-between gap-2">
                <Bone className="h-4 w-28" />
                <Bone className="h-3 w-14 bg-zinc-800/50" />
              </div>
              <Bone className="mt-2 h-3 w-36 bg-zinc-800/50" />
              <div className="mt-4 flex gap-4">
                <Bone className="h-7 w-14" />
                <Bone className="h-7 w-12" />
                <Bone className="h-7 w-12" />
              </div>
              <Bone className="mt-4 h-10 w-full bg-zinc-800/40" />
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <Bone className="h-5 w-40" />
          <Bone className="h-8 w-44 rounded-full" />
        </div>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Bone className="h-8 w-4/5" />
            <Bone className="h-8 w-3/5" />
            <Bone className="h-3 w-2/3 bg-zinc-800/50" />
            <Bone className="mt-3 h-24 w-full bg-zinc-800/40" />
          </div>
          <ChartSkeleton height="h-48" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeadingSkeleton />
        <div className={cardClass}>
          <Bone className="h-3 w-28 bg-zinc-800/50" />
          <Bone className="mt-3 h-6 w-3/4" />
          <Bone className="mt-2 h-6 w-1/2" />
          <Bone className="mt-4 h-20 w-full bg-zinc-800/40" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={cardClass}>
              <Bone className="h-3 w-24 bg-zinc-800/50" />
              <Bone className="mt-3 h-5 w-full" />
              <Bone className="mt-2 h-5 w-2/3" />
              <Bone className="mt-4 h-16 w-full bg-zinc-800/40" />
            </div>
          ))}
        </div>
      </section>
    </SkeletonPage>
  );
}

export function ExplorerSkeleton() {
  return (
    <SkeletonPage label="Loading your results">
      <PageHeader
        title="Explorer"
        subtitle="Filter, chart and drill into every result."
        action={<Bone className="h-4 w-64 bg-zinc-800/50" />}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800/70 bg-zinc-950/85 p-2 shadow-lg shadow-black/30">
        {["w-20", "w-20", "w-20", "w-24", "w-20"].map((width, i) => (
          <Bone key={i} className={`h-8 ${width} rounded-lg`} />
        ))}
        <Bone className="ml-auto h-8 w-20 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <StatTileSkeleton key={i} />
        ))}
      </div>

      <div className={cardClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["w-16", "w-24", "w-28", "w-14"].map((width, i) => (
              <Bone key={i} className={`h-8 ${width} rounded-full`} />
            ))}
          </div>
          <Bone className="h-8 w-36 rounded-lg" />
        </div>
        <ChartSkeleton />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Bone key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50">
        <div className="flex gap-8 border-b border-zinc-800/80 px-6 py-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Bone key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex gap-8 border-b border-zinc-800/50 px-6 py-4 last:border-b-0">
            <Bone className="h-4 w-12" />
            <Bone className="h-4 w-10 bg-zinc-800/50" />
            <Bone className="h-4 w-14 bg-zinc-800/50" />
            <Bone className="h-4 w-20 rounded-full bg-zinc-800/50" />
            <Bone className="h-4 w-28 bg-zinc-800/40" />
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}

export function GoalsSkeleton() {
  return (
    <SkeletonPage label="Loading your goals">
      <PageHeader
        title="Goals"
        subtitle="Set a target and watch your progress. Progress is calculated from your results."
        action={<Bone className="h-9 w-28 rounded-lg" />}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <Bone className="h-5 w-3/4" />
            <Bone className="mt-2 h-3 w-1/3 bg-zinc-800/50" />
            <div className="mt-5 flex items-baseline justify-between">
              <Bone className="h-8 w-20" />
              <Bone className="h-3 w-16 bg-zinc-800/50" />
            </div>
            <Bone className="mt-3 h-2 w-full rounded-full" />
            <div className="mt-5 flex gap-2">
              <Bone className="h-8 w-14 rounded-lg" />
              <Bone className="h-8 w-16 rounded-lg" />
              <Bone className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}

export function SettingsSkeleton() {
  return (
    <SkeletonPage label="Loading settings">
      <h2 className="text-2xl font-semibold text-zinc-100">Settings</h2>
      {Array.from({ length: 3 }, (_, i) => (
        <section
          key={i}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-lg shadow-black/20 sm:p-6 lg:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Bone className="h-3 w-36 bg-zinc-800/50" />
              <Bone className="h-4 w-72 max-w-full" />
            </div>
            <Bone className="h-11 w-40 rounded-xl" />
          </div>
        </section>
      ))}
    </SkeletonPage>
  );
}
