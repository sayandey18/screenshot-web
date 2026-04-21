import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ApiKeyItem } from "../data/schema";

type ApiKeyManageDialogProps = {
  currentRow: ApiKeyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, name: string) => Promise<void>;
  isLoading?: boolean;
};

export function ApiKeyManageDialog({
  currentRow,
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: ApiKeyManageDialogProps) {
  const [name, setName] = useState("");

  const canSubmit = useMemo(() => !!currentRow && name.trim().length > 0 && !isLoading, [currentRow, name, isLoading]);

  const handleSave = async () => {
    if (!currentRow || !canSubmit) return;
    await onSave(currentRow.id, name.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && currentRow) {
          setName(currentRow.name ? currentRow.name : "");
        }
        if (!nextOpen) {
          setName("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Manage API Key</DialogTitle>
          <DialogDescription>Update your API key name to keep integrations easy to identify.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="api-key-manage-name">Key Name</Label>
          <Input
            id="api-key-manage-name"
            placeholder="e.g., Backend Worker"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSubmit}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
