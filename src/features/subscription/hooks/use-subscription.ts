import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { subscriptionKeys, sessionKeys, quotaKeys } from "@/hooks/api/query-keys";
import { subscriptionInfoSchema, type SubscriptionInfo } from "../data/schema";

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchSubscription(): Promise<SubscriptionInfo> {
  const { data } = await api.get("/billing/subscription");
  return subscriptionInfoSchema.parse(data);
}

export const subscriptionQueryOptions = () =>
  queryOptions({
    queryKey: subscriptionKeys.current(),
    queryFn: fetchSubscription,
    staleTime: 1000 * 60 * 5, // 5 min — plan doesn't change mid-session
    refetchOnWindowFocus: false,
  });

export const useSubscription = () => useQuery(subscriptionQueryOptions());

// ─── Checkout (Upgrade) ──────────────────────────────────────────────────────
// Calls our backend which creates a Dodo Payments hosted checkout session
// and returns the checkout URL. The browser is then redirected to Dodo.

type CheckoutInput = { slug: "growth-plan" | "enterprise-plan" };

export const useCheckout = () =>
  useMutation({
    mutationFn: async ({ slug }: CheckoutInput) => {
      const { data } = await api.post<{ checkoutUrl: string }>("/billing/checkout", { slug });
      return data;
    },
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: () => {
      toast.error("Unable to start checkout. Please try again.");
    },
  });

// ─── Cancel Subscription ─────────────────────────────────────────────────────

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/billing/cancel"),
    onSuccess: () => {
      // Plan status changes — invalidate both session and subscription caches
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.current });
      void queryClient.invalidateQueries({ queryKey: quotaKeys.current });
      toast.success("Cancellation scheduled. Your plan will revert to STARTER at period end.");
    },
    onError: () => {
      toast.error("Unable to cancel subscription. Please try again.");
    },
  });
};
