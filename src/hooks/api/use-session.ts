import { queryOptions, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { unwrapAuthResult } from "@/lib/auth-helpers";
import { sessionKeys } from "@/hooks/api/query-keys";

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.current,
    queryFn: async () => {
      const result = await authClient.getSession();
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
  });

export const useSession = () => useQuery(sessionQueryOptions());
