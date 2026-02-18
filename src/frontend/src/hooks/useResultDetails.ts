import { useQuery } from "@tanstack/react-query";
import { fetchResultDetails } from "../api/results";

export function useResultDetails(resultId: string | null) {
  return useQuery({
    queryKey: ["result-details", resultId],
    queryFn: () => fetchResultDetails(resultId!),
    enabled: Boolean(resultId),
    staleTime: 1000 * 60 * 5,
  });
}
