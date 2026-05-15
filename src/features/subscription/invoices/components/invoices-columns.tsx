import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import type { Invoice, InvoiceStatus } from "../../data/schema";

type InvoicesColumnsOptions = {
  onDownload: (row: Invoice) => void;
};

const statusBadgeClassMap: Record<InvoiceStatus, string> = {
  succeeded: "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400",
  processing: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  failed: "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400",
  cancelled: "border-gray-600/30 bg-gray-500/10 text-gray-700 dark:text-gray-400",
  refunded: "border-gray-600/30 bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

const statusLabelMap: Record<InvoiceStatus, string> = {
  succeeded: "Succeeded",
  processing: "Processing",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function getInvoicesColumns({ onDownload }: InvoicesColumnsOptions): ColumnDef<Invoice>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all invoices"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select invoice"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
      cell: ({ row }) => {
        const id = row.original.id.replace("inv_", "");
        const shortID = id.slice(-6).toLocaleUpperCase();
        return <div className="font-medium">{`INV_${shortID}`}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "issuedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => {
        const value = row.getValue("issuedAt");
        const date = typeof value === "string" ? new Date(value) : null;
        return <div>{date ? format(date, "yyyy-MM-dd") : "-"}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "plan",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subscription" />,
      cell: ({ row }) => {
        const plan = row.original.plan;
        return <div>{plan}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => {
        const amount = row.original.amount;
        const currency = row.original.currency;
        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);

        return <div>{formattedAmount}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className={cn("capitalize", statusBadgeClassMap[status])}>
            {statusLabelMap[status]}
          </Badge>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "download",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Download invoice ${row.original.id}`}
            onClick={() => onDownload(row.original)}
          >
            <Download className="size-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        className: "w-20",
        thClassName: "text-right",
        tdClassName: "text-right",
      },
    },
  ];
}
