import { api } from "@/lib/api";
import {
  billingAddressSchema,
  subscriptionInfoSchema,
  invoicesResponseSchema,
  type BillingAddress,
  type SubscriptionInfo,
  type InvoicesResponse,
} from "./schema";

// ─── Subscription Types ───────────────────────────────────────────────────────

export type PlanId = "STARTER" | "GROWTH" | "ENTERPRISE";

export type SwitchPreviewResponse = {
  title?: string;
  description?: string;
  lines?: string[];
  amount?: number;
  currency?: string;
  [key: string]: unknown;
};

// ─── Payment Method Types ─────────────────────────────────────────────────────

export type PaymentMethodItem = {
  payment_method_id: string;
  payment_method: string;
  payment_method_type: string | null;
  recurring_enabled: boolean | null;
  last_used_at: string | null;
  card?: {
    card_holder_name?: string | null;
    card_network?: string | null;
    card_type?: string | null;
    expiry_month?: string | null;
    expiry_year?: string | null;
    last4_digits?: string | null;
    card_issuing_country?: string | null;
  } | null;
};

// ─── Billing Address Types ────────────────────────────────────────────────────

/** Alias for BillingAddress — kept so consumers that import BillingAddressInput need no changes. */
export type BillingAddressInput = BillingAddress;

// ─── Invoice Types ────────────────────────────────────────────────────────────

export type InvoicesQuery = {
  page: number;
  pageSize: number;
};

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function fetchSubscription(): Promise<SubscriptionInfo> {
  const { data } = await api.get("/billing/subscription");
  const parsed = subscriptionInfoSchema.safeParse(data);
  if (parsed.success) return parsed.data;

  // Graceful fallback — treat any parse failure as a free-tier user
  return {
    plan: "STARTER",
    status: "active",
    billingCycle: null,
    nextBillingDate: null,
    cancelledAt: null,
    cancelSchedule: false,
  };
}

export async function startCheckout(plan: Exclude<PlanId, "STARTER">): Promise<{ checkoutUrl: string }> {
  const { data } = await api.post<{ checkoutUrl: string }>("/billing/checkout", { plan });
  return data;
}

export async function fetchSwitchPreview(plan: PlanId): Promise<SwitchPreviewResponse> {
  const { data } = await api.post<SwitchPreviewResponse>("/billing/switch/preview", { plan });
  return data;
}

export async function confirmSwitch(plan: Exclude<PlanId, "STARTER">): Promise<void> {
  await api.post("/billing/switch", { plan });
}

export async function cancelSubscription(): Promise<void> {
  await api.post("/billing/cancel");
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export async function fetchPaymentMethods(): Promise<PaymentMethodItem[]> {
  const { data } = await api.get("/billing/payment-methods");
  return data;
}

// ─── Billing Address ──────────────────────────────────────────────────────────

export async function fetchBillingAddress(): Promise<BillingAddress | null> {
  const { data } = await api.get("/billing/address");
  // Backend returns null when no address has been saved yet
  if (!data) return null;
  return billingAddressSchema.parse(data);
}

export async function updateBillingAddress(address: BillingAddress): Promise<void> {
  await api.put("/billing/address", address);
}

// ─── Billing Portal ───────────────────────────────────────────────────────────

export async function openBillingPortal(): Promise<{ url: string }> {
  const { data } = await api.post<{ url: string }>("/billing/portal");
  return data;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function fetchInvoices(params: InvoicesQuery): Promise<InvoicesResponse> {
  const { data } = await api.get("/billing/invoices", { params });
  return invoicesResponseSchema.parse(data);
}
