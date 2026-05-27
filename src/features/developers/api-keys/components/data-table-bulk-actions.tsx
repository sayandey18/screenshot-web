import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import { type ApiKeyItem } from "../data/schema";
import { ApiKeysMultiDeleteDialog } from "./api-keys-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
  onBulkDelete: (rows: ApiKeyItem[]) => Promise<void>;
};

export function DataTableBulkActions<TData>({ table, onBulkDelete }: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkExport = () => {
    const selectedKeys = selectedRows.map((row) => row.original as ApiKeyItem);

    if (selectedKeys.length === 0) return;

    const escapeCsv = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const headers = ["id", "name", "prefix", "start", "status", "expiresAt", "createdAt", "updatedAt"];
    const rows = selectedKeys.map((key) => {
      const isExpired = !!key.expiresAt && key.expiresAt.getTime() < Date.now();
      const status = isExpired ? "expired" : key.enabled === false ? "disabled" : "active";

      return [
        key.id,
        key.name ?? "",
        key.prefix ?? "",
        key.start ?? "",
        status,
        key.expiresAt ? key.expiresAt.toISOString() : "",
        key.createdAt.toISOString(),
        key.updatedAt.toISOString(),
      ].map((cell) => escapeCsv(cell));
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `api-keys-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedKeys.length} API key${selectedKeys.length > 1 ? "s" : ""} to CSV.`);
  };

  return (
    <>
      <BulkActionsToolbar table={table} entityName="api key">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBulkExport}
              className="size-8"
              aria-label="Export selected API keys"
              title="Export selected API keys"
            >
              <Download />
              <span className="sr-only">Export selected API keys</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export selected API keys</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected API keys"
              title="Delete selected API keys"
            >
              <Trash2 />
              <span className="sr-only">Delete selected API keys</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected API keys</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ApiKeysMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onDeleted={async (selectedKeys) => {
          if (selectedKeys.length === 0) return;
          await onBulkDelete(selectedKeys);
        }}
      />
    </>
  );
}
