import { useEffect, useMemo, useState } from "react";
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { type NavigateFn, useTableUrlState } from "@/hooks/use-table-url-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table";
import { type ApiKeyItem } from "../data/schema";
import { getApiKeysColumns } from "./api-keys-columns";

type ApiKeysTableProps = {
  data: ApiKeyItem[];
  total: number;
  isLoading: boolean;
  search: Record<string, unknown>;
  navigate: NavigateFn;
  onManage: (row: ApiKeyItem) => void;
  onToggleStatus: (row: ApiKeyItem) => void;
  onDelete: (row: ApiKeyItem) => void;
};

export function ApiKeysTable({
  data,
  total,
  isLoading,
  search,
  navigate,
  onManage,
  onToggleStatus,
  onDelete,
}: ApiKeysTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const { globalFilter, onGlobalFilterChange, pagination, onPaginationChange, ensurePageInRange } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: "filter" },
    columnFilters: [],
  });

  const columns = useMemo(
    () => getApiKeysColumns({ onManage, onToggleStatus, onDelete }),
    [onManage, onToggleStatus, onDelete]
  );

  const filteredData = useMemo(() => {
    const filterValue = typeof globalFilter === "string" ? globalFilter.trim().toLowerCase() : "";
    if (!filterValue) return data;

    return data.filter((item) => {
      const id = item.id.toLowerCase();
      const name = (item.name ? item.name : "").toLowerCase();
      const start = (item.start ? item.start : "").toLowerCase();
      return id.includes(filterValue) || name.includes(filterValue) || start.includes(filterValue);
    });
  }, [data, globalFilter]);

  const pageCount = Math.max(1, Math.ceil(total / 10));

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
      globalFilter,
    },
    manualPagination: true,
    pageCount,
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange({ ...next, pageSize: 10 });
    },
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    ensurePageInRange(pageCount);
  }, [pageCount, ensurePageInRange]);

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        "flex flex-1 flex-col gap-4"
      )}
    >
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(header.column.columnDef.meta?.className, header.column.columnDef.meta?.thClassName)}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading API keys...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No API keys found.
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
