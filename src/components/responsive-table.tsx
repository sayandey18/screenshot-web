import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
};

type ResponsiveTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
};

export function ResponsiveTable<T>({ columns, data, keyExtractor }: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No results.</p>;
  }

  const visibleColumns = columns.filter((col) => !col.hideOnMobile);

  return (
    <>
      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div key={keyExtractor(row)} className="rounded-lg border bg-card p-4 text-sm shadow-sm">
            {visibleColumns.map((col) => (
              <div
                key={col.key}
                className={cn(
                  "flex items-center justify-between gap-2 py-1.5",
                  "first:border-0 first:pt-0 last:pb-0",
                  "border-t border-border/50"
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">{col.header}</span>
                <span className="text-right font-medium">{col.cell(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={keyExtractor(row)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
