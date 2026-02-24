import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { PageKey } from "./types/page";

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("dashboard");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-cyan-900/10 via-transparent to-transparent" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-purple-900/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
      </div>

      <div className="relative z-10">
        <TopNav currentPage={currentPage} onNavigate={setCurrentPage} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {currentPage === "dashboard" ? <DashboardPage /> : <SettingsPage />}
        </main>

        <footer className="border-t border-zinc-800/50 mt-12"></footer>
      </div>
    </div>
  );
}

export default App;
