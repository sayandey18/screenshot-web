import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionKeys, sessionKeys, quotaKeys, billingKeys } from "@/hooks/api/query-keys";
import {
  fetchSubscription,
  startCheckout,
  confirmSwitch,
  cancelSubscription,
  fetchPaymentMethods,
  type PlanId,
  type PaymentMethodItem,
  type BillingAddressInput,
} from "../data/api";

// Re-export types so existing consumers need no import path changes
export type { PlanId, PaymentMethodItem, BillingAddressInput };

// ─── Subscription ─────────────────────────────────────────────────────────────

export const subscriptionQueryOptions = () =>
  queryOptions({
    queryKey: subscriptionKeys.current(),
    queryFn: fetchSubscription,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useSubscription = () => useQuery(subscriptionQueryOptions());

const invalidateSubscriptionCaches = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
  void queryClient.invalidateQueries({ queryKey: sessionKeys.current });
  void queryClient.invalidateQueries({ queryKey: quotaKeys.current });
};

// ─── Checkout ─────────────────────────────────────────────────────────────────

export const useStartCheckout = () =>
  useMutation({
    mutationFn: ({ plan }: { plan: Exclude<PlanId, "STARTER"> }) => startCheckout(plan),
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: () => {
      toast.error("Unable to start checkout. Please try again.");
    },
  });

// ─── Plan Switch ──────────────────────────────────────────────────────────────

export const useConfirmSwitch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plan }: { plan: Exclude<PlanId, "STARTER"> }) => confirmSwitch(plan),
    onSuccess: () => {
      invalidateSubscriptionCaches(queryClient);
      toast.success("Your subscription plan has been updated.");
    },
    onError: () => {
      toast.error("Unable to switch plans. Please try again.");
    },
  });
};

// ─── Cancel ───────────────────────────────────────────────────────────────────

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      invalidateSubscriptionCaches(queryClient);
      toast.success("Cancellation scheduled. Your plan will revert to STARTER at period end.");
    },
    onError: () => {
      toast.error("Unable to cancel subscription. Please try again.");
    },
  });
};

// ─── Payment Methods ──────────────────────────────────────────────────────────

export const usePaymentMethods = () =>
  useQuery({
    queryKey: billingKeys.paymentMethods(),
    queryFn: fetchPaymentMethods,
    staleTime: 1000 * 60 * 10,
  });
