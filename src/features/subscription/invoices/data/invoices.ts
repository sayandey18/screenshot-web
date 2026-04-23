export type InvoiceStatus = "paid" | "pending" | "failed";

export type SubscriptionPlan = "starter" | "growth" | "enterprise";

export type Invoice = {
  id: string;
  issuedAt: string;
  amount: number;
  currency: "USD";
  plan: SubscriptionPlan;
  status: InvoiceStatus;
  downloadUrl: string;
};

export const invoices: Invoice[] = [
  {
    id: "INV-2026-0012",
    issuedAt: "2026-04-03",
    amount: 15,
    currency: "USD",
    plan: "enterprise",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2026-0012.pdf",
  },
  {
    id: "INV-2026-0011",
    issuedAt: "2026-03-03",
    amount: 15,
    currency: "USD",
    plan: "enterprise",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2026-0011.pdf",
  },
  {
    id: "INV-2026-0010",
    issuedAt: "2026-02-03",
    amount: 15,
    currency: "USD",
    plan: "enterprise",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2026-0010.pdf",
  },
  {
    id: "INV-2026-0009",
    issuedAt: "2026-01-03",
    amount: 15,
    currency: "USD",
    plan: "enterprise",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2026-0009.pdf",
  },
  {
    id: "INV-2025-0008",
    issuedAt: "2025-12-03",
    amount: 8,
    currency: "USD",
    plan: "growth",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2025-0008.pdf",
  },
  {
    id: "INV-2025-0007",
    issuedAt: "2025-11-03",
    amount: 8,
    currency: "USD",
    plan: "growth",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2025-0007.pdf",
  },
  {
    id: "INV-2025-0006",
    issuedAt: "2025-10-03",
    amount: 8,
    currency: "USD",
    plan: "growth",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2025-0006.pdf",
  },
  {
    id: "INV-2025-0005",
    issuedAt: "2025-09-03",
    amount: 8,
    currency: "USD",
    plan: "growth",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2025-0005.pdf",
  },
  {
    id: "INV-2025-0004",
    issuedAt: "2025-08-03",
    amount: 8,
    currency: "USD",
    plan: "growth",
    status: "pending",
    downloadUrl: "/mock/invoices/INV-2025-0004.pdf",
  },
  {
    id: "INV-2025-0003",
    issuedAt: "2025-07-03",
    amount: 8,
    currency: "USD",
    plan: "growth",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2025-0003.pdf",
  },
  {
    id: "INV-2025-0002",
    issuedAt: "2025-06-03",
    amount: 0,
    currency: "USD",
    plan: "starter",
    status: "paid",
    downloadUrl: "/mock/invoices/INV-2025-0002.pdf",
  },
  {
    id: "INV-2025-0001",
    issuedAt: "2025-05-03",
    amount: 0,
    currency: "USD",
    plan: "starter",
    status: "failed",
    downloadUrl: "/mock/invoices/INV-2025-0001.pdf",
  },
];

export const formatInvoiceAmount = (amount: number, currency: Invoice["currency"]) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const planLabelMap: Record<SubscriptionPlan, string> = {
  starter: "STARTER",
  growth: "GROWTH",
  enterprise: "ENTERPRISE",
};

export const statusLabelMap: Record<InvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
};
