import { api } from "@/lib/api";

export type UsageStatus = "success" | "failed" | "pending";
export type UsageBrowser = "chromium" | "firefox" | "webkit";

export type UsageListParams = {
  userId: string;
  status?: UsageStatus;
  month?: string; // YYYY-MM
  browser?: UsageBrowser;
  filter?: string;
  page?: number;
  pageSize?: number;
};

export type UsageApiKey = {
  id: string;
  name: string;
};

export type UsageItem = {
  id: string;
  userId: string;
  apiKeyId: string;
  url: string;
  browser: UsageBrowser | string;
  format: string;
  status: UsageStatus | string;
  durationMs: number;
  month: string;
  storageKey: string | null;
  downloadUrl: string | null;
  callbackUrl: string | null;
  webhookSentAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  apiKeyName?: string | null;
  apiKey?: UsageApiKey | null;
};

export type UsageListResult = {
  rows: UsageItem[];
  total: number;
  page: number;
  pageSize: number;
};

type UsageListApiResponse = {
  data?: unknown;
  rows?: unknown;
  total?: unknown;
  page?: unknown;
  pageSize?: unknown;
};

type UsageDetailsApiResponse = {
  data?: unknown;
  usage?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function pickValue(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) return record[key];
  }
  return undefined;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asUsageStatus(value: unknown): UsageStatus | string {
  if (value === "success" || value === "failed" || value === "pending") return value;
  return asString(value);
}

function asUsageBrowser(value: unknown): UsageBrowser | string {
  if (value === "chromium" || value === "firefox" || value === "webkit") return value;
  return asString(value);
}

function parseApiKey(value: unknown): UsageApiKey | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const name = asString(value.name);
  if (!id && !name) return null;
  return { id, name };
}

function parseUsageItem(value: unknown): UsageItem | null {
  if (!isRecord(value)) return null;

  const id = asString(pickValue(value, "id"));
  if (!id) return null;

  return {
    id,
    userId: asString(pickValue(value, "userId", "user_id")),
    apiKeyId: asString(pickValue(value, "apiKeyId", "apikey_id", "api_key_id")),
    url: asString(pickValue(value, "url")),
    browser: asUsageBrowser(pickValue(value, "browser")),
    format: asString(pickValue(value, "format")),
    status: asUsageStatus(pickValue(value, "status")),
    durationMs: asNumber(pickValue(value, "durationMs", "duration_ms")),
    month: asString(pickValue(value, "month")),
    storageKey: asNullableString(pickValue(value, "storageKey", "storage_key")),
    downloadUrl: asNullableString(pickValue(value, "downloadUrl", "download_url")),
    callbackUrl: asNullableString(pickValue(value, "callbackUrl", "callback_url")),
    webhookSentAt: asNullableString(pickValue(value, "webhookSentAt", "webhook_sent_at")),
    expiresAt: asNullableString(pickValue(value, "expiresAt", "expires_at")),
    createdAt: asString(pickValue(value, "createdAt", "created_at")),
    apiKeyName: asNullableString(pickValue(value, "apiKeyName", "api_key_name")),
    apiKey: parseApiKey(pickValue(value, "apiKey", "api_key")),
  };
}

function parseUsageRows(input: unknown): UsageItem[] {
  if (!Array.isArray(input)) return [];
  return input.map(parseUsageItem).filter((item): item is UsageItem => item !== null);
}

export async function getUsage(params: UsageListParams): Promise<UsageListResult> {
  const page = typeof params.page === "number" && params.page > 0 ? params.page : 1;
  const pageSize = typeof params.pageSize === "number" && params.pageSize > 0 ? params.pageSize : 10;

  const query: Record<string, string | number> = {
    userId: params.userId,
    page,
    pageSize,
  };

  if (params.status) query.status = params.status;
  if (params.month) query.month = params.month;
  if (params.browser) query.browser = params.browser;
  if (params.filter) query.filter = params.filter;

  const response = await api.get<UsageListApiResponse>("/usage", { params: query });
  const payload = response.data;

  const dataContainer = isRecord(payload?.data) ? payload.data : payload;
  const rowsSource = isRecord(dataContainer) ? pickValue(dataContainer, "rows") : pickValue(payload ?? {}, "rows");
  const totalSource = isRecord(dataContainer) ? pickValue(dataContainer, "total") : pickValue(payload ?? {}, "total");
  const pageSource = isRecord(dataContainer) ? pickValue(dataContainer, "page") : pickValue(payload ?? {}, "page");
  const pageSizeSource = isRecord(dataContainer)
    ? pickValue(dataContainer, "pageSize", "page_size")
    : pickValue(payload ?? {}, "pageSize", "page_size");

  const rows = parseUsageRows(rowsSource);
  const total = typeof totalSource === "number" && Number.isFinite(totalSource) ? totalSource : rows.length;
  const resolvedPage = typeof pageSource === "number" && Number.isFinite(pageSource) ? pageSource : page;
  const resolvedPageSize =
    typeof pageSizeSource === "number" && Number.isFinite(pageSizeSource) ? pageSizeSource : pageSize;

  return {
    rows,
    total,
    page: resolvedPage,
    pageSize: resolvedPageSize,
  };
}

export async function getUsageById(id: string): Promise<UsageItem | null> {
  if (!id) return null;

  const response = await api.get<UsageDetailsApiResponse>(`/usage/${id}`);
  const payload = response.data;

  const dataContainer = isRecord(payload?.data) ? payload.data : payload;
  const detailsSource = isRecord(dataContainer)
    ? (pickValue(dataContainer, "usage") ?? dataContainer)
    : (pickValue(payload ?? {}, "usage") ?? payload);

  return parseUsageItem(detailsSource);
}
