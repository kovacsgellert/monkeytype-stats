import { useQuery } from "@tanstack/react-query";
import { fetchAppVersion } from "../api/version";

export function useAppVersion() {
  return useQuery({
    queryKey: ["app-version"],
    queryFn: fetchAppVersion,
    staleTime: 1000 * 60 * 5,
  });
}
