import { type Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import { type Usage } from "../data/schema";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkExport = () => {
    const selectedLogs = selectedRows.map((row) => row.original as Usage);
    if (selectedLogs.length === 0) return;

    const headers = [
      "id",
      "url",
      "status",
      "browser",
      "format",
      "durationMs",
      "createdAt",
      "apiKeyName",
      "downloadUrl",
    ];

    const rows = selectedLogs.map((log) =>
      [
        log.id,
        log.url,
        log.status,
        log.browser,
        log.format,
        String(log.durationMs),
        log.createdAt.toISOString(),
        log.apiKeyName,
        log.downloadUrl ?? "",
      ].map((cell) => escapeCsv(cell))
    );

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `usage-logs-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedLogs.length} usage log${selectedLogs.length > 1 ? "s" : ""} to CSV.`);
  };

  return (
    <BulkActionsToolbar table={table} entityName="usage log">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleBulkExport}
            className="size-8"
            aria-label="Export selected usage logs"
            title="Export selected usage logs"
          >
            <Download />
            <span className="sr-only">Export selected usage logs</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export selected usage logs</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  );
}
