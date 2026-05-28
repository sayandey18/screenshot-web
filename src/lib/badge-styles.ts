const pattern = {
  green: "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400",
  red: "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400",
  orange: "border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  amber: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  blue: "border-blue-600/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  gray: "border-gray-600/30 bg-gray-500/10 text-gray-700 dark:text-gray-400",
  sky: "border-sky-600/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  teal: "border-teal-600/30 bg-teal-500/10 text-teal-700 dark:text-teal-400",
  rose: "border-rose-600/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export function usageStatusBadgeClass(status: string) {
  if (status === "success") return pattern.green;
  if (status === "error") return pattern.red;
  if (status === "limit_exceeded") return pattern.orange;
  return pattern.amber;
}

export function apiKeyStatusBadgeClass(status: string) {
  if (status === "active") return pattern.green;
  if (status === "inactive") return pattern.red;
  if (status === "expired") return pattern.orange;
  return pattern.amber;
}

export function invoiceStatusBadgeClass(status: string) {
  if (status === "succeeded") return pattern.green;
  if (status === "processing") return pattern.amber;
  if (status === "failed") return pattern.red;
  return pattern.gray;
}

export function screenshotStatusBadgeClass(status: string) {
  if (status === "Completed") return pattern.green;
  if (status === "Failed") return pattern.red;
  return pattern.amber;
}

export function subscriptionStatusBadgeClass(status: string) {
  if (status === "active") return pattern.green;
  if (status === "trial") return pattern.blue;
  if (status === "cancelled") return pattern.red;
  if (status === "cancellation_scheduled") return pattern.amber;
  return pattern.gray;
}

export const formatBadgeClass: Record<string, string> = {
  PNG: pattern.sky,
  WebP: pattern.teal,
  JPEG: pattern.orange,
  PDF: pattern.rose,
};
