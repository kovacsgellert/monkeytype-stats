export function LoadingSkeleton() {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`period-pill-${i}`}
              className="h-9 w-20 rounded-full bg-zinc-800/70 animate-pulse"
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`mode-pill-${i}`}
              className="h-9 w-20 rounded-full bg-zinc-800/70 animate-pulse"
            />
          ))}
          <div className="h-5 w-px bg-zinc-800/80 mx-1 animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`mode2-pill-${i}`}
              className="h-9 w-16 rounded-full bg-zinc-800/60 animate-pulse"
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`language-pill-${i}`}
              className="h-9 w-24 rounded-full bg-zinc-800/70 animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`stat-${i}`}
            className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6"
          >
            <div className="h-3 w-16 bg-zinc-800 rounded mb-3 animate-pulse" />
            <div className="h-8 w-20 bg-zinc-800 rounded mb-2 animate-pulse" />
            <div className="h-3 w-24 bg-zinc-800/50 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`metric-pill-${i}`}
              className="h-9 w-20 rounded-full bg-zinc-800/70 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-zinc-800/50 animate-pulse" />
        <div className="flex items-center gap-2 mt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`avg-pill-${i}`}
              className="h-9 w-20 rounded-full bg-zinc-800/70 animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
        <div className="border-b border-zinc-800/80 px-6 py-4 flex gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`header-${i}`}
              className="h-3 w-16 bg-zinc-800 rounded animate-pulse"
            />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`row-${i}`}
            className="border-b border-zinc-800/50 px-6 py-4 flex gap-8"
          >
            <div className="h-5 w-12 bg-zinc-800 rounded animate-pulse" />
            <div className="h-5 w-10 bg-zinc-800/70 rounded animate-pulse" />
            <div className="h-5 w-14 bg-zinc-800/70 rounded animate-pulse" />
            <div className="h-5 w-14 bg-zinc-800/70 rounded animate-pulse" />
            <div className="h-5 w-20 bg-zinc-800/50 rounded-full animate-pulse" />
            <div className="h-5 w-16 bg-zinc-800/50 rounded animate-pulse" />
            <div className="h-5 w-28 bg-zinc-800/50 rounded animate-pulse" />
            <div className="h-5 w-9 bg-zinc-800/30 rounded-full animate-pulse" />
          </div>
        ))}
        <div className="border-t border-zinc-800/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 bg-zinc-800 rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`page-size-${i}`}
                className="h-8 w-10 rounded-lg bg-zinc-800/70 animate-pulse"
              />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
            <div className="flex items-center gap-1">
              <div className="h-9 w-9 rounded-lg bg-zinc-800/70 animate-pulse" />
              <div className="h-9 w-9 rounded-lg bg-zinc-800/70 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
