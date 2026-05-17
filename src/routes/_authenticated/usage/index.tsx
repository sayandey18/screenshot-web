import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Usage } from "@/features/usage";
import { browsers, ranges, statuses } from "@/features/usage/data/data";

const usageSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  browser: z
    .array(z.enum(browsers.map((browser) => browser.value)))
    .optional()
    .catch([]),
  range: z
    .enum(ranges.map((range) => range.value))
    .optional()
    .catch("all"),
  filter: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/usage/")({
  validateSearch: usageSearchSchema,
  component: Usage,
});
