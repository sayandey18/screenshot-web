export const sessionKeys = {
  current: ["session", "current"] as const,
};

export const accountKeys = {
  all: ["accounts"] as const,
};

export const quotaKeys = {
  current: ["usage", "quota"] as const,
};

export const apiKeyKeys = {
  all: ["api-keys"] as const,
  list: (page: number) => ["api-keys", "list", page] as const,
  detail: (id: string) => ["api-keys", "detail", id] as const,
};

export const subscriptionKeys = {
  all: ["subscription"] as const,
  current: () => [...subscriptionKeys.all, "current"] as const,
};

export const billingKeys = {
  all: ["billing"] as const,
  address: () => [...billingKeys.all, "address"] as const,
};

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (page: number, pageSize: number) => [...invoiceKeys.all, "list", page, pageSize] as const,
};
