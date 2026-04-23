import { useEffect, useMemo, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useTableUrlState, type NavigateFn } from "@/hooks/use-table-url-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination, DataTableToolbar } from "@/components/data-table";
import { type UsageItem } from "../data/queries";
import { usageColumns as columns } from "./usage-columns";
import { UsageRowActions } from "./usage-row-actions";

type UsageTableProps = {
  data: UsageItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onOpenDetails: (id: string) => void;
};

const statusOptions = [
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Pending", value: "pending" },
];

const browserOptions = [
  { label: "Chromium", value: "chromium" },
  { label: "Firefox", value: "firefox" },
  { label: "WebKit", value: "webkit" },
];

function toMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getRecentMonths(count = 12): string[] {
  const now = new Date();
  const values: string[] = [];

  for (let i = 0; i < count; i += 1) {
    values.push(toMonthString(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }

  return values;
}

export function UsageTable({
  data,
  total,
  page,
  pageSize,
  isLoading,
  search,
  navigate,
  onOpenDetails,
}: UsageTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ browser: false });
  const [rowSelection, setRowSelection] = useState({});

  const currentMonth = useMemo(() => toMonthString(new Date()), []);
  const month = typeof search.month === "string" ? search.month : currentMonth;
  const monthOptions = useMemo(() => getRecentMonths(12), []);

  const { globalFilter, onGlobalFilterChange, columnFilters, onColumnFiltersChange, pagination, onPaginationChange } =
    useTableUrlState({
      search,
      navigate,
      pagination: { defaultPage: 1, defaultPageSize: 10 },
      globalFilter: { enabled: true, key: "filter" },
      columnFilters: [
        { columnId: "status", searchKey: "status", type: "array" },
        { columnId: "browser", searchKey: "browser", type: "array" },
      ],
    });

  const setMonth = (value: string) => {
    navigate({
      search: (prev) => ({
        ...(prev as Record<string, unknown>),
        page: 1,
        pageSize: 10,
        month: value,
      }),
    });
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / 10)),
    enableRowSelection: false,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange({ ...next, pageSize: 10 });
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    const computedPageCount = Math.max(1, Math.ceil(total / 10));
    if (page > computedPageCount) {
      navigate({
        replace: true,
        search: (prev) => ({
          ...(prev as Record<string, unknown>),
          page: 1,
          pageSize,
        }),
      });
    }
  }, [navigate, page, pageSize, total]);

  return (
    <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', "flex flex-1 flex-col gap-4")}>
      <div className="flex items-center justify-between gap-2">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Filter usage..."
          filters={[
            {
              columnId: "status",
              title: "Status",
              options: statusOptions,
            },
            {
              columnId: "browser",
              title: "Browser",
              options: browserOptions,
            },
          ]}
        />
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          aria-label="Month filter"
        >
          {monthOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers
                  .filter((header) => header.column.id !== "browser")
                  .map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                <TableHead className="w-12 bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted" />
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading usage logs...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group/row cursor-pointer"
                  onClick={() => onOpenDetails(row.original.id)}
                >
                  {row
                    .getVisibleCells()
                    .filter((cell) => cell.column.id !== "browser")
                    .map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  <TableCell
                    className="bg-background text-right group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <UsageRowActions onView={() => onOpenDetails(row.original.id)} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No usage logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {total > 10 ? <DataTablePagination table={table} className="mt-auto" /> : null}
    </div>
  );
}
