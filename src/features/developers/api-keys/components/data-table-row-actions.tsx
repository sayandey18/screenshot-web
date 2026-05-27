import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type Row } from "@tanstack/react-table";
import { Ban, CircleArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ApiKeyItem } from "../data/schema";

type DataTableRowActionsProps = {
  row: Row<ApiKeyItem>;
  onManage: (row: ApiKeyItem) => void;
  onToggleStatus: (row: ApiKeyItem) => void;
  onDelete: (row: ApiKeyItem) => void;
};

export function DataTableRowActions({ row, onManage, onToggleStatus, onDelete }: DataTableRowActionsProps) {
  const isExpired = row.getValue("status") === "expired";
  const isDisabled = row.original.enabled === false;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onManage(row.original)}>
          Manage
          <DropdownMenuShortcut>
            <Pencil size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {!isExpired ? (
          <>
            <DropdownMenuItem onClick={() => onToggleStatus(row.original)}>
              {isDisabled ? "Enable" : "Disable"}
              <DropdownMenuShortcut>
                {isDisabled ? <CircleArrowUp size={16} /> : <Ban size={16} />}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-500!">
          Delete
          <DropdownMenuShortcut>
            <Trash2 className="text-red-500!" size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
