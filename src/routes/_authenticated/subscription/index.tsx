import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionPlans } from "@/features/subscription/plans";

export const Route = createFileRoute("/_authenticated/subscription/")({
  component: SubscriptionPlans,
});
