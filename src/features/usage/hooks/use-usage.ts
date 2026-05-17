import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usageKeys } from "@/hooks/api/query-keys";
import { fetchUsageLogs } from "../data/api";
import type { UsageLogsQuery } from "../data/schema";

export function useUsageLogs(params: UsageLogsQuery) {
  return useQuery({
    queryKey: usageKeys.log(params),
    queryFn: () => fetchUsageLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}
