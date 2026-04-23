import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table";
import { formatDuration, formatRelativeTime, truncateUrl } from "../data/helpers";
import { type UsageItem } from "../data/queries";

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

export const usageColumns: ColumnDef<UsageItem>[] = [
  {
    accessorKey: "url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="URL" />,
    cell: ({ row }) => (
      <div className="max-w-70 truncate font-medium whitespace-nowrap" title={row.original.url}>
        {truncateUrl(row.original.url, 40)}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant="outline" className={getStatusBadgeClassName(String(row.original.status))}>
        {getStatusLabel(String(row.original.status))}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "format",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Format" />,
    cell: ({ row }) => <Badge variant="outline">{String(row.original.format).toUpperCase()}</Badge>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "browser",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Browser" />,
    cell: () => null,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "durationMs",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => <span className="text-muted-foreground">{formatDuration(Number(row.original.durationMs))}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => <span className="text-muted-foreground">{formatRelativeTime(row.original.createdAt)}</span>,
    enableSorting: false,
    enableHiding: false,
  },
];
