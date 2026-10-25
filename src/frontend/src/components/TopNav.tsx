import { Link } from "@tanstack/react-router";
import logo from "../assets/monkeytype-stats-logo.png";

type NavItem = {
  to: "/" | "/explorer" | "/goals" | "/settings";
  label: string;
};

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/explorer", label: "Explorer" },
  { to: "/goals", label: "Goals" },
  { to: "/settings", label: "Settings" },
];

const navLinkBase =
  "group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200";

export function TopNav() {
  return (
    <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 sm:px-6 sm:py-5 sm:gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-center shadow-lg shadow-black/30 overflow-hidden shrink-0">
              <img
                src={logo}
                alt="MonkeyType Stats logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-xl font-bold tracking-tight">
                MonkeyType Stats
              </h1>
              <p className="text-xs text-zinc-500">
                Track your typing progress
              </p>
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-1 sm:gap-2 rounded-full bg-zinc-900/60 border border-zinc-800/80 p-1 shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/", includeSearch: false }}
              className={navLinkBase}
              activeProps={{
                className:
                  "bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-inner shadow-cyan-500/10",
              }}
              inactiveProps={{ className: "text-zinc-400 hover:text-zinc-100" }}
            >
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
