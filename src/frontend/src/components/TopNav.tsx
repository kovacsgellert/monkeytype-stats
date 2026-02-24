import type { PageKey } from "../types/page";

type NavItem = {
  key: PageKey;
  label: string;
  description: string;
};

const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Performance overview",
  },
  {
    key: "settings",
    label: "Settings",
    description: "Backups & preferences",
  },
];

type TopNavProps = {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
};

export function TopNav({ currentPage, onNavigate }: TopNavProps) {
  return (
    <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                MonkeyType Stats
              </h1>
              <p className="text-xs text-zinc-500">
                Track your typing progress
              </p>
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-2 rounded-full bg-zinc-900/60 border border-zinc-800/80 p-1">
          {navItems.map((item) => {
            const isActive = item.key === currentPage;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`group relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-inner shadow-cyan-500/10"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
