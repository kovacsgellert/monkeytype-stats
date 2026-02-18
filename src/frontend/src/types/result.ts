export interface Result {
  id: string;
  wpm: number;
  rawWpm: number;
  charStats: number[];
  acc: number;
  mode: string;
  mode2: string;
  quoteLength: number | null;
  timestamp: string;
  testDuration: number;
  consistency: number;
  keyConsistency: number;
  uid: string;
  restartCount: number | null;
  incompleteTestSeconds: number | null;
  afkDuration: number | null;
  tags: string[] | null;
  bailedOut: boolean | null;
  blindMode: boolean | null;
  lazyMode: boolean | null;
  funbox: string[] | null;
  language: string | null;
  difficulty: string | null;
  numbers: boolean | null;
  punctuation: boolean | null;
  isPb: boolean | null;
}

export interface ResultsResponse {
  data: Result[];
  errors: string[];
  isValid: boolean;
}

export interface ResultDetails {
  id: string;
  wpm: number;
  rawWpm: number;
  charStats: number[];
  acc: number;
  mode: string;
  mode2: string;
  quoteLength: number | null;
  timestamp: string;
  testDuration: number;
  consistency: number;
  keyConsistency: number;
  uid: string;
  restartCount: number | null;
  incompleteTestSeconds: number | null;
  afkDuration: number | null;
  tags: string[] | null;
  bailedOut: boolean | null;
  blindMode: boolean | null;
  lazyMode: boolean | null;
  funbox: string[] | null;
  language: string | null;
  difficulty: string | null;
  numbers: boolean | null;
  punctuation: boolean | null;
  isPb: boolean | null;
  chartWpm: number[] | null;
  chartBurst: number[] | null;
  chartErr: number[] | null;
  keySpacingAverage: number | null;
  keySpacingSd: number | null;
  keyDurationAverage: number | null;
  keyDurationSd: number | null;
  name: string | null;
}

export interface ResultDetailsResponse {
  data: ResultDetails | null;
  errors: string[];
  isValid: boolean;
}

/** Format a language slug for display: "english_1k" -> "English 1k" */
export function formatLanguage(language: string): string {
  return language
    .split("_")
    .map((word) =>
      /^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}
