import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usageKeys } from "@/hooks/api/query-keys";
import { usageLogsResponseSchema, type UsageLogsQuery, type UsageRange } from "@/features/usage/data/schema";
import { usageChartResponseSchema, type UsageChartResponse } from "../data/schema";

async function fetchUsageChart(range: string): Promise<UsageChartResponse> {
  const { data } = await api.get("/usage/chart", { params: { range } });
  return usageChartResponseSchema.parse(data);
}

export function useUsageChart(range: string) {
  return useQuery({
    queryKey: usageKeys.chart(range),
    queryFn: () => fetchUsageChart(range),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

async function fetchRecentScreenshots() {
  const params: UsageLogsQuery = { page: 1, limit: 5, status: "all", range: "all" };
  const { data } = await api.get("/usage", { params });
  return usageLogsResponseSchema.parse(data);
}

export function useRecentScreenshots() {
  return useQuery({
    queryKey: usageKeys.log({ page: 1, limit: 5, status: "all", range: "all" }),
    queryFn: fetchRecentScreenshots,
    staleTime: 1000 * 30,
  });
}

async function fetchUsageLogsForFormats(range: string) {
  const mappedRange: UsageRange = range === "30d" ? "all" : (range as UsageRange);
  const params: UsageLogsQuery = { page: 1, limit: 100, status: "all", range: mappedRange };
  const { data } = await api.get("/usage", { params });
  return usageLogsResponseSchema.parse(data);
}

const ALL_FORMATS = ["PNG", "WebP", "JPEG", "PDF"];

export function useFormatBreakdown(range: string) {
  return useQuery({
    queryKey: usageKeys.log({ page: 1, limit: 100, status: "all", range }),
    queryFn: () => fetchUsageLogsForFormats(range),
    staleTime: 1000 * 60 * 2,
    select: (data) => {
      const formatCounts = data.requests.reduce(
        (acc, req) => {
          const format = req.format.toUpperCase();
          acc[format] = (acc[format] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return ALL_FORMATS.map((name) => ({ name, count: formatCounts[name] ?? 0 }));
    },
  });
}
