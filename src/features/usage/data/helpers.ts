import { format, formatDistanceToNowStrict } from "date-fns";

export function formatDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs < 0) return "0ms";
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`;

  const seconds = durationMs / 1000;
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds)}s`;
}

export function formatRelativeTime(value: Date | string | null | undefined): string {
  if (!value) return "Unknown";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy 'at' h:mm:ss a");
}

export function truncateUrl(url: string, maxLength = 40): string {
  if (!url) return "";
  if (url.length <= maxLength) return url;
  return `${url.slice(0, Math.max(0, maxLength - 1))}…`;
}
