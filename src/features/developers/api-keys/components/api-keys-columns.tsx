import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { type ApiKeyItem } from "../data/schema";
import { DataTableRowActions } from "./data-table-row-actions";

type ApiKeysColumnsOptions = {
  onManage: (row: ApiKeyItem) => void;
  onToggleStatus: (row: ApiKeyItem) => void;
  onDelete: (row: ApiKeyItem) => void;
};

export function getApiKeysColumns(options: ApiKeysColumnsOptions): ColumnDef<ApiKeyItem>[] {
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
        className: cn("max-md:sticky inset-s-0 z-10 rounded-tl-[inherit]"),
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
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const value = row.getValue("name");
        const name = typeof value === "string" && value.trim() !== "" ? value : "Untitled";
        return <LongText className="w-48">{name}</LongText>;
      },
      meta: {
        className: "w-48 md:w-80 ps-0.5",
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "prefix",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Preview" />,
      cell: ({ row }) => {
        const start = row.original.start ? row.original.start : "Not available";
        return <span className="font-mono text-xs">{start}</span>;
      },
      enableSorting: false,
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorFn: (row) => {
        if (!row.enabled) return "disabled";
        if (!row.expiresAt) return "active";
        return row?.expiresAt.getTime() < Date.now() ? "expired" : "active";
      },
      cell: ({ row }) => {
        const raw = row.getValue("status");
        const status = typeof raw === "string" ? raw : "active";

        if (status === "expired") {
          return (
            <Badge variant="outline" className="border-destructive/30 text-destructive">
              Expired
            </Badge>
          );
        }

        if (status === "disabled") {
          return (
            <Badge variant="outline" className="border-neutral-300 bg-neutral-300/40">
              Disabled
            </Badge>
          );
        }

        if (status === "no-expiry") {
          return (
            <Badge variant="outline" className="border-sky-300 bg-sky-200/40 text-sky-900 dark:text-sky-100">
              No expiry
            </Badge>
          );
        }

        return (
          <Badge variant="outline" className="border-teal-200 bg-teal-100/30 text-teal-900 dark:text-teal-200">
            Active
          </Badge>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
      cell: ({ row }) => {
        if (!row.original.expiresAt) return <span className="text-muted-foreground">Never</span>;
        return <span className="ps-3">{format(row.original.expiresAt, "MMM d, yyyy")}</span>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onManage={options.onManage}
          onToggleStatus={options.onToggleStatus}
          onDelete={options.onDelete}
        />
      ),
    },
  ];
}
