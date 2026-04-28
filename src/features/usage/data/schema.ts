import { z } from "zod";

export const usageStatusSchema = z.enum(["pending", "success", "error", "limit_exceeded"]);
export const usageRangeSchema = z.enum(["all", "today", "7d", "14d"]);

export const usageRequestSchema = z.object({
  id: z.string(),
  url: z.string(),
  urlDisplay: z.string(),
  browser: z.string(),
  status: usageStatusSchema,
  format: z.string(),
  durationMs: z.number().nullable(),
  durationDisplay: z.string().nullable(),
  downloadUrl: z.string().nullable(),
  fileExpiresAt: z.string().nullable(),
  fileAvailable: z.boolean(),
  createdAt: z.string(),
});

export const usagePaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const usageLogsResponseSchema = z.object({
  requests: z.array(usageRequestSchema),
  pagination: usagePaginationSchema,
});

export const usageLogsQuerySchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  status: usageStatusSchema.or(z.literal("all")).default("all"),
  range: usageRangeSchema.default("all"),
});

export type UsageStatus = z.infer<typeof usageStatusSchema>;
export type UsageRange = z.infer<typeof usageRangeSchema>;
export type UsageRequest = z.infer<typeof usageRequestSchema>;
export type Usage = UsageRequest;
export type UsagePagination = z.infer<typeof usagePaginationSchema>;
export type UsageLogsResponse = z.infer<typeof usageLogsResponseSchema>;
export type UsageLogsQuery = z.infer<typeof usageLogsQuerySchema>;
