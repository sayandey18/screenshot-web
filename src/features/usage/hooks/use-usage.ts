import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchUsageLogs } from "../data/api";
import type { UsageLogsQuery } from "../data/schema";

export const usageKeys = {
  all: ["usage"] as const,
  logs: () => [...usageKeys.all, "logs"] as const,
  log: (params: UsageLogsQuery) => [...usageKeys.logs(), params] as const,
};

export function useUsageLogs(params: UsageLogsQuery) {
  return useQuery({
    queryKey: usageKeys.log(params),
    queryFn: () => fetchUsageLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}
