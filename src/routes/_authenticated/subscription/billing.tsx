import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionBilling } from "@/features/subscription/billing";

export const Route = createFileRoute("/_authenticated/subscription/billing")({
  component: SubscriptionBilling,
});
