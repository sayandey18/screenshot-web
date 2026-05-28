import { format } from "date-fns";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { apiKeyStatusBadgeClass } from "@/lib/badge-styles";
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
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const value = row.getValue("name");
        const name = typeof value === "string" && value.trim() !== "" ? value : "Untitled";
        return <LongText className="w-42">{name}</LongText>;
      },
      meta: {
        className: "w-42 md:w-65 ps-0.5",
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "prefix",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Preview" />,
      cell: ({ row }) => {
        const start = row.original.start ? row.original.start : "Not available";
        return <span className="text-sm">{start}</span>;
      },
      enableSorting: false,
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorFn: (row) => {
        if (!row.enabled) return "inactive";
        if (!row.expiresAt) return "active";
        return row?.expiresAt.getTime() < Date.now() ? "expired" : "active";
      },
      cell: ({ row }) => {
        const raw = row.getValue("status");
        const status = typeof raw === "string" ? raw : "active";

        return (
          <Badge variant="outline" className={cn(apiKeyStatusBadgeClass(status))}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );

        // if (status === "expired") {
        //   return (
        //     <Badge variant="outline" className">
        //       Expired
        //     </Badge>
        //   );
        // }

        // if (status === "inactive") {
        //   return (
        //     <Badge variant="outline" className="border-neutral-300 bg-neutral-300/40">
        //       Disabled
        //     </Badge>
        //   );
        // }

        // if (status === "no-expiry") {
        //   return (
        //     <Badge variant="outline" className="border-sky-300 bg-sky-200/40 text-sky-900 dark:text-sky-100">
        //       No expiry
        //     </Badge>
        //   );
        // }

        // return (
        //   <Badge variant="outline" className="border-teal-200 bg-teal-100/30 text-teal-900 dark:text-teal-200">
        //     Active
        //   </Badge>
        // );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => {
        return <span className="text-muted-foreground">{format(row.original.createdAt, "MMM d, yyyy")}</span>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
      cell: ({ row }) => {
        if (!row.original.expiresAt) return <span className="text-muted-foreground">Never</span>;
        return <span className="text-muted-foreground">{format(row.original.expiresAt, "MMM d, yyyy")}</span>;
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
