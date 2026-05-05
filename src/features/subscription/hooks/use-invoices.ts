import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invoiceKeys } from "@/hooks/api/query-keys";
import { invoicesResponseSchema, type InvoicesResponse } from "../data/schema";

export type InvoicesQuery = {
  page: number;
  pageSize: number;
};

async function fetchInvoices(params: InvoicesQuery): Promise<InvoicesResponse> {
  const { data } = await api.get("/billing/invoices", { params });
  return invoicesResponseSchema.parse(data);
}

export const invoicesQueryOptions = ({ page, pageSize }: InvoicesQuery) =>
  queryOptions({
    queryKey: invoiceKeys.list(page, pageSize),
    queryFn: () => fetchInvoices({ page, pageSize }),
    placeholderData: keepPreviousData, // keep stale data while fetching next page
    staleTime: 1000 * 60 * 5, // 5 min — invoices are immutable historical records
    refetchOnWindowFocus: false,
  });

export const useInvoices = (params: InvoicesQuery) => useQuery(invoicesQueryOptions(params));
