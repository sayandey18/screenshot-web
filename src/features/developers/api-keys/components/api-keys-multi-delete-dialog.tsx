"use client";

import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { type ApiKeyItem } from "../data/schema";

type ApiKeysMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  onDeleted?: (rows: ApiKeyItem[]) => Promise<void> | void;
};

const CONFIRM_WORD = "DELETE";

export function ApiKeysMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onDeleted,
}: ApiKeysMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedKeys = selectedRows.map((row) => row.original as ApiKeyItem);

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    setIsDeleting(true);

    try {
      if (selectedKeys.length === 0) return;

      await onDeleted?.(selectedKeys);

      toast.success(`Deleted ${selectedKeys.length} API key${selectedKeys.length > 1 ? "s" : ""}.`);

      onOpenChange(false);
      setValue("");
      table.resetRowSelection();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete selected API keys.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setValue("");
      }}
      isLoading={isDeleting}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || selectedKeys.length === 0}
      title={
        <span className="text-destructive">
          <AlertTriangle className="me-1 inline-block stroke-destructive" size={18} /> Delete {selectedKeys.length} API
          key{selectedKeys.length > 1 ? "s" : ""}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected API keys?
            <br />
            This action cannot be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  );
}
