import z from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/hooks/api/use-session";
import { invoicesQueryOptions } from "@/features/subscription/hooks/use-invoices";
import { SubscriptionInvoices } from "@/features/subscription/invoices";

const subscriptionInvoicesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
});

export const Route = createFileRoute("/_authenticated/subscription/invoices")({
  validateSearch: subscriptionInvoicesSearchSchema,
  loaderDeps: ({ search: { page, pageSize } }) => ({
    page: page ?? 1,
    pageSize: pageSize ?? 10,
  }),

  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions());
    // STARTER is a free plan
    if (session?.user?.plan === "STARTER") {
      throw redirect({ to: "/subscription", replace: true });
    }
  },

  loader: async ({ context, deps: { page, pageSize } }) => {
    await context.queryClient.ensureQueryData(invoicesQueryOptions({ page, pageSize }));
  },
  component: SubscriptionInvoices,
});
