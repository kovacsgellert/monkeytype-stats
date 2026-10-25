import { useMemo } from "react";
import { normalizeResults } from "../stats/normalize";
import { detectTracks } from "../stats/tracks";
import { useResults } from "./useResults";

/** All results normalized and sorted oldest first, plus the tracks detected in them. */
export function useTestResults() {
  const query = useResults();
  const raw = query.data?.data;
  const results = useMemo(() => normalizeResults(raw ?? []), [raw]);
  const tracks = useMemo(() => detectTracks(results), [results]);
  return { query, results, tracks };
}
