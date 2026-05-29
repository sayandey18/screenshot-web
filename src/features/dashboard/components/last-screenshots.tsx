import { Link2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatBadgeClass, screenshotStatusBadgeClass } from "@/lib/badge-styles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentScreenshots } from "../hooks/use-dashboard";

export function LastScreenshots() {
  const { data, isLoading } = useRecentScreenshots();
  const screenshots = data?.requests ?? [];

  if (isLoading) {
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
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className={cn("col-span-4 grid grid-cols-subgrid items-center gap-4 px-4 py-3", i !== 4 && "border-b")}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="ml-auto h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Screenshots</CardTitle>
        <CardDescription>Detailed log of the last 5 screenshot jobs processed by your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {screenshots.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No screenshots yet
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <div className="grid min-w-135 grid-cols-[1fr_auto_auto_auto]">
              <div className="col-span-4 grid grid-cols-subgrid items-center gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <span>Target Address</span>
                <span>Format</span>
                <span>Status</span>
                <span className="text-right">Processed</span>
              </div>
              {screenshots.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    "col-span-4 grid grid-cols-subgrid items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
                    i !== screenshots.length - 1 && "border-b"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="truncate text-sm font-medium">{s.urlDisplay}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("px-2.5 font-medium uppercase", formatBadgeClass[s.format.toUpperCase()])}
                  >
                    {s.format}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("px-2.5 font-medium capitalize", screenshotStatusBadgeClass(s.status))}
                  >
                    {s.status}
                  </Badge>
                  <span className="text-right text-sm whitespace-nowrap text-muted-foreground">
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
