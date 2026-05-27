import { z } from "zod";

export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  start: z.string().nullable().optional(),
  prefix: z.string().nullable().optional(),
  enabled: z.boolean().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ApiKeyItem = z.infer<typeof apiKeySchema>;
