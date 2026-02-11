interface PeriodFilterProps {
  years: number[];
  selectedPeriod: string | null;
  onPeriodChange: (period: string | null) => void;
}

const pillBase =
  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200";
const pillActive = "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50";
const pillInactive =
  "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300";

export function PeriodFilter({
  years,
  selectedPeriod,
  onPeriodChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-zinc-500 w-20 shrink-0">Period:</span>
      <button
        onClick={() => onPeriodChange(null)}
        className={`${pillBase} ${selectedPeriod === null ? pillActive : pillInactive}`}
      >
        All
      </button>
      <button
        onClick={() => onPeriodChange("last-month")}
        className={`${pillBase} ${selectedPeriod === "last-month" ? pillActive : pillInactive}`}
      >
        Last Month
      </button>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onPeriodChange(String(year))}
          className={`${pillBase} ${selectedPeriod === String(year) ? pillActive : pillInactive}`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
