import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { subscriptionKeys, sessionKeys, quotaKeys } from "@/hooks/api/query-keys";
import { subscriptionInfoSchema, type SubscriptionInfo } from "../data/schema";

async function fetchSubscription(): Promise<SubscriptionInfo> {
  const { data } = await api.get("/billing/subscription");
  const parsed = subscriptionInfoSchema.safeParse(data);
  if (parsed.success) return parsed.data;

  return {
    plan: "STARTER",
    status: "active",
    billingCycle: null,
    nextBillingDate: null,
    cancelledAt: null,
    cancelSchedule: false,
  };
}

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

export type PlanId = "STARTER" | "GROWTH" | "ENTERPRISE";
export type SwitchPreviewInput = { plan: PlanId };

export type SwitchPreviewResponse = {
  title?: string;
  description?: string;
  lines?: string[];
  amount?: number;
  currency?: string;
  [key: string]: unknown;
};

export const useStartCheckout = () =>
  useMutation({
    mutationFn: async ({ plan }: { plan: Exclude<PlanId, "STARTER"> }) => {
      const { data } = await api.post<{ checkoutUrl: string }>("/billing/checkout", { plan });
      return data;
    },
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: () => {
      toast.error("Unable to start checkout. Please try again.");
    },
  });

export const useSwitchPreview = () =>
  useMutation({
    mutationFn: async ({ plan }: SwitchPreviewInput) => {
      const { data } = await api.post<SwitchPreviewResponse>("/billing/switch/preview", { plan });
      return data;
    },
    onError: () => {
      toast.error("Unable to fetch switch preview. Please try again.");
    },
  });

export const useConfirmSwitch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plan }: { plan: Exclude<PlanId, "STARTER"> }) => {
      await api.post("/billing/switch", { plan });
    },
    onSuccess: () => {
      invalidateSubscriptionCaches(queryClient);
      toast.success("Your subscription plan has been updated.");
    },
    onError: () => {
      toast.error("Unable to switch plans. Please try again.");
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/billing/cancel"),
    onSuccess: () => {
      invalidateSubscriptionCaches(queryClient);
      toast.success("Cancellation scheduled. Your plan will revert to STARTER at period end.");
    },
    onError: () => {
      toast.error("Unable to cancel subscription. Please try again.");
    },
  });
};
