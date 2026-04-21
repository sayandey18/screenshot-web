import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PasswordInput } from "@/components/password-input";

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "2fa" | "delete-account";
  enabled?: boolean; // Specific to 2FA
  onSuccess?: () => void;
}

type Step = "password" | "backup-codes" | "disable";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ActionDialog({ open, onOpenChange, type, enabled, onSuccess }: ActionDialogProps) {
  const [step, setStep] = useState<Step>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [hasSavedCodes, setHasSavedCodes] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
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
          const { error } = await authClient.twoFactor.disable({
            password: values.password,
          });
          if (error) throw error;
          await useAuthStore.getState().fetchSession();
          toast.success("Two-factor authentication disabled.");
          onSuccess?.();
          onOpenChange(false);
        } else {
          const { data, error } = await authClient.twoFactor.enable({
            password: values.password,
          });
          if (error) throw error;
          await useAuthStore.getState().fetchSession();
          if (data) {
            setBackupCodes(data.backupCodes);
            setStep("backup-codes");
          }
        }
      } else if (type === "delete-account") {
        const { error } = await authClient.deleteUser({
          password: values.password,
        });
        if (error) throw error;
        useAuthStore.getState().auth.reset();
        toast.success("Account successfully deleted.");
        // Redirect is usually handled by auth provider or window location
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred. Please try again.";
      toast.error(message);
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
      return "This action is permanent and cannot be undone. All your data will be permanently removed. Please enter your password to confirm.";
    if (step === "password")
      return "To enable Email Two-Factor Authentication, please enter your password for security.";
    if (step === "backup-codes")
      return "Your account is now protected. Save these codes in a safe place to access your account if you lose access to your email.";
    if (step === "disable")
      return "Please enter your password to confirm you want to disable Two-Factor Authentication.";
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
