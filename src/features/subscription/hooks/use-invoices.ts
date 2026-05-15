import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { invoiceKeys } from "@/hooks/api/query-keys";
import { fetchInvoices, type InvoicesQuery } from "../data/api";
import type { InvoicesResponse } from "../data/schema";

export type { InvoicesQuery };

export const invoicesQueryOptions = ({ page, pageSize }: InvoicesQuery) =>
  queryOptions({
    queryKey: invoiceKeys.list(page, pageSize),
    queryFn: () => fetchInvoices({ page, pageSize }),
    placeholderData: keepPreviousData, // keep stale data while fetching next page
    staleTime: 1000 * 60 * 5, // 5 min — invoices are immutable historical records
    refetchOnWindowFocus: false,
  });

export const useInvoices = (params: InvoicesQuery): ReturnType<typeof useQuery<InvoicesResponse>> =>
  useQuery(invoicesQueryOptions(params));
