import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchLeaderboardHistory,
  fetchProfile,
  type LeaderboardHistoryPoint,
} from "../api/profile";

const BOARDS = ["15", "60"];

// module-level so useQueries can keep the combined object stable between renders
function combineHistory(results: { data?: LeaderboardHistoryPoint[] }[]) {
  return Object.fromEntries(BOARDS.map((mode2, i) => [mode2, results[i].data ?? []]));
}

export function useProfile() {
  return useQuery({
    queryKey: ["monkeytype-profile"],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLeaderboardHistory(mode2: string) {
  return useQuery({
    queryKey: ["leaderboard-history", mode2],
    queryFn: () => fetchLeaderboardHistory(mode2),
    staleTime: 1000 * 60 * 5,
  });
}

/** History for both all-time boards, keyed by mode2. */
export function useAllLeaderboardHistory() {
  return useQueries({
    queries: BOARDS.map((mode2) => ({
      queryKey: ["leaderboard-history", mode2],
      queryFn: () => fetchLeaderboardHistory(mode2),
      staleTime: 1000 * 60 * 5,
    })),
    combine: combineHistory,
  });
}
