import { z } from "zod";

export const usageStatusEnum = z.enum(["success", "failed", "pending"]);
export const usageFormatEnum = z.enum(["png", "jpeg", "jpg", "webp", "pdf"]);
export const usageBrowserEnum = z.enum(["chromium", "firefox", "webkit"]);

export const usageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  apiKeyId: z.string(),
  apiKeyName: z.string().nullable().optional(),
  url: z.string().url(),
  browser: usageBrowserEnum,
  format: usageFormatEnum,
  status: usageStatusEnum,
  durationMs: z.number().int().nonnegative(),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected month format YYYY-MM"),
  storageKey: z.string().nullable().optional(),
  downloadUrl: z.string().url().nullable().optional(),
  callbackUrl: z.string().url().nullable().optional(),
  webhookSentAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
});

export type Usage = z.infer<typeof usageSchema>;
export type UsageStatus = z.infer<typeof usageStatusEnum>;
export type UsageFormat = z.infer<typeof usageFormatEnum>;
export type UsageBrowser = z.infer<typeof usageBrowserEnum>;

export const getUsageStatusLabel = (status: UsageStatus) => {
  switch (status) {
    case "success":
      return "Success";
    case "failed":
      return "Failed";
    case "pending":
      return "Pending";
    default:
      return status;
  }
};

export const getUsageFormatLabel = (format: UsageFormat) => format.toUpperCase();

export const usageStatusFilterOptions: Array<{ label: string; value: UsageStatus }> = [
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" },
];

export const usageBrowserFilterOptions: Array<{ label: string; value: UsageBrowser }> = [
  { label: "Chromium", value: "chromium" },
  { label: "Firefox", value: "firefox" },
  { label: "WebKit", value: "webkit" },
];

export const usageStatusBadgeClassName: Record<UsageStatus, string> = {
  success: "border-teal-200 bg-teal-100/30 text-teal-900 dark:text-teal-200",
  failed: "border-destructive/30 text-destructive",
  pending: "border-amber-200 bg-amber-100/40 text-amber-900 dark:text-amber-200",
};
