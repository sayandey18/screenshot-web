import { z } from "zod";

export const usageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  apiKeyId: z.string(),
  apiKeyName: z.string(),
  url: z.string(),
  browser: z.string(),
  format: z.string(),
  status: z.enum(["success", "failed", "pending"]),
  durationMs: z.number(),
  month: z.string(),
  storageKey: z.string().nullable(),
  downloadUrl: z.string().nullable(),
  callbackUrl: z.string().nullable(),
  webhookSentAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
});

export type Usage = z.infer<typeof usageSchema>;
