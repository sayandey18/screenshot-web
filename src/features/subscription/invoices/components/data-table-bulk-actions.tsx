import { type Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import { type Invoice } from "../data/invoices";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildInvoicesCsv(rows: Invoice[]): string {
  const headers = ["Date", "Plan", "Amount", "Status"];
  const csvRows = rows.map((invoice) => {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(invoice.amount);

    return [
      escapeCsvCell(invoice.issuedAt),
      escapeCsvCell(invoice.plan.toUpperCase()),
      escapeCsvCell(amount),
      escapeCsvCell(invoice.status),
    ].join(",");
  });

  return [headers.join(","), ...csvRows].join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkExportCsv = () => {
    const selectedInvoices = selectedRows.map((row) => row.original as Invoice);
    if (selectedInvoices.length === 0) return;

    const csv = buildInvoicesCsv(selectedInvoices);
    const now = new Date().toISOString().slice(0, 10);
    downloadCsv(`invoices-${now}.csv`, csv);

    toast.success(`Exported ${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? "s" : ""} to CSV.`);
    table.resetRowSelection();
  };

  return (
    <BulkActionsToolbar table={table} entityName="invoice">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleBulkExportCsv}
            className="size-8"
            aria-label="Export selected invoices to CSV"
            title="Export selected invoices to CSV"
          >
            <Download />
            <span className="sr-only">Export selected invoices to CSV</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export selected invoices to CSV</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  );
}
