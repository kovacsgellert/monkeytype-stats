interface ModeFilterProps {
  modes: string[];
  selectedMode: string | null;
  onModeChange: (mode: string | null) => void;
  mode2Options: string[];
  selectedMode2: string | null;
  onMode2Change: (mode2: string | null) => void;
}

const pillBase =
  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200";
const pillActive = "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50";
const pillInactive =
  "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300";

export function ModeFilter({
  modes,
  selectedMode,
  onModeChange,
  mode2Options,
  selectedMode2,
  onMode2Change,
}: ModeFilterProps) {
  const showMode2 = selectedMode !== null && mode2Options.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-zinc-500 w-20 shrink-0">Mode:</span>
      <button
        onClick={() => onModeChange(null)}
        className={`${pillBase} ${selectedMode === null ? pillActive : pillInactive}`}
      >
        All
      </button>
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`${pillBase} capitalize ${selectedMode === mode ? pillActive : pillInactive}`}
        >
          {mode}
        </button>
      ))}

      {showMode2 && (
        <>
          <span className="mx-1 text-zinc-700">|</span>
          <button
            onClick={() => onMode2Change(null)}
            className={`${pillBase} ${selectedMode2 === null ? pillActive : pillInactive}`}
          >
            All
          </button>
          {mode2Options.map((m2) => (
            <button
              key={m2}
              onClick={() => onMode2Change(m2)}
              className={`${pillBase} ${selectedMode2 === m2 ? pillActive : pillInactive}`}
            >
              {m2}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
