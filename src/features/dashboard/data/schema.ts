import { z } from "zod";

export const chartDataPointSchema = z.object({
  date: z.string(),
  success: z.number(),
  failed: z.number(),
  total: z.number(),
});

export const usageChartResponseSchema = z.object({
  range: z.string(),
  chartData: z.array(chartDataPointSchema),
  summary: z.object({
    totalRequests: z.number(),
    totalSuccess: z.number(),
    totalErrors: z.number(),
    successRate: z.number(),
  }),
});

export type UsageChartResponse = z.infer<typeof usageChartResponseSchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
