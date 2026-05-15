import { z } from "zod";

// ─── Billing Address ────────────────────────────────────────────────────────
export const billingAddressSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional().default(""),
  countryCode: z.string().length(2, "Invalid country code"),
  stateCode: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export type BillingAddress = z.infer<typeof billingAddressSchema>;

// ─── Subscription Info ───────────────────────────────────────────────────────

export const subscriptionStatusEnum = z.enum(["active", "cancelled", "trial", "cancellation_scheduled"]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>;

export const billingCycleEnum = z.enum(["Month", "Year"]);
export type BillingCycle = z.infer<typeof billingCycleEnum>;

export const subscriptionInfoSchema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]).catch("STARTER"),
  status: subscriptionStatusEnum.catch("active"),
  billingCycle: billingCycleEnum
    .or(z.enum(["month", "year"]).transform((v) => (v === "month" ? "Month" : "Year")))
    .nullable()
    .optional(),
  nextBillingDate: z.string().nullable().optional(), // ISO date string
  cancelledAt: z.string().nullable().optional(),
  cancelSchedule: z
    .boolean()
    .nullable()
    .optional()
    .transform((v) => Boolean(v)),
});

export type SubscriptionInfo = z.infer<typeof subscriptionInfoSchema>;

// ─── Invoice Info ───────────────────────────────────────────────────────

export const invoiceStatusEnum = z.enum(["succeeded", "processing", "failed", "cancelled", "refunded"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

export const invoiceSchema = z.object({
  id: z.string().min(1),
  issuedAt: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string().default("USD"),
  plan: z.string().min(1),
  status: invoiceStatusEnum,
  pdfUrl: z.url(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

export const invoicesResponseSchema = z.object({
  data: z.array(invoiceSchema),
  total: z.number().nonnegative(),
});

export type InvoicesResponse = z.infer<typeof invoicesResponseSchema>;
