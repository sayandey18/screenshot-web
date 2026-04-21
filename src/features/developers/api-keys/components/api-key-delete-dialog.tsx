import { AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { type ApiKeyItem } from "../data/schema";

type ApiKeyDeleteDialogProps = {
  currentRow: ApiKeyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
};

export function ApiKeyDeleteDialog({
  currentRow,
  open,
  onOpenChange,
  onDelete,
  isLoading = false,
}: ApiKeyDeleteDialogProps) {
  const handleConfirm = async () => {
    if (!currentRow) return;
    await onDelete(currentRow.id);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      handleConfirm={handleConfirm}
      title={
        <span className="text-destructive">
          <AlertTriangle className="me-1 inline-block stroke-destructive" size={18} /> Delete API Key
        </span>
      }
      desc={
        <>
          You are about to delete this API key <strong>{currentRow?.name}</strong>. <br />
          This action cannot be undone.
        </>
      }
      confirmText="Delete"
      destructive
    />
  );
}
