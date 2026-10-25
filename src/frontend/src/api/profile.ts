import { apiRequest } from "./apiClient";

export interface ProfileSnapshot {
  capturedAt: string;
  completedTests: number;
  startedTests: number;
  timeTypingSeconds: number;
  streakLength: number;
  maxStreakLength: number;
  lastResultTimestamp: string | null;
  streakHourOffset: number | null;
}

export interface LeaderboardStanding {
  language: string;
  mode: string;
  mode2: string;
  capturedAt: string;
  rank: number | null;
  friendsRank: number | null;
  leaderboardSize: number | null;
  /** rank / size × 100, e.g. 28.07 means top 28.07%. */
  topPercent: number | null;
  wpm: number | null;
  raw: number | null;
  acc: number | null;
  consistency: number | null;
  entryTimestamp: string | null;
  /** 10-WPM bucket floor (or "Other") → number of users with their PB there. */
  speedHistogram: Record<string, number> | null;
  speedHistogramCapturedAt: string | null;
}

export interface PersonalBest {
  mode: string;
  mode2: string;
  language: string | null;
  difficulty: string | null;
  punctuation: boolean | null;
  numbers: boolean | null;
  lazyMode: boolean | null;
  wpm: number;
  raw: number | null;
  acc: number | null;
  consistency: number | null;
  timestamp: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface MonkeyTypeProfile {
  profile: ProfileSnapshot | null;
  leaderboards: LeaderboardStanding[];
  personalBests: PersonalBest[];
  tags: Tag[];
}

export interface LeaderboardHistoryPoint {
  capturedAt: string;
  rank: number | null;
  leaderboardSize: number | null;
  topPercent: number | null;
  wpm: number | null;
}

export function fetchProfile(): Promise<MonkeyTypeProfile> {
  return apiRequest<MonkeyTypeProfile>("api/monkeytype/profile");
}

export function fetchLeaderboardHistory(mode2: string): Promise<LeaderboardHistoryPoint[]> {
  return apiRequest<LeaderboardHistoryPoint[]>(
    `api/monkeytype/leaderboards/history?language=english&mode=time&mode2=${encodeURIComponent(mode2)}`,
  );
}
