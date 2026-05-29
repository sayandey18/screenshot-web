import { Link2 } from "lucide-react";
import { formatBadgeClass, screenshotStatusBadgeClass } from "@/lib/badge-styles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const recentScreenshots = [
  {
    url: "https://example.com",
    format: "PNG" as const,
    status: "success" as const,
    time: "2 minutes ago",
  },
  {
    url: "https://dashboard.example.com",
    format: "WebP" as const,
    status: "success" as const,
    time: "10 minutes ago",
  },
  {
    url: "https://pricing.example.com",
    format: "JPEG" as const,
    status: "failed" as const,
    time: "1 hour ago",
  },
  {
    url: "https://blog.example.com",
    format: "PNG" as const,
    status: "success" as const,
    time: "3 hours ago",
  },
  {
    url: "https://settings.example.com",
    format: "PDF" as const,
    status: "success" as const,
    time: "Yesterday",
  },
];

export function LastScreenshots() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Screenshots</CardTitle>
        <CardDescription>Detailed log of the last 5 screenshot jobs processed by your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="overflow-x-auto rounded-lg border">
          <div className="grid min-w-135 grid-cols-[1fr_auto_auto_auto]">
            <div className="col-span-4 grid grid-cols-subgrid items-center gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <span>Target Address</span>
              <span>Format</span>
              <span>Status</span>
              <span className="text-right">Processed</span>
            </div>
            {recentScreenshots.map((s, i) => (
              <div
                key={s.url}
                className={cn(
                  "col-span-4 grid grid-cols-subgrid items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
                  i !== recentScreenshots.length - 1 && "border-b"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="truncate text-sm font-medium">{s.url}</span>
                </div>
                <Badge variant="outline" className={cn("px-2.5 font-medium uppercase", formatBadgeClass[s.format])}>
                  {s.format}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("px-2.5 font-medium capitalize", screenshotStatusBadgeClass(s.status))}
                >
                  {s.status}
                </Badge>
                <span className="text-right text-sm whitespace-nowrap text-muted-foreground">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
