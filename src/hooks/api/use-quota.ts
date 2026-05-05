import { z } from "zod";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { quotaKeys } from "@/hooks/api/query-keys";

const quotaResponseSchema = z.object({
  plan: z.string(),
  month: z.string(),
  quota: z.object({
    used: z.number(),
    limit: z.number(),
    remaining: z.number(),
    percentUsed: z.number(),
  }),
  projection: z.object({
    estimatedMonthTotal: z.number(),
    status: z.string(),
  }),
  resetDate: z.string(),
  daysLeft: z.number(),
});

export type QuotaResponse = z.infer<typeof quotaResponseSchema>;

async function fetchQuota(): Promise<QuotaResponse> {
  const { data } = await api.get("/usage/quota");
  return quotaResponseSchema.parse(data);
}

export const quotaQueryOptions = () =>
  queryOptions({
    queryKey: quotaKeys.current,
    queryFn: fetchQuota,
    staleTime: 1000 * 60 * 5, // 5 min — quota doesn't change on every render
    refetchOnWindowFocus: false,
  });

export const useQuota = () => useQuery(quotaQueryOptions());
