import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { sessionKeys } from "@/hooks/api/query-keys";
import { useAccounts } from "@/hooks/api/use-accounts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PasswordInput } from "@/components/password-input";
import { useDisableTwoFactor, useEnableTwoFactor, useDeleteAccount } from "@/features/settings/hooks/use-auth-mutations";

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "2fa" | "delete-account";
  enabled?: boolean;
  onSuccess?: () => void;
}

type Step = "password" | "backup-codes" | "disable";

const passwordSchema = (isRequired: boolean) =>
  z.object({
    password: isRequired ? z.string().min(1, "Password is required") : z.string().optional(),
  });

type PasswordFormValues = z.infer<ReturnType<typeof passwordSchema>>;
type TwoFactorEnableResult = {
  backupCodes?: unknown;
};

function hasStringBackupCodes(data: unknown): data is { backupCodes: string[] } {
  if (typeof data !== "object" || data === null) return false;
  if (!("backupCodes" in data)) return false;

  const backupCodes = (data as TwoFactorEnableResult).backupCodes;
  return Array.isArray(backupCodes) && backupCodes.every((code) => typeof code === "string");
}

export function ActionDialog({ open, onOpenChange, type, enabled, onSuccess }: ActionDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const enableTwoFactor = useEnableTwoFactor();
  const disableTwoFactor = useDisableTwoFactor();
  const deleteAccount = useDeleteAccount();
  const { data: accounts } = useAccounts();
  const hasCredentialAccount = accounts?.some((account) => account.providerId === "credential");

  const [step, setStep] = useState<Step>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [hasSavedCodes, setHasSavedCodes] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema(!!hasCredentialAccount)),
    defaultValues: {
      password: "",
    },
  });

  const reset = () => {
    setStep(type === "2fa" && enabled ? "disable" : "password");
    form.reset();
    setBackupCodes([]);
    setCopied(false);
    setHasSavedCodes(false);
  };

  const handleAction = async (values: PasswordFormValues) => {
    setIsLoading(true);
    try {
      if (type === "2fa") {
        if (enabled) {
          await disableTwoFactor.mutateAsync(values.password);
          toast.success("Two-factor authentication disabled.");
          onSuccess?.();
          onOpenChange(false);
        } else {
          const data = await enableTwoFactor.mutateAsync(values.password);
          if (hasStringBackupCodes(data)) {
            setBackupCodes(data.backupCodes);
            setStep("backup-codes");
          }
          await queryClient.invalidateQueries({ queryKey: sessionKeys.current });
        }
      } else if (type === "delete-account") {
        await deleteAccount.mutateAsync(values.password ?? "");
        toast.success("Account successfully deleted.");
        navigate({ to: "/sign-in", replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onConfirm = () => {
    if (step === "backup-codes") {
      toast.success("Two-factor authentication successfully enabled.");
      onSuccess?.();
      onOpenChange(false);
      return;
    }
    void form.handleSubmit(handleAction)();
  };

  const getTitles = () => {
    if (type === "delete-account") return "Delete Account";
    if (step === "password") return "Confirm Password";
    if (step === "backup-codes") return "Secure Your Backup Codes";
    if (step === "disable") return "Disable Two-Factor Authentication";
    return "";
  };

  const getDescriptions = () => {
    if (type === "delete-account")
      return hasCredentialAccount
        ? "This action is permanent and cannot be undone. All your data will be permanently removed. Please enter your password to confirm."
        : "This action is permanent and cannot be undone. All your data will be permanently removed.";
    if (step === "password")
      return hasCredentialAccount
        ? "To enable Email Two-Factor Authentication, please enter your password for security."
        : "To enable Email Two-Factor Authentication, please click confirm to proceed.";
    if (step === "backup-codes")
      return "Your account is now protected. Save these codes in a safe place to access your account if you lose access to your email.";
    if (step === "disable")
      return hasCredentialAccount
        ? "Please enter your password to confirm you want to disable Two-Factor Authentication."
        : "Are you sure you want to disable Two-Factor Authentication?";
    return "";
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "backup-codes-email-2fa.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded.");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Backup codes copied to clipboard.");
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(val) => {
        if (step === "backup-codes" && !hasSavedCodes && val === false) {
          toast.error("Save backup codes & confirm before closing.");
          return;
        }
        if (!val) reset();
        onOpenChange(val);
      }}
      title={getTitles()}
      desc={getDescriptions()}
      confirmText={
        type === "delete-account" ? "Delete Account" : step === "backup-codes" ? "Complete Setup" : "Confirm"
      }
      destructive={type === "delete-account" || step === "disable"}
      isLoading={isLoading}
      disabled={step === "backup-codes" && !hasSavedCodes}
      handleConfirm={onConfirm}
      className="sm:max-w-md"
    >
      <div className="space-y-4">
        {step !== "backup-codes" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAction)} className="space-y-4">
              {hasCredentialAccount && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{type === "delete-account" ? "Confirm Password" : "Password"}</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        )}

        {step === "backup-codes" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Backup Codes</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8">
                    {copied ? <Check className="mr-2 h-3 w-3" /> : <Copy className="mr-2 h-3 w-3" />}
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadBackupCodes} className="h-8">
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-40 rounded-md border p-3">
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {backupCodes.map((code) => (
                    <div key={code} className="rounded bg-muted/50 p-1 text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex items-start space-x-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Checkbox id="saved-codes" checked={hasSavedCodes} onCheckedChange={(val) => setHasSavedCodes(!!val)} />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="saved-codes"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have saved my backup codes securely.
                </label>
                <p className="text-xs text-muted-foreground">
                  You understand that you will need these codes to access your account if you lose access to your email.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
