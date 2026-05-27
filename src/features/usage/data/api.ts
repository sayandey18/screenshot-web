import { api } from "@/lib/api";
import { usageLogsResponseSchema, type UsageLogsQuery, type UsageLogsResponse } from "./schema";

export async function fetchUsageLogs(params: UsageLogsQuery): Promise<UsageLogsResponse> {
  const { data } = await api.get("/usage", { params });
  return usageLogsResponseSchema.parse(data);
}
