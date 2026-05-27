import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { billingKeys } from "@/hooks/api/query-keys";
import { fetchBillingAddress, updateBillingAddress, openBillingPortal } from "../data/api";
import type { BillingAddress } from "../data/schema";

// ─── Billing Address — Fetch ─────────────────────────────────────────────────

export const billingAddressQueryOptions = () =>
  queryOptions({
    queryKey: billingKeys.address(),
    queryFn: fetchBillingAddress,
    staleTime: 1000 * 60 * 10, // 10 min — billing address rarely changes
    refetchOnWindowFocus: false,
  });

export const useBillingAddress = () => useQuery(billingAddressQueryOptions());

// ─── Billing Address — Update ────────────────────────────────────────────────
// The backend handles the dual write:
//   1. Upserts into the local `billing_address` table (linked to userId)
//   2. Calls the Dodo Payments API to update the customer's billing address

export const useUpdateBillingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: BillingAddress) => updateBillingAddress(address),
    onSuccess: (_, variables) => {
      // Optimistically update the cache so the UI reflects changes immediately
      queryClient.setQueryData<BillingAddress>(billingKeys.address(), variables);
      toast.success("Billing address updated.");
    },
    onError: () => {
      // Roll back optimistic update on failure
      void queryClient.invalidateQueries({ queryKey: billingKeys.address() });
      toast.error("Failed to update billing address. Please try again.");
    },
  });
};

// ─── Dodo Payments Portal — Payment Method Management ───────────────────────
// Card details must never be collected in our own form (PCI compliance).
// Instead, we open the Dodo Payments customer portal where the user can
// securely manage their payment method directly on Dodo's hosted page.

export const useOpenBillingPortal = () =>
  useMutation({
    mutationFn: openBillingPortal,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error("Unable to open billing portal. Please try again.");
    },
  });
