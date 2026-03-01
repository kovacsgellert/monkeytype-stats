import type { PageKey } from "../types/page";
import logo from "../assets/monkeytype-stats-logo.png";

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
            <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-center shadow-lg shadow-black/30 overflow-hidden">
              <img
                src={logo}
                alt="MonkeyType Stats logo"
                className="w-full h-full object-cover"
              />
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
