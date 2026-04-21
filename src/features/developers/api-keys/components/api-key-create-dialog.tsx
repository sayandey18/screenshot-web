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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const expiryOptions = [
  { label: "30 days", value: "2592000" },
  { label: "60 days", value: "5184000" },
  { label: "90 days", value: "7776000" },
  { label: "12 months", value: "31536000" },
  { label: "No Expiry", value: "none" },
];

type ApiKeyCreateValues = {
  name: string;
  expiresIn?: number;
};

type ApiKeyCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: ApiKeyCreateValues) => Promise<void>;
  isLoading?: boolean;
};

export function ApiKeyCreateDialog({ open, onOpenChange, onCreate, isLoading = false }: ApiKeyCreateDialogProps) {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("2592000");

  const canSubmit = useMemo(() => name.trim().length > 0 && !isLoading, [name, isLoading]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setName("");
      setExpiry("2592000");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const values: ApiKeyCreateValues = {
      name: name.trim(),
    };

    if (expiry !== "none") {
      values.expiresIn = Number(expiry);
    }

    await onCreate(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key for integrations. Keep it secure and rotate keys regularly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key-name">Key Name</Label>
            <Input
              id="api-key-name"
              placeholder="e.g., Production Service"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key-expiry">Expiry</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger id="api-key-expiry">
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                {expiryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
