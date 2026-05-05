import { AlertOctagon, CheckCircle2, CircleDashed, CircleX } from "lucide-react";

export const statuses = [
  {
    label: "Success",
    value: "success" as const,
    icon: CheckCircle2,
  },
  {
    label: "Error",
    value: "error" as const,
    icon: CircleX,
  },
  {
    label: "Pending",
    value: "pending" as const,
    icon: CircleDashed,
  },
  {
    label: "Limit Exceeded",
    value: "limit_exceeded" as const,
    icon: AlertOctagon,
  },
];

export const browsers = [
  {
    label: "Chrome",
    value: "chrome" as const,
  },
  {
    label: "Firefox",
    value: "firefox" as const,
  },
  {
    label: "Safari",
    value: "safari" as const,
  },
];

export const ranges = [
  {
    label: "All",
    value: "all" as const,
  },
  {
    label: "Today",
    value: "today" as const,
  },
  {
    label: "Last 7 days",
    value: "7d" as const,
  },
  {
    label: "Last 14 days",
    value: "14d" as const,
  },
];
