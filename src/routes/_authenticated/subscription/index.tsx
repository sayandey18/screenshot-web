import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { quotaKeys, subscriptionKeys, sessionKeys } from "@/hooks/api/query-keys";
import { subscriptionQueryOptions } from "@/features/subscription/hooks/use-subscription";
import { SubscriptionPlans } from "@/features/subscription/plans";

const subscriptionSearchSchema = z.object({
  success: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/_authenticated/subscription/")({
  validateSearch: subscriptionSearchSchema,
  loader: async ({ context, location }) => {
    const isPostCheckout = (location.search as { success?: boolean }).success === true;
    if (isPostCheckout) {
      await Promise.all([
        context.queryClient.invalidateQueries({ queryKey: sessionKeys.current }),
        context.queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
        context.queryClient.invalidateQueries({ queryKey: quotaKeys.current }),
      ]);
    }
    await context.queryClient.ensureQueryData(subscriptionQueryOptions());
  },
  component: SubscriptionPlans,
});
