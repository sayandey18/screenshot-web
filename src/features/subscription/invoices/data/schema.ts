import { z } from "zod";

export const invoiceStatusEnum = z.enum(["paid", "pending", "failed"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

export const invoiceSchema = z.object({
  id: z.string().min(1, "Invoice ID is required"),
  date: z.coerce.date(),
  amount: z.number().nonnegative(),
  currency: z.string().default("USD"),
  plan: z.string().min(1, "Plan is required"),
  status: invoiceStatusEnum,
  downloadUrl: z.string().url().optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
