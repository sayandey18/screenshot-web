import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type CreatedApiKeyResult = {
  key: string;
};

type ApiKeyCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: ApiKeyCreateValues) => Promise<CreatedApiKeyResult | null>;
  isLoading?: boolean;
};

export function ApiKeyCreateDialog({ open, onOpenChange, onCreate, isLoading = false }: ApiKeyCreateDialogProps) {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("2592000");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const isCreatedStep = createdKey !== null;
  const canSubmit = useMemo(() => name.trim().length > 0 && !isLoading, [name, isLoading]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreatedStep && !acknowledged) {
      toast.error("Please acknowledge that you have saved the API key securely before closing.");
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setName("");
      setExpiry("2592000");
      setCreatedKey(null);
      setCopied(false);
      setAcknowledged(false);
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

    const result = await onCreate(values);
    if (result?.key) {
      setCreatedKey(result.key);
      setCopied(false);
      setAcknowledged(false);
    }
  };

  const copyToClipboard = async () => {
    if (!createdKey) return;

    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("API key copied to clipboard.");
    } catch {
      toast.error("Failed to copy API key.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isCreatedStep ? "API Key Created" : "Create API Key"}</DialogTitle>
          <DialogDescription>
            {isCreatedStep
              ? "This is the only time you can view this API key. Copy and store it securely."
              : "Create a new API key for integrations. Keep it secure and rotate keys regularly."}
          </DialogDescription>
        </DialogHeader>

        {!isCreatedStep ? (
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
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="created-api-key">Your API Key</Label>
              <div className="flex items-center gap-2">
                <Input id="created-api-key" value={createdKey ?? ""} readOnly className="font-mono text-xs" />
                <Button type="button" variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Checkbox
                id="api-key-saved-ack"
                checked={acknowledged}
                onCheckedChange={(value) => setAcknowledged(!!value)}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="api-key-saved-ack" className="text-sm leading-none font-medium">
                  I have saved this API key securely.
                </label>
                <p className="text-xs text-muted-foreground">
                  You won&apos;t be able to see this key again after closing this dialog.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!isCreatedStep ? (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </>
          ) : (
            <Button onClick={() => handleOpenChange(false)} disabled={!acknowledged}>
              I&apos;ve Saved It Securely
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
