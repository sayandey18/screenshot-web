import { formatDistanceToNow } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { browsers, statuses } from "../data/data";
import { type Usage } from "../data/schema";
import { UsageRowActions } from "./usage-row-actions";

function formatDuration(durationMs: number | null) {
  if (durationMs == null) return "-";
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function statusBadgeClass(status: Usage["status"]) {
  if (status === "success") return "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400";
  if (status === "error") return "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400";
  if (status === "limit_exceeded") return "border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-400";
  return "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
}

type UsageColumnsOptions = {
  onView: (row: Usage) => void;
};

export function getUsageColumns({ onView }: UsageColumnsOptions): ColumnDef<Usage>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      meta: {
        className: cn("inset-s-0 z-10 w-8 rounded-tl-[inherit] max-md:sticky"),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "url",
      header: ({ column }) => <DataTableColumnHeader column={column} title="URL" />,
      cell: ({ row }) => <div className="max-w-[40ch] truncate">{row.original.url}</div>,
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-2/5" },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      meta: { className: "ps-1 w-30", tdClassName: "ps-4" },
      cell: ({ row }) => {
        const status = statuses.find((item) => item.value === row.getValue("status"));
        if (!status) {
          return null;
        }

        return (
          <Badge variant="outline" className={cn(statusBadgeClass(row.original.status))}>
            {status.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "browser",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Browser" />,
      meta: { className: "w-24" },
      cell: ({ row }) => {
        const browser = browsers.find((item) => item.value === row.original.browser);
        return <span>{browser?.label ?? row.original.browser}</span>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "format",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Format" />,
      meta: { className: "ps-1 w-24", tdClassName: "ps-3" },
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="uppercase">
            {row.original.format}
          </Badge>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "durationMs",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
      meta: { className: "w-24" },
      cell: ({ row }) => <span>{formatDuration(row.original.durationMs)}</span>,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      meta: { className: "w-34" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => <UsageRowActions row={row} onView={onView} />,
      enableSorting: false,
      enableHiding: false,
      meta: {
        className: "w-14",
        thClassName: "text-right",
        tdClassName: "text-right",
      },
    },
  ];
}
