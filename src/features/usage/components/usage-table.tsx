import { useCallback, useEffect, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useTableUrlState } from "@/hooks/use-table-url-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableCards, DataTablePagination, DataTableToolbar } from "@/components/data-table";
import { browsers, statuses } from "../data/data";
import { type Usage } from "../data/schema";
import { DataTableBulkActions } from "./data-table-bulk-actions";
import { getUsageColumns } from "./usage-columns";
import { useUsage } from "./usage-provider";

const route = getRouteApi("/_authenticated/usage/");

type DataTableProps = {
  data: Usage[];
  totalPages: number;
  total: number;
  isLoading: boolean;
  isFetching: boolean;
};

export function UsageTable({ data, totalPages, total, isLoading, isFetching }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const { setCurrentRow, setOpen } = useUsage();

  const handleView = useCallback(
    (row: Usage) => {
      setCurrentRow(row);
      setOpen("details");
    },
    [setCurrentRow, setOpen]
  );

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: "filter" },
    columnFilters: [
      { columnId: "status", searchKey: "status", type: "array" },
      { columnId: "browser", searchKey: "browser", type: "array" },
    ],
  });

  const columns = useMemo(() => getUsageColumns({ onView: handleView }), [handleView]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.max(1, totalPages),
    manualPagination: true,
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const url = String(row.getValue("url")).toLowerCase();
      const searchValue = String(filterValue).toLowerCase();
      return url.includes(searchValue);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  });

  useEffect(() => {
    ensurePageInRange(totalPages);
  }, [totalPages, ensurePageInRange]);

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        "flex flex-1 flex-col gap-4",
        isFetching && "opacity-60 transition-opacity"
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder="Filter by URL..."
        filters={[
          {
            columnId: "status",
            title: "Status",
            options: statuses,
          },
          {
            columnId: "browser",
            title: "Browser",
            options: browsers,
          },
        ]}
      />
      <DataTableCards table={table} excludeColumns={["select"]} />
      <div className="hidden overflow-hidden rounded-md border md:block">
        <Table className="min-w-xl">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "bg-muted/40 px-4 py-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase",
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_, j) => (
                    <TableCell key={`skeleton-cell-${j}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4 py-3",
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {total > pagination.pageSize ? <DataTablePagination table={table} className="mt-auto" /> : null}
      <DataTableBulkActions table={table} />
    </div>
  );
}
