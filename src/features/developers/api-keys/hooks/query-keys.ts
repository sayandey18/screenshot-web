export const apiKeyKeys = {
  all: ["api-keys"] as const,
  list: (page: number) => ["api-keys", "list", page] as const,
  detail: (id: string) => ["api-keys", "detail", id] as const,
};
