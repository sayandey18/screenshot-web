import z from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionInvoices } from "@/features/subscription/invoices";

const subscriptionInvoicesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
});

export const Route = createFileRoute("/_authenticated/subscription/invoices")({
  validateSearch: subscriptionInvoicesSearchSchema,
  component: SubscriptionInvoices,
});
