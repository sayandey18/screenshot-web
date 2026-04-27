import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { unwrapAuthResult } from "@/lib/auth-helpers";
import { apiKeySchema, type ApiKeyItem } from "../data/schema";
import { apiKeyKeys } from "./query-keys";

type ApiKeyListPayload = {
  apiKeys?: unknown;
  total?: unknown;
};

type CreateApiKeyInput = {
  name: string;
  expiresIn?: number;
};

type UpdateApiKeyInput = {
  keyId: string;
  name?: string;
  enabled?: boolean;
};

const parseApiKeys = (input: unknown): ApiKeyItem[] => {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => apiKeySchema.safeParse(item))
    .filter((item) => item.success)
    .map((item) => item.data);
};

export const useApiKeys = (page: number) =>
  useQuery({
    queryKey: apiKeyKeys.list(page),
    queryFn: async () => {
      const offset = Math.max(0, (page - 1) * 10);
      const result = await authClient.apiKey.list({
        query: {
          limit: 10,
          offset,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      const payload = unwrapAuthResult(result as { data: ApiKeyListPayload; error: unknown });
      const items = parseApiKeys(payload.apiKeys);
      const total = typeof payload.total === "number" ? payload.total : items.length;

      return { items, total };
    },
  });

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApiKeyInput) => {
      const result = await authClient.apiKey.create(input);
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateApiKeyInput) => {
      const result = await authClient.apiKey.update(input);
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const result = await authClient.apiKey.delete({ keyId });
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
};
