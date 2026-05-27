import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/hooks/api/use-session";
import { SubscriptionBilling } from "@/features/subscription/billing";

export const Route = createFileRoute("/_authenticated/subscription/billing")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions());
    // STARTER is a free plan
    if (session?.user?.plan === "STARTER") {
      throw redirect({ to: "/subscription", replace: true });
    }
  },
  component: SubscriptionBilling,
});
