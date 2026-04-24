import {
  CheckCircle2,
  CircleDashed,
  CircleX,
} from "lucide-react";

export const statuses = [
  {
    label: "Success",
    value: "success" as const,
    icon: CheckCircle2,
  },
  {
    label: "Failed",
    value: "failed" as const,
    icon: CircleX,
  },
  {
    label: "Pending",
    value: "pending" as const,
    icon: CircleDashed,
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
    label: "WebKit",
    value: "webkit" as const,
  },
];
