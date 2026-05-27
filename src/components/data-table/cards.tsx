import { type RowData, type Table, flexRender } from "@tanstack/react-table";

type DataTableCardsProps<TData extends RowData> = {
  table: Table<TData>;
  excludeColumns?: string[];
};

export function DataTableCards<TData extends RowData>({
  table,
  excludeColumns = ["select", "actions"],
}: DataTableCardsProps<TData>) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) return null;

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => {
        const cells = row.getVisibleCells().filter((cell) => !excludeColumns.includes(cell.column.id));

        return (
          <div key={row.id} className="rounded-lg border bg-card p-4 shadow-sm">
            {cells.map((cell) => {
              const header = cell.column.columnDef.header;
              const label = typeof header === "string" ? header : cell.column.id;

              return (
                <div
                  key={cell.id}
                  className="flex items-center justify-between gap-2 border-t border-border/50 px-0 py-2 first:border-0 first:pt-0 last:pb-0"
                >
                  <span className="text-xs font-medium text-muted-foreground capitalize">{label}</span>
                  <span className="text-right text-sm font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
