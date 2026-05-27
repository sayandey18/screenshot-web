import { queryOptions, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { unwrapAuthResult } from "@/lib/auth-helpers";
import { accountKeys } from "@/hooks/api/query-keys";

export const accountsQueryOptions = () =>
  queryOptions({
    queryKey: accountKeys.all,
    queryFn: async () => {
      const result = await authClient.listAccounts();
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useAccounts = () => useQuery(accountsQueryOptions());
