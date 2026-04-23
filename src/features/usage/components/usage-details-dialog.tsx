import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, formatDuration } from "../data/helpers";
import { getUsageById } from "../data/queries";

type UsageDetailsDialogProps = {
  usageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

function getStatusBadgeClassName(status: string): string {
  switch (status) {
    case "success":
      return "border-teal-200 bg-teal-100/30 text-teal-900 dark:text-teal-200";
    case "failed":
      return "border-destructive/30 text-destructive";
    case "pending":
      return "border-amber-200 bg-amber-100/40 text-amber-900 dark:text-amber-200";
    default:
      return "";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "success":
      return "Success";
    case "failed":
      return "Failed";
    case "pending":
      return "Pending";
    default:
      return status || "Unknown";
  }
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0 break-all">{value}</div>
    </div>
  );
}

export function UsageDetailsDialog({ usageId, open, onOpenChange }: UsageDetailsDialogProps) {
  const detailsQuery = useQuery({
    queryKey: ["usage", "details", usageId],
    queryFn: () => (usageId ? getUsageById(usageId) : Promise.resolve(null)),
    enabled: open && Boolean(usageId),
  });

  const data = detailsQuery.data;
  const title = useMemo(() => "Log Details", []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="text-start">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Complete request and output metadata for this usage log entry.</DialogDescription>
        </DialogHeader>

        {detailsQuery.isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading details...</div>
        ) : !data ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Log details are not available.</div>
        ) : (
          <div className="max-h-[70vh] space-y-5 overflow-auto pe-1">
            <section className="space-y-3 rounded-md border p-4">
              <h4 className="text-sm font-semibold">Request</h4>
              <DetailRow
                label="URL"
                value={
                  <div className="overflow-x-auto whitespace-nowrap">
                    <span>{data.url}</span>
                  </div>
                }
              />
              <DetailRow label="Browser" value={String(data.browser || "—")} />
              <DetailRow label="Format" value={String(data.format || "—").toUpperCase()} />
              <DetailRow
                label="Status"
                value={
                  <Badge variant="outline" className={getStatusBadgeClassName(String(data.status || ""))}>
                    {getStatusLabel(String(data.status || ""))}
                  </Badge>
                }
              />
            </section>

            <section className="space-y-3 rounded-md border p-4">
              <h4 className="text-sm font-semibold">Performance</h4>
              <DetailRow label="Duration" value={formatDuration(Number(data.durationMs || 0))} />
              <DetailRow label="Created At" value={formatDateTime(data.createdAt)} />
              <DetailRow label="Expires At" value={data.expiresAt ? formatDateTime(data.expiresAt) : "Never"} />
            </section>

            <section className="space-y-3 rounded-md border p-4">
              <h4 className="text-sm font-semibold">API Key</h4>
              <DetailRow
                label="API Key name"
                value={
                  data.apiKey && typeof data.apiKey.name === "string" && data.apiKey.name.trim() !== ""
                    ? data.apiKey.name
                    : typeof data.apiKeyName === "string" && data.apiKeyName.trim() !== ""
                      ? data.apiKeyName
                      : data.apiKeyId || "Unknown"
                }
              />
            </section>

            <section className="space-y-3 rounded-md border p-4">
              <h4 className="text-sm font-semibold">Output</h4>
              <DetailRow
                label="Download URL"
                value={
                  data.downloadUrl ? (
                    <Button asChild variant="outline" size="sm" className="h-8">
                      <a href={data.downloadUrl} target="_blank" rel="noreferrer">
                        Download
                        <ExternalLink className="ms-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    "Not available"
                  )
                }
              />
              <DetailRow label="Storage Key" value={data.storageKey || "None"} />
            </section>

            <section className="space-y-3 rounded-md border p-4">
              <h4 className="text-sm font-semibold">Webhook</h4>
              <DetailRow label="Callback URL" value={data.callbackUrl || "Not configured"} />
              <DetailRow
                label="Webhook Sent At"
                value={data.webhookSentAt ? formatDateTime(data.webhookSentAt) : "Not sent"}
              />
            </section>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
