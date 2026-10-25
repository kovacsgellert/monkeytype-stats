import { formatLanguage } from "../utils/languageUtils";

interface LanguageFilterProps {
  languages: string[];
  selectedLanguage: string | null;
  onLanguageChange: (language: string | null) => void;
}

const pillBase =
  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm";
const pillActive = "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50";
const pillInactive =
  "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300";

export function LanguageFilter({
  languages,
  selectedLanguage,
  onLanguageChange,
}: LanguageFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-6">
      <span className="text-xs sm:text-sm text-zinc-500 w-full sm:w-20 shrink-0">
        Language:
      </span>
      <button
        onClick={() => onLanguageChange(null)}
        className={`${pillBase} ${selectedLanguage === null ? pillActive : pillInactive}`}
      >
        All
      </button>
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`${pillBase} ${selectedLanguage === lang ? pillActive : pillInactive}`}
        >
          {formatLanguage(lang)}
        </button>
      ))}
    </div>
  );
}
