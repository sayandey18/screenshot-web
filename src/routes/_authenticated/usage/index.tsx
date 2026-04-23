import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Usage } from "@/features/usage";

const currentMonth = new Date().toISOString().slice(0, 7);

const usageSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),

  // Toolbar-style search + facet filters
  filter: z.string().optional().catch(""),
  status: z
    .array(z.union([z.literal("success"), z.literal("failed"), z.literal("pending")]))
    .optional()
    .catch([]),
  browser: z
    .array(z.union([z.literal("chromium"), z.literal("firefox"), z.literal("webkit")]))
    .optional()
    .catch([]),

  // Month filter (single-select)
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected month format YYYY-MM")
    .optional()
    .catch(currentMonth),
});

export const Route = createFileRoute("/_authenticated/usage/")({
  validateSearch: usageSearchSchema,
  component: Usage,
});
