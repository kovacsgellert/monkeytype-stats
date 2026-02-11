export function LoadingSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Stats Summary Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6"
          >
            <div className="h-3 w-16 bg-zinc-800 rounded mb-3" />
            <div className="h-8 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-3 w-24 bg-zinc-800/50 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
        {/* Header */}
        <div className="border-b border-zinc-800/80 px-6 py-4 flex gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-3 w-16 bg-zinc-800 rounded" />
          ))}
        </div>
        {/* Rows */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="border-b border-zinc-800/50 px-6 py-4 flex gap-8"
          >
            <div className="h-5 w-12 bg-zinc-800 rounded" />
            <div className="h-5 w-10 bg-zinc-800/70 rounded" />
            <div className="h-5 w-14 bg-zinc-800/70 rounded" />
            <div className="h-5 w-14 bg-zinc-800/70 rounded" />
            <div className="h-5 w-20 bg-zinc-800/50 rounded-full" />
            <div className="h-5 w-16 bg-zinc-800/50 rounded" />
            <div className="h-5 w-28 bg-zinc-800/50 rounded" />
            <div className="h-5 w-5 bg-zinc-800/30 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
