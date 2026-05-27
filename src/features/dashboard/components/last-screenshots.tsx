import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const recentScreenshots = [
  {
    url: "https://example.com",
    format: "PNG" as const,
    status: "Completed" as const,
    time: "2 minutes ago",
  },
  {
    url: "https://dashboard.example.com",
    format: "WebP" as const,
    status: "Completed" as const,
    time: "10 minutes ago",
  },
  {
    url: "https://pricing.example.com",
    format: "JPEG" as const,
    status: "Failed" as const,
    time: "1 hour ago",
  },
  {
    url: "https://blog.example.com",
    format: "PNG" as const,
    status: "Completed" as const,
    time: "3 hours ago",
  },
  {
    url: "https://settings.example.com",
    format: "PDF" as const,
    status: "Completed" as const,
    time: "Yesterday",
  },
];

const formatBadgeClass: Record<string, string> = {
  PNG: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  WebP: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  JPEG: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  PDF: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

export function LastScreenshots() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Screenshots</CardTitle>
        <CardDescription>Detailed log of the last 5 screenshot jobs processed by your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="rounded-lg border grid grid-cols-[1fr_auto_auto_auto]">
          <div className="col-span-4 grid grid-cols-subgrid gap-4 items-center px-4 py-2.5 border-b bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <span>Target Address</span>
            <span>Format</span>
            <span>Status</span>
            <span className="text-right">Processed</span>
          </div>
          {recentScreenshots.map((s, i) => (
            <div
              key={s.url}
              className={cn(
                "col-span-4 grid grid-cols-subgrid gap-4 items-center px-4 py-3 transition-colors hover:bg-muted/30",
                i !== recentScreenshots.length - 1 && "border-b"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium truncate">{s.url}</span>
              </div>
              <Badge variant="outline" className={cn("font-medium px-2.5", formatBadgeClass[s.format])}>
                {s.format}
              </Badge>
              {s.status === "Completed" ? (
                <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium px-2.5">
                  {s.status}
                </Badge>
              ) : (
                <Badge variant="destructive" className="font-medium px-2.5">
                  {s.status}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground text-right whitespace-nowrap">{s.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
