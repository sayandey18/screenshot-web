import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { statuses } from "../data/data";
import { type Usage } from "../data/schema";

type UsageDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: Usage | null;
};

function formatDuration(durationMs: number) {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function statusBadgeClass(status: Usage["status"]) {
  if (status === "success") return "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400";
  if (status === "failed") return "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400";
  return "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
}

function DateOrFallback({ date, fallback }: { date: Date | null; fallback: string }) {
  if (!date) return <>{fallback}</>;
  return <>{format(date, "MMM d, yyyy h:mm:ss a")}</>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[140px_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <div className="break-all">{value}</div>
    </div>
  );
}

export function UsageDetailsDialog({ open, onOpenChange, row }: UsageDetailsDialogProps) {
  const statusLabel = statuses.find((status) => status.value === row?.status)?.label ?? "Pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>Read-only screenshot request log metadata.</DialogDescription>
        </DialogHeader>

        {!row ? (
          <div className="py-8 text-center text-muted-foreground">No usage log selected.</div>
        ) : (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pe-1 text-sm">
            <section>
              <h3 className="mb-1 font-semibold">Request Info</h3>
              <Row label="URL" value={row.url} />
              <Row label="Browser" value={row.browser} />
              <Row label="Format" value={row.format.toUpperCase()} />
              <Row
                label="Status"
                value={
                  <Badge variant="outline" className={cn(statusBadgeClass(row.status))}>
                    {statusLabel}
                  </Badge>
                }
              />
            </section>

            <section>
              <h3 className="mb-1 font-semibold">Timing</h3>
              <Row label="Duration" value={formatDuration(row.durationMs)} />
              <Row label="Created At" value={<DateOrFallback date={row.createdAt} fallback="-" />} />
              <Row label="Expires At" value={<DateOrFallback date={row.expiresAt} fallback="Never" />} />
            </section>

            <section>
              <h3 className="mb-1 font-semibold">API Key</h3>
              <Row label="API Key" value={row.apiKeyName} />
            </section>

            <section>
              <h3 className="mb-1 font-semibold">Output</h3>
              <Row
                label="Download URL"
                value={
                  row.downloadUrl ? (
                    <a href={row.downloadUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                      Download
                    </a>
                  ) : (
                    "Not available"
                  )
                }
              />
              <Row label="Storage Key" value={row.storageKey ?? "None"} />
            </section>

            <section>
              <h3 className="mb-1 font-semibold">Webhook</h3>
              <Row label="Callback URL" value={row.callbackUrl ?? "Not configured"} />
              <Row label="Webhook Sent At" value={<DateOrFallback date={row.webhookSentAt} fallback="Not sent" />} />
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
